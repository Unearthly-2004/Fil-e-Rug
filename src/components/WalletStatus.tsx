import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle, CheckCircle, Coins, Database } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";

const WalletStatus = () => {
  const { 
    address, 
    isConnected, 
    isCalibnet, 
    tfilBalance, 
    tusdfcBalance, 
    hasEnoughBalance,
    connect, 
    disconnect, 
    switchToCalibnet,
    isConnecting 
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "MetaMask connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToCalibnet();
      toast({
        title: "Network Switched",
        description: "Switched to Filecoin Calibnet",
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch to Filecoin Calibnet",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-gray-500" />
            <span>Wallet Not Connected</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p>Connect your MetaMask wallet to participate in voting and file storage.</p>
          </div>
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Wallet Connected</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Address:</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </code>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network:</span>
          {isCalibnet ? (
            <Badge className="bg-green-100 text-green-800">
              <Database className="h-3 w-3 mr-1" />
              Filecoin Calibnet
            </Badge>
          ) : (
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Wrong Network
              </Badge>
              <Button size="sm" onClick={handleSwitchNetwork}>
                Switch
              </Button>
            </div>
          )}
        </div>

        {/* Balances */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              tFIL Balance:
            </span>
            <span className="text-sm">{tfilBalance} tFIL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              tUSDFC Balance:
            </span>
            <span className="text-sm">{tusdfcBalance} tUSDFC</span>
          </div>
        </div>

        {/* Balance Warning */}
        {!hasEnoughBalance() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Insufficient balance. You need at least 0.01 tFIL and 0.1 tUSDFC.
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            onClick={() => disconnect()} 
            variant="outline" 
            className="flex-1"
          >
            Disconnect
          </Button>
          {!isCalibnet && (
            <Button 
              onClick={handleSwitchNetwork} 
              className="flex-1"
            >
              Switch to Calibnet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletStatus; 