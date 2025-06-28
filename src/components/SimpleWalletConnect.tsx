import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { filecoinCalibnet } from '@/lib/wagmi-config';

const SimpleWalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const handleConnect = async () => {
    console.log('Connect button clicked');
    setIsConnecting(true);
    
    try {
      const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
      console.log('Available connectors:', connectors);
      console.log('MetaMask connector:', metaMaskConnector);
      
      if (metaMaskConnector) {
        console.log('Attempting to connect with MetaMask...');
        connect({ connector: metaMaskConnector });
      } else {
        console.error('MetaMask connector not found');
        alert('MetaMask connector not found. Please make sure MetaMask is installed.');
      }
    } catch (err) {
      console.error('Connection error:', err);
      alert('Failed to connect: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    console.log('Disconnect button clicked');
    disconnect();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Simple Wallet Connect</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p><strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
          <p><strong>Address:</strong> {address || 'Not connected'}</p>
          <p><strong>Chain ID:</strong> {chainId || 'Unknown'}</p>
          <p><strong>Is Calibnet:</strong> {chainId === filecoinCalibnet.id ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Connectors:</strong> {connectors.length}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div className="space-y-2">
          {!isConnected ? (
            <Button 
              onClick={handleConnect}
              disabled={isPending || isConnecting}
              className="w-full"
            >
              {isPending || isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          ) : (
            <Button 
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
            >
              Disconnect
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Debug Info:</strong></p>
          <p>Connectors: {connectors.map(c => c.id).join(', ')}</p>
          <p>Pending: {isPending ? 'Yes' : 'No'}</p>
          <p>Connecting: {isConnecting ? 'Yes' : 'No'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleWalletConnect; 