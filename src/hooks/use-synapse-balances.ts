import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { synapseConfig, calculateStorageMetrics } from '@/lib/synapse-config';
import { toast } from 'sonner';
import { Synapse, TOKENS } from '@filoz/synapse-sdk';

// Minimal ERC20 ABI for balanceOf and decimals
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

interface BalanceData {
  filBalance: string;
  usdfcBalance: string;
  pandoraBalance: string;
  persistenceDaysLeft: number;
  isSufficient: boolean;
  rateNeeded: string;
  lockUpNeeded: string;
  depositNeeded: string;
  storageUsage: number;
  storageCapacity: number;
}

export const useSynapseBalances = () => {
  const [data, setData] = useState<BalanceData>({
    filBalance: '0',
    usdfcBalance: '0',
    pandoraBalance: '0',
    persistenceDaysLeft: 0,
    isSufficient: false,
    rateNeeded: '0',
    lockUpNeeded: '0',
    depositNeeded: '0',
    storageUsage: 0,
    storageCapacity: synapseConfig.storageCapacity,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { provider, address, isConnected, isCalibnet } = useWallet();

  const fetchBalances = async () => {
    if (!provider || !address || !isCalibnet) {
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // 1. Get FIL balance (native)
      const filBalanceRaw = await Synapse.walletBalance(TOKENS.FIL);
      const filBalance = filBalanceRaw.toString();

      // 2. Get USDFC balance (ERC20)
      const usdfcBalanceRaw = await Synapse.payments.walletBalance(TOKENS.USDFC);
      const usdfcBalance = usdfcBalanceRaw.toString();

      // 3. Get Pandora balance (ERC20)
      const pandoraBalanceRaw = await Synapse.payments.walletBalance(TOKENS.PANDORA);
      const pandoraBalance = pandoraBalanceRaw.toString();

      const metrics = calculateStorageMetrics(synapseConfig);
      const persistenceDaysLeft = Math.floor(
        parseFloat(pandoraBalance) / metrics.dailyCost
      );
      const isSufficient = persistenceDaysLeft >= synapseConfig.minDaysThreshold;

      setData({
        filBalance,
        usdfcBalance,
        pandoraBalance,
        persistenceDaysLeft,
        isSufficient,
        rateNeeded: metrics.rateAllowance.toString(),
        lockUpNeeded: metrics.lockupAllowance.toString(),
        depositNeeded: (metrics.lockupAllowance - parseFloat(pandoraBalance)).toString(),
        storageUsage: 0, // Replace with real usage if available
        storageCapacity: synapseConfig.storageCapacity,
      });

    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      toast.error("Failed to fetch wallet balances");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && isCalibnet) {
      fetchBalances();
      // Refresh balances every 30 seconds
      const interval = setInterval(fetchBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [provider, address, isConnected, isCalibnet]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchBalances,
  };
}; 