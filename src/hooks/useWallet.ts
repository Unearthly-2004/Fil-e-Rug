import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect, useBalance } from 'wagmi';
import { filecoinCalibnet } from '@/lib/wagmi-config';
import { useState, useEffect } from 'react';

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Get tFIL balance
  const { data: tfilBalance } = useBalance({
    address,
    chainId: filecoinCalibnet.id,
  });

  // Get tUSDFC balance (you'll need the contract address)
  const { data: tusdfcBalance } = useBalance({
    address,
    chainId: filecoinCalibnet.id,
    token: '0x...', // Replace with actual tUSDFC contract address on Calibnet
  });

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Debug: Log available connectors
      console.log('Available connectors:', connectors);
      
      const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
      console.log('MetaMask connector found:', metaMaskConnector);
      
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
      } else {
        // Check if MetaMask is available in window object
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('MetaMask detected in window.ethereum');
          // Try to connect using the first available connector
          if (connectors.length > 0) {
            await connect({ connector: connectors[0] });
          } else {
            throw new Error('No connectors available. Please check your wallet configuration.');
          }
        } else {
          throw new Error('MetaMask not found. Please install MetaMask extension and refresh the page.');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToCalibnet = async () => {
    try {
      await switchChain({ chainId: filecoinCalibnet.id });
    } catch (error) {
      console.error("Failed to switch to Calibnet:", error);
      throw error;
    }
  };

  return { 
    provider: connector?.client,
    address, 
    chainId: chainId?.toString(), 
    connect: connectWallet,
    disconnect,
    switchToCalibnet,
    isConnecting,
    isConnected,
    isCalibnet: chainId === filecoinCalibnet.id,
    tfilBalance: tfilBalance?.formatted || '0',
    tusdfcBalance: tusdfcBalance?.formatted || '0',
    hasEnoughBalance: () => {
      const tfil = parseFloat(tfilBalance?.formatted || '0');
      const tusdfc = parseFloat(tusdfcBalance?.formatted || '0');
      return tfil > 0.01 && tusdfc > 0.1; // Minimum required balances
    }
  };
} 