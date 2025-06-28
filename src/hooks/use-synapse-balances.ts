import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { synapseConfig, calculateStorageMetrics } from '@/lib/synapse-config';
import { toast } from 'sonner';

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
      // Mock balance fetching - replace with actual Synapse SDK calls
      const mockBalances = {
        filBalance: '1.5',
        usdfcBalance: '100.0',
        pandoraBalance: '50.0',
        storageUsage: 2.5, // GB
      };

      const metrics = calculateStorageMetrics(synapseConfig);
      const persistenceDaysLeft = Math.floor(
        parseFloat(mockBalances.pandoraBalance) / metrics.dailyCost
      );

      const isSufficient = persistenceDaysLeft >= synapseConfig.minDaysThreshold;

      setData({
        filBalance: mockBalances.filBalance,
        usdfcBalance: mockBalances.usdfcBalance,
        pandoraBalance: mockBalances.pandoraBalance,
        persistenceDaysLeft,
        isSufficient,
        rateNeeded: metrics.rateAllowance.toString(),
        lockUpNeeded: metrics.lockupAllowance.toString(),
        depositNeeded: (metrics.lockupAllowance - parseFloat(mockBalances.pandoraBalance)).toString(),
        storageUsage: mockBalances.storageUsage,
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