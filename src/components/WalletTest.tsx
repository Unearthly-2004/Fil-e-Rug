import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletTest = () => {
  const { address, isConnected, isCalibnet, switchToCalibnet } = useWallet();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wallet Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Connection Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
          <p><strong>Address:</strong> {address || 'Not connected'}</p>
          <p><strong>Network:</strong> {isCalibnet ? 'Filecoin Calibnet' : 'Other'}</p>
          <p><strong>Available Connectors:</strong> {connectors.map(c => c.id).join(', ')}</p>
        </div>
        
        <div className="space-y-2">
          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isPending} className="w-full">
              {isPending ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button onClick={() => disconnect()} className="w-full">
                Disconnect
              </Button>
              {!isCalibnet && (
                <Button onClick={switchToCalibnet} className="w-full">
                  Switch to Calibnet
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletTest; 