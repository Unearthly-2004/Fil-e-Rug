import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Hash,
  Clock,
  RefreshCw,
  ExternalLink,
  Shield
} from "lucide-react";
import { useLighthouseStorage } from "@/hooks/use-lighthouse-storage";
import { ChainData } from "@/lib/lighthouse-storage";
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { VOTE_STORAGE_CONTRACT_ADDRESS, VOTE_STORAGE_CONTRACT_ABI } from '@/lib/vote-storage-contract';
import { ethers } from 'ethers';

const LighthouseStorage = () => {
  const { 
    storeChainData, 
    uploadVote, 
    uploadText,
    isStoring, 
    isUploadingVote,
    storageStats,
    ruggedChains,
    safeChains,
    pendingChains,
    loadingRugged,
    loadingSafe,
    loadingPending,
    verifyStorageProof,
    refreshData
  } = useLighthouseStorage();

  const [textToUpload, setTextToUpload] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [voteData, setVoteData] = useState({
    proposalId: '',
    vote: 'rug',
    reasoning: '',
    confidence: 80
  });

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
      description: "A demo token for testing Lighthouse storage",
      category: "Demo",
      timeLeft: "Active"
    }
  });

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('upload');
  const [lastVoteCid, setLastVoteCid] = useState<string | null>(null);
  const [onChainTxStatus, setOnChainTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>("idle");
  const [onChainTxHash, setOnChainTxHash] = useState<string | null>(null);
  const [onChainError, setOnChainError] = useState<string | null>(null);

  // On mount, check for ?vote=TOKEN_NAME and set Vote tab and Proposal ID
  useEffect(() => {
    const voteParam = searchParams.get('vote');
    if (voteParam) {
      setActiveTab('vote');
      setVoteData(prev => ({ ...prev, proposalId: voteParam }));
    }
  }, [searchParams]);

  const handleTextUpload = async () => {
    if (!textToUpload.trim()) {
      alert("Please enter some text to upload");
      return;
    }

    const result = await uploadText(textToUpload, uploadName);
    if (result.success) {
      setTextToUpload('');
      setUploadName('');
    }
  };

  const handleVoteUpload = async () => {
    if (!voteData.proposalId || !voteData.reasoning) {
      alert("Please fill in all required fields");
      return;
    }
    const result = await uploadVote(voteData, 'demo-wallet-id');
    if (result.success && result.cid) {
      setLastVoteCid(result.cid);
    }
    setVoteData({
      proposalId: '',
      vote: 'rug',
      reasoning: '',
      confidence: 80
    });
  };

  const handleStoreCidOnChain = async () => {
    if (!lastVoteCid) return;
    setOnChainTxStatus('pending');
    setOnChainError(null);
    setOnChainTxHash(null);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        VOTE_STORAGE_CONTRACT_ADDRESS,
        VOTE_STORAGE_CONTRACT_ABI,
        signer
      );
      const tx = await contract.submitVote(lastVoteCid);
      setOnChainTxHash(tx.hash);
      await tx.wait();
      setOnChainTxStatus('success');
    } catch (err: any) {
      setOnChainTxStatus('error');
      setOnChainError(err?.message || 'Transaction failed');
    }
  };

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
          description: "A demo token for testing Lighthouse storage",
          category: "Demo",
          timeLeft: "Active"
        }
      });
    } catch (error) {
      console.error("Failed to store demo chain:", error);
    }
  };

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
            Lighthouse Storage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized storage powered by Lighthouse Web3 SDK
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
              <h3 className="text-2xl font-bold">5 GB</h3>
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="vote" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Vote</span>
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Demo</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Storage</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Text to Lighthouse
                </CardTitle>
                <CardDescription>
                  Upload any text data to decentralized storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="upload-name">Name (Optional)</Label>
                  <Input
                    id="upload-name"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Enter a name for your upload"
                  />
                </div>
                <div>
                  <Label htmlFor="upload-text">Text Content</Label>
                  <Textarea
                    id="upload-text"
                    value={textToUpload}
                    onChange={(e) => setTextToUpload(e.target.value)}
                    placeholder="Enter the text you want to upload..."
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleTextUpload}
                  disabled={!textToUpload.trim()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Lighthouse
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vote Tab */}
          <TabsContent value="vote" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Upload Vote Data
                </CardTitle>
                <CardDescription>
                  Store vote data on decentralized storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proposal-id">Proposal ID</Label>
                  <Input
                    id="proposal-id"
                    value={voteData.proposalId}
                    onChange={(e) => setVoteData(prev => ({ ...prev, proposalId: e.target.value }))}
                    placeholder="Enter proposal ID"
                  />
                </div>
                <div>
                  <Label htmlFor="vote-type">Vote Type</Label>
                  <select
                    id="vote-type"
                    value={voteData.vote}
                    onChange={(e) => setVoteData(prev => ({ ...prev, vote: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="rug">Rug</option>
                    <option value="safe">Safe</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="confidence">Confidence Level</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="0"
                    max="100"
                    value={voteData.confidence}
                    onChange={(e) => setVoteData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <Label htmlFor="reasoning">Reasoning</Label>
                  <Textarea
                    id="reasoning"
                    value={voteData.reasoning}
                    onChange={(e) => setVoteData(prev => ({ ...prev, reasoning: e.target.value }))}
                    placeholder="Explain your reasoning..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleVoteUpload}
                  disabled={!voteData.proposalId || !voteData.reasoning || isUploadingVote}
                  className="w-full"
                >
                  {isUploadingVote ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading Vote...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Upload Vote
                    </>
                  )}
                </Button>
                {lastVoteCid && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="mb-2 text-sm text-blue-800">
                      <strong>Vote CID:</strong> {lastVoteCid}
                    </div>
                    <Button
                      onClick={handleStoreCidOnChain}
                      disabled={onChainTxStatus === 'pending'}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                      {onChainTxStatus === 'pending' ? 'Storing On-Chain...' : 'Store CID On-Chain'}
                    </Button>
                    {onChainTxStatus === 'success' && (
                      <div className="mt-2 text-green-700 text-sm">Vote stored on-chain! Tx: <a href={`https://calibration.filfox.info/en/tx/${onChainTxHash}`} target="_blank" rel="noopener noreferrer" className="underline">{onChainTxHash?.slice(0, 10)}...</a></div>
                    )}
                    {onChainTxStatus === 'error' && (
                      <div className="mt-2 text-red-700 text-sm">Error: {onChainError}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demo Tab */}
          <TabsContent value="demo" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Demo Chain Storage
                </CardTitle>
                <CardDescription>
                  Test chain data storage functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="demo-name">Chain Name</Label>
                  <Input
                    id="demo-name"
                    value={demoChain.name}
                    onChange={(e) => setDemoChain(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter chain name"
                  />
                </div>
                <div>
                  <Label htmlFor="demo-blockchain">Blockchain</Label>
                  <Input
                    id="demo-blockchain"
                    value={demoChain.blockchain}
                    onChange={(e) => setDemoChain(prev => ({ ...prev, blockchain: e.target.value }))}
                    placeholder="Ethereum, Solana, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="demo-contract">Contract Address</Label>
                  <Input
                    id="demo-contract"
                    value={demoChain.contractAddress}
                    onChange={(e) => setDemoChain(prev => ({ ...prev, contractAddress: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="demo-description">Description</Label>
                  <Textarea
                    id="demo-description"
                    value={demoChain.metadata?.description}
                    onChange={(e) => setDemoChain(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata!, description: e.target.value }
                    }))}
                    placeholder="Enter chain description"
                  />
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
                      Store Demo Chain
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="mt-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default LighthouseStorage; 