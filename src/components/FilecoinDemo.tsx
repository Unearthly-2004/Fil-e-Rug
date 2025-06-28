import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Hash
} from "lucide-react";
import { useState } from "react";
import { useFilecoinStorage } from "@/hooks/use-filecoin-storage";
import { ChainData } from "@/lib/filecoin-storage";

const FilecoinDemo = () => {
  const { storeChainData, isStoring, storageStats } = useFilecoinStorage();
  const [demoChain, setDemoChain] = useState<Partial<ChainData>>({
    name: "Demo Token",
    blockchain: "Ethereum",
    contractAddress: "0x1234567890abcdef",
    riskFactors: ["New project", "Low liquidity"],
    voteResults: {
      rugVotes: 45,
      noRugVotes: 55,
      totalVotes: 100
    },
    finalDecision: 'pending',
    metadata: {
      description: "A demo token for testing Filecoin storage",
      category: "Demo",
      timeLeft: "Active"
    }
  });

  const handleStoreDemo = async () => {
    if (!demoChain.name || !demoChain.blockchain) {
      alert("Please fill in all required fields");
      return;
    }

    const chainData: ChainData = {
      id: `DEMO-${Date.now()}`,
      name: demoChain.name,
      blockchain: demoChain.blockchain,
      contractAddress: demoChain.contractAddress,
      riskFactors: demoChain.riskFactors || [],
      voteResults: demoChain.voteResults || {
        rugVotes: 0,
        noRugVotes: 0,
        totalVotes: 0
      },
      finalDecision: demoChain.finalDecision || 'pending',
      timestamp: Date.now(),
      metadata: demoChain.metadata || {
        description: "",
        category: "",
        timeLeft: ""
      }
    };

    try {
      await storeChainData(chainData);
      // Reset form
      setDemoChain({
        name: "Demo Token",
        blockchain: "Ethereum",
        contractAddress: "0x1234567890abcdef",
        riskFactors: ["New project", "Low liquidity"],
        voteResults: {
          rugVotes: 45,
          noRugVotes: 55,
          totalVotes: 100
        },
        finalDecision: 'pending',
        metadata: {
          description: "A demo token for testing Filecoin storage",
          category: "Demo",
          timeLeft: "Active"
        }
      });
    } catch (error) {
      console.error("Failed to store demo chain:", error);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Filecoin Storage Demo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test the decentralized storage functionality with demo chain data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Demo Storage</Badge>
              </div>
              <CardTitle className="text-2xl">Store Demo Chain</CardTitle>
              <CardDescription>
                Create and store a demo chain on Filecoin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Chain Name</Label>
                  <Input
                    id="name"
                    value={demoChain.name}
                    onChange={(e) => setDemoChain(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter chain name"
                  />
                </div>

                <div>
                  <Label htmlFor="blockchain">Blockchain</Label>
                  <Input
                    id="blockchain"
                    value={demoChain.blockchain}
                    onChange={(e) => setDemoChain(prev => ({ ...prev, blockchain: e.target.value }))}
                    placeholder="Ethereum, Solana, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="contract">Contract Address</Label>
                  <Input
                    id="contract"
                    value={demoChain.contractAddress}
                    onChange={(e) => setDemoChain(prev => ({ ...prev, contractAddress: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={demoChain.metadata?.description}
                    onChange={(e) => setDemoChain(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata!, description: e.target.value }
                    }))}
                    placeholder="Enter chain description"
                  />
                </div>

                <div>
                  <Label>Risk Factors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {demoChain.riskFactors?.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleStoreDemo}
                  disabled={isStoring}
                  className="w-full"
                >
                  {isStoring ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Storing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Store on Filecoin
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Storage Info</Badge>
              </div>
              <CardTitle className="text-2xl">Storage Statistics</CardTitle>
              <CardDescription>
                Current Filecoin storage status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-red-600">{storageStats.ruggedCount}</h3>
                    <p className="text-sm text-gray-600">Rugged Chains</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-600">{storageStats.safeCount}</h3>
                    <p className="text-sm text-gray-600">Safe Chains</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Total Storage</span>
                    </div>
                    <span className="text-sm text-gray-600">{storageStats.totalStorage}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Pending Review</span>
                    </div>
                    <span className="text-sm text-gray-600">{storageStats.pendingCount}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Chain data is stored on IPFS with cryptographic proof</li>
                    <li>• Data is categorized as rugged, safe, or pending</li>
                    <li>• Each storage operation generates a unique CID</li>
                    <li>• All data is immutable and verifiable</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FilecoinDemo; 