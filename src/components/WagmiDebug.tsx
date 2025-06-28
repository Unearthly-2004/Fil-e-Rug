import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { filecoinCalibnet } from '@/lib/wagmi-config';

const WagmiDebug = () => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Wagmi Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Connection Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </div>
          <div>
            <strong>Chain ID:</strong> {chainId || 'Unknown'}
          </div>
          <div>
            <strong>Address:</strong> {address || 'Not connected'}
          </div>
          <div>
            <strong>Connector:</strong> {connector?.id || 'None'}
          </div>
          <div>
            <strong>Is Calibnet:</strong> {chainId === filecoinCalibnet.id ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Pending:</strong> {isPending ? '✅ Yes' : '❌ No'}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div>
          <strong>Available Connectors:</strong>
          <ul className="mt-2 space-y-1">
            {connectors.map((connector) => (
              <li key={connector.id} className="text-sm">
                • {connector.id} - {connector.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-2">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isPending ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          ) : (
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Filecoin Calibnet Config:</strong></p>
          <pre className="mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(filecoinCalibnet, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default WagmiDebug; 