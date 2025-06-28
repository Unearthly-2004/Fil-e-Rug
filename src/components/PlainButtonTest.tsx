import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const PlainButtonTest = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    console.log('Plain button clicked - attempting to connect');
    const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      alert('MetaMask not found');
    }
  };

  const handleDisconnect = () => {
    console.log('Plain disconnect button clicked');
    disconnect();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Plain Button Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p><strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
          <p><strong>Address:</strong> {address || 'Not connected'}</p>
          <p><strong>Connectors:</strong> {connectors.length}</p>
        </div>

        <div className="space-y-2">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Connect MetaMask (Plain Button)
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              Disconnect (Plain Button)
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Test Info:</strong></p>
          <p>This uses plain HTML buttons to test if the issue is with UI components</p>
          <p>Check browser console for click events</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlainButtonTest; 