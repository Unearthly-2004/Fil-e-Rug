import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  Network, 
  Copy,
  ExternalLink
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const WalletDemo = () => {
  const { 
    address, 
    connect, 
    disconnect, 
    switchToCalibnet, 
    isConnecting, 
    isConnected, 
    isCalibnet 
  } = useWallet();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const openExplorer = () => {
    if (address && isCalibnet) {
      window.open(`https://calibration.filfox.info/en/address/${address}`, '_blank');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            MetaMask Integration
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your wallet to participate in on-chain voting on Filecoin Calibnet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Wallet className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Wallet Status</Badge>
              </div>
              <CardTitle className="text-2xl">MetaMask Connection</CardTitle>
              <CardDescription>
                Connect your MetaMask wallet to start voting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isConnected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {isConnected ? "Connected" : "Not Connected"}
                    </span>
                  </div>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Network Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Network className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Network</span>
                  </div>
                  <Badge variant={isCalibnet ? "default" : "destructive"}>
                    {isCalibnet ? "Calibnet" : "Wrong Network"}
                  </Badge>
                </div>

                {/* Wallet Address */}
                {isConnected && address && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Wallet Address</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-white px-2 py-1 rounded border">
                        {address}
                      </code>
                      {isCalibnet && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openExplorer}
                          className="h-6 px-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!isConnected ? (
                    <Button
                      onClick={connect}
                      disabled={isConnecting}
                      className="w-full"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      {isConnecting ? "Connecting..." : "Connect MetaMask"}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      {!isCalibnet && (
                        <Button
                          onClick={switchToCalibnet}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <Network className="h-4 w-4 mr-2" />
                          Switch to Calibnet
                        </Button>
                      )}
                      <Button
                        onClick={disconnect}
                        variant="outline"
                        className="w-full"
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Setup Guide</Badge>
              </div>
              <CardTitle className="text-2xl">How to Vote</CardTitle>
              <CardDescription>
                Follow these steps to participate in on-chain voting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Install MetaMask</h4>
                    <p className="text-gray-600 text-sm">
                      Make sure you have MetaMask browser extension installed
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Connect Wallet</h4>
                    <p className="text-gray-600 text-sm">
                      Click "Connect MetaMask" to link your wallet to the app
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Switch to Calibnet</h4>
                    <p className="text-gray-600 text-sm">
                      Switch to Filecoin Calibration testnet to vote
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Start Voting</h4>
                    <p className="text-gray-600 text-sm">
                      Navigate to the Governance section and vote on proposals
                    </p>
                  </div>
                </div>

                {/* Network Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Calibnet Network Info</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><strong>Network Name:</strong> Filecoin - Calibration</div>
                    <div><strong>RPC URL:</strong> https://api.calibration.node.glif.io/rpc/v1</div>
                    <div><strong>Chain ID:</strong> 314159</div>
                    <div><strong>Currency:</strong> tFIL</div>
                    <div><strong>Explorer:</strong> https://calibration.filfox.info/en</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WalletDemo; 