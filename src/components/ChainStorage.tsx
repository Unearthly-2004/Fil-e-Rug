import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  RefreshCw,
  FileText,
  Hash,
  Clock
} from "lucide-react";
import { useFilecoinStorage } from "@/hooks/use-filecoin-storage";
import { ChainData } from "@/lib/filecoin-storage";

const ChainStorage = () => {
  const {
    ruggedChains,
    safeChains,
    pendingChains,
    storageStats,
    loadingRugged,
    loadingSafe,
    loadingPending,
    loadingStats,
    verifyStorageProof,
    refreshData,
  } = useFilecoinStorage();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'rugged':
        return <Badge className="bg-red-100 text-red-800">Confirmed Rug</Badge>;
      case 'safe':
        return <Badge className="bg-green-100 text-green-800">Confirmed Safe</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderChainCard = (chain: ChainData) => (
    <Card key={chain.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{chain.id}</Badge>
          {getDecisionBadge(chain.finalDecision)}
        </div>
        <CardTitle className="text-xl">{chain.name}</CardTitle>
        <CardDescription>{chain.metadata.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Blockchain Info */}
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{chain.blockchain}</span>
            {chain.contractAddress && (
              <Badge variant="secondary" className="text-xs">
                {chain.contractAddress.slice(0, 8)}...{chain.contractAddress.slice(-6)}
              </Badge>
            )}
          </div>

          {/* Risk Factors */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">Risk Factors:</h4>
            <div className="flex flex-wrap gap-2">
              {chain.riskFactors.map((factor, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          {/* Voting Results */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">Final Vote Results:</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">RUG: {chain.voteResults.rugVotes}</span>
                <span className="text-green-600">SAFE: {chain.voteResults.noRugVotes}</span>
                <span className="text-gray-600">Total: {chain.voteResults.totalVotes}</span>
              </div>
            </div>
          </div>

          {/* Storage Proof */}
          {chain.storageProof && (
            <div className="pt-3 border-t">
              <h4 className="font-semibold mb-2 text-sm">Storage Proof:</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Hash className="h-3 w-3" />
                  <span>CID: {chain.storageProof.cid}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>Stored: {formatTimestamp(chain.storageProof.timestamp)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => verifyStorageProof(chain)}
              className="flex-1"
            >
              <FileText className="h-3 w-3 mr-1" />
              Verify
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Filecoin Chain Storage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized storage of community voting results with cryptographic proof
          </p>
        </div>

        {/* Storage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">{storageStats.ruggedCount}</h3>
              <p className="text-gray-600">Rugged Chains</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">{storageStats.safeCount}</h3>
              <p className="text-gray-600">Safe Chains</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">{storageStats.pendingCount}</h3>
              <p className="text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">{storageStats.totalStorage}</h3>
              <p className="text-gray-600">Total Storage</p>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={refreshData}
            disabled={loadingRugged || loadingSafe || loadingPending}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${(loadingRugged || loadingSafe || loadingPending) ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        </div>

        {/* Chain Categories */}
        <Tabs defaultValue="rugged" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rugged" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Rugged ({ruggedChains.length})</span>
            </TabsTrigger>
            <TabsTrigger value="safe" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Safe ({safeChains.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingChains.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rugged" className="mt-6">
            {loadingRugged ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading rugged chains...</p>
              </div>
            ) : ruggedChains.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ruggedChains.map(renderChainCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No rugged chains found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="safe" className="mt-6">
            {loadingSafe ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading safe chains...</p>
              </div>
            ) : safeChains.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {safeChains.map(renderChainCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No safe chains found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {loadingPending ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading pending chains...</p>
              </div>
            ) : pendingChains.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingChains.map(renderChainCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending chains found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ChainStorage; 