import { useState } from 'react';
import { useWallet } from './useWallet';
import { toast } from 'sonner';

interface PaymentParams {
  lockupAllowance: bigint;
  epochRateAllowance: bigint;
  depositAmount: bigint;
}

export const useSynapsePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { provider, address, isConnected, isCalibnet, hasEnoughBalance } = useWallet();

  const handlePayment = async (params: PaymentParams) => {
    if (!isConnected) {
      toast.error("Please connect your MetaMask wallet");
      return { success: false, error: "Wallet not connected" };
    }

    if (!isCalibnet) {
      toast.error("Please switch to Filecoin Calibnet");
      return { success: false, error: "Wrong network" };
    }

    if (!hasEnoughBalance()) {
      toast.error("Insufficient balance for payment");
      return { success: false, error: "Insufficient balance" };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock payment process - replace with actual Synapse SDK calls
      toast.info("Processing payment...");
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      const txHash = "0x" + Math.random().toString(16).substr(2, 64);
      
      toast.success(`Payment successful! Tx: ${txHash.slice(0, 10)}...`);
      
      return {
        success: true,
        txHash,
        lockupAllowance: params.lockupAllowance,
        epochRateAllowance: params.epochRateAllowance,
        depositAmount: params.depositAmount,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      toast.error(`Payment failed: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePayment,
    isLoading,
    error,
  };
}; 