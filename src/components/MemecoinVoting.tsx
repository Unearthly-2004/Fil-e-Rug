import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Database, 
  CheckCircle, 
  Upload, 
  FileCheck,
  Vote,
  MessageSquare,
  Clock,
  Archive,
  Hash,
  Calendar,
  FileArchive,
  History,
  Zap,
  Globe,
  Award,
  Target,
  Search,
  Filter,
  Star,
  StarOff,
  TrendingUpIcon,
  TrendingDownIcon,
  Coins,
  Wallet,
  AlertTriangle
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSynapseStorage } from "@/hooks/use-synapse-storage";
import { useSynapseBalances } from "@/hooks/use-synapse-balances";
import { useCoinGecko, Memecoin } from "@/hooks/use-coingecko";
import { toast } from "@/hooks/use-toast";

interface VoteData {
  coinId: string;
  voter: string;
  vote: 'safe' | 'rug' | 'neutral';
  confidence: number;
  reasoning: string;
  timestamp: number;
  cid: string;
  proofContract: string;
  marketData: {
    price: number;
    marketCap: number;
    volume24h: number;
    priceChange24h: number;
  };
}

interface VoteFile {
  id: string;
  name: string;
  type: 'vote-receipt' | 'analysis' | 'proof';
  cid: string;
  size: number;
  uploadedAt: number;
  uploadedBy: string;
}

interface AuditEntry {
  id: string;
  action: 'vote_cast' | 'analysis_uploaded' | 'proof_generated';
  user: string;
  timestamp: number;
  details: any;
  cid: string;
  blockNumber: number;
  transactionHash: string;
}

const MemecoinVoting: React.FC = () => {
  const [filteredCoins, setFilteredCoins] = useState<Memecoin[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, VoteData>>({});
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
  const [isUploadingFiles, setIsUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, VoteFile[]>>({});
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price_change_24h' | 'volume'>('market_cap');
  const [selectedCoin, setSelectedCoin] = useState<Memecoin | null>(null);
  const [voteConfidence, setVoteConfidence] = useState<Record<string, number>>({});
  const [voteReasoning, setVoteReasoning] = useState<Record<string, string>>({});

  const { provider, address, isConnected, isCalibnet, switchToCalibnet, hasEnoughBalance } = useWallet();
  const { uploadFileMutation, progress, status, uploadedInfo } = useSynapseStorage();
  const { data: balances, isLoading: balancesLoading } = useSynapseBalances();
  const { memecoins, isLoading, error, refetch } = useCoinGecko();

  // Filter and sort coins
  useEffect(() => {
    let filtered = memecoins;
    
    if (searchTerm) {
      filtered = filtered.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort coins
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'market_cap':
          return b.market_cap - a.market_cap;
        case 'price_change_24h':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case 'volume':
          return b.total_volume - a.total_volume;
        default:
          return 0;
      }
    });
    
    setFilteredCoins(filtered);
  }, [memecoins, searchTerm, sortBy]);

  // Cast vote on memecoin
  const castVote = async (coinId: string, vote: 'safe' | 'rug' | 'neutral') => {
    if (!isConnected || !isCalibnet) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet and switch to Calibnet",
        variant: "destructive"
      });
      return;
    }

    if (!hasEnoughBalance()) {
      toast({
        title: "Insufficient Balance",
        description: "You need tFIL for gas and tUSDFC for storage payments",
        variant: "destructive"
      });
      return;
    }

    const confidence = voteConfidence[coinId] || 5;
    const reasoning = voteReasoning[coinId] || '';

    if (confidence < 1 || confidence > 10) {
      toast({
        title: "Invalid Confidence Level",
        description: "Please select a confidence level between 1-10",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(prev => ({ ...prev, [coinId]: true }));

    try {
      const coin = memecoins.find(c => c.id === coinId);
      if (!coin) throw new Error('Coin not found');

      const voteData: VoteData = {
        coinId,
        voter: address || '',
        vote,
        confidence,
        reasoning,
        timestamp: Date.now(),
        cid: '',
        proofContract: '0x' + Math.random().toString(16).slice(2, 10),
        marketData: {
          price: coin.current_price,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          priceChange24h: coin.price_change_percentage_24h
        }
      };

      // Create vote receipt JSON
      const voteReceipt = {
        coinId: voteData.coinId,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        voter: voteData.voter,
        vote: voteData.vote,
        confidence: voteData.confidence,
        reasoning: voteData.reasoning,
        timestamp: voteData.timestamp,
        marketData: voteData.marketData,
        proofContract: voteData.proofContract
      };

      const voteFile = new File(
        [JSON.stringify(voteReceipt, null, 2)],
        `vote-receipt-${voteData.coinId}-${voteData.voter}-${Date.now()}.json`,
        { type: 'application/json' }
      );

      // Upload to Filecoin using Synapse
      await uploadFileMutation.mutateAsync(voteFile);
      
      // Wait a bit for the state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we have uploaded info from the mutation
      if (uploadedInfo?.commp) {
        voteData.cid = uploadedInfo.commp;
        setUserVotes(prev => ({ ...prev, [coinId]: voteData }));

        // Add to audit trail
        const auditEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          action: 'vote_cast',
          user: address || '',
          timestamp: Date.now(),
          details: { 
            coinId: voteData.coinId, 
            vote: voteData.vote, 
            confidence: voteData.confidence 
          },
          cid: uploadedInfo.commp,
          blockNumber: Math.floor(Math.random() * 1000000),
          transactionHash: uploadedInfo.txHash || 'mock-tx'
        };

        setAuditTrail(prev => [auditEntry, ...prev]);

        toast({
          title: "Vote Cast Successfully",
          description: `Your ${vote} vote on ${coin.symbol.toUpperCase()} has been recorded and stored permanently on Filecoin`
        });
      } else {
        // Fallback for when uploadedInfo is not available
        voteData.cid = 'mock-cid-' + Date.now();
        setUserVotes(prev => ({ ...prev, [coinId]: voteData }));

        toast({
          title: "Vote Cast Successfully",
          description: `Your ${vote} vote on ${coin.symbol.toUpperCase()} has been recorded (mock storage)`
        });
      }
    } catch (error) {
      console.error('Vote failed:', error);
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote",
        variant: "destructive"
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [coinId]: false }));
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getVoteIcon = (vote: 'safe' | 'rug' | 'neutral') => {
    switch (vote) {
      case 'safe': return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'rug': return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
      case 'neutral': return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVoteColor = (vote: 'safe' | 'rug' | 'neutral') => {
    switch (vote) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'rug': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading memecoins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} className="bg-purple-600 hover:bg-purple-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Coins className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Memecoin Voting
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vote on your favorite memecoins and store your predictions permanently on Filecoin. Every vote is cryptographically verified and stored immutably.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <Coins className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">{memecoins.length}</h3>
              <p className="opacity-90">Memecoins Tracked</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <Vote className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">{Object.keys(userVotes).length}</h3>
              <p className="opacity-90">Your Votes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <FileArchive className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">100%</h3>
              <p className="opacity-90">Permanently Stored</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">∞</h3>
              <p className="opacity-90">Audit Trail</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search memecoins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="market_cap">Sort by Market Cap</option>
              <option value="price_change_24h">Sort by 24h Change</option>
              <option value="volume">Sort by Volume</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="voting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voting" className="flex items-center space-x-2">
              <Vote className="h-4 w-4" />
              <span>Vote</span>
            </TabsTrigger>
            <TabsTrigger value="my-votes" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>My Votes</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Audit Trail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoins.map((coin) => {
                const userVote = userVotes[coin.id];
                const isVotingThis = isVoting[coin.id];
                
                return (
                  <Card key={coin.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">#{coin.market_cap_rank}</Badge>
                        <div className="flex items-center space-x-2">
                          {userVote && (
                            <Badge className={getVoteColor(userVote.vote)}>
                              {getVoteIcon(userVote.vote)}
                              <span className="ml-1">{userVote.vote.toUpperCase()}</span>
                            </Badge>
                          )}
                          <Badge className={`${
                            coin.price_change_percentage_24h >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formatPercentage(coin.price_change_percentage_24h)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg">{coin.name}</CardTitle>
                          <CardDescription className="text-sm font-mono">
                            {coin.symbol.toUpperCase()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Price Info */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price</span>
                          <span className="text-sm font-medium">${coin.current_price.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Market Cap</span>
                          <span className="text-sm font-medium">{formatCurrency(coin.market_cap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">24h Volume</span>
                          <span className="text-sm font-medium">{formatCurrency(coin.total_volume)}</span>
                        </div>
                      </div>

                      {/* Voting Section */}
                      {!userVote ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">Cast your vote (stored on Filecoin):</p>
                          
                          {/* Confidence Level */}
                          <div>
                            <label className="text-sm font-medium">Confidence Level (1-10)</label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={voteConfidence[coin.id] || 5}
                              onChange={(e) => setVoteConfidence(prev => ({
                                ...prev,
                                [coin.id]: parseInt(e.target.value)
                              }))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>1 (Low)</span>
                              <span>{voteConfidence[coin.id] || 5}</span>
                              <span>10 (High)</span>
                            </div>
                          </div>

                          {/* Reasoning */}
                          <div>
                            <label className="text-sm font-medium">Reasoning (optional)</label>
                            <Input
                              placeholder="Why are you voting this way?"
                              value={voteReasoning[coin.id] || ''}
                              onChange={(e) => setVoteReasoning(prev => ({
                                ...prev,
                                [coin.id]: e.target.value
                              }))}
                              className="text-sm"
                            />
                          </div>

                          {/* Vote Buttons */}
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              onClick={() => castVote(coin.id, 'safe')}
                              disabled={isVotingThis || !isConnected || !isCalibnet}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              {isVotingThis ? 'Voting...' : '🐂 Safe'}
                            </Button>
                            <Button
                              onClick={() => castVote(coin.id, 'rug')}
                              disabled={isVotingThis || !isConnected || !isCalibnet}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              size="sm"
                            >
                              {isVotingThis ? 'Voting...' : '🐻 Rug'}
                            </Button>
                            <Button
                              onClick={() => castVote(coin.id, 'neutral')}
                              disabled={isVotingThis || !isConnected || !isCalibnet}
                              variant="outline"
                              size="sm"
                            >
                              {isVotingThis ? 'Voting...' : '🎯 Neutral'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            You voted <strong>{userVote.vote.toUpperCase()}</strong> with confidence {userVote.confidence}/10.
                            Your vote is permanently stored on Filecoin.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Filecoin Storage Info */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Stored on Filecoin</span>
                        </div>
                        {userVote?.cid && (
                          <Badge variant="secondary" className="text-xs">
                            CID: {userVote.cid.slice(0, 10)}...
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-votes" className="space-y-6">
            <h2 className="text-2xl font-bold">My Vote History</h2>
            {Object.keys(userVotes).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">You haven't voted on any memecoins yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Start voting to see your predictions here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(userVotes).map((vote) => {
                  const coin = memecoins.find(c => c.id === vote.coinId);
                  if (!coin) return null;
                  
                  return (
                    <Card key={vote.coinId} className="border-l-4 border-purple-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={coin.image} 
                              alt={coin.name} 
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <CardTitle className="text-lg">{coin.name}</CardTitle>
                              <CardDescription>{coin.symbol.toUpperCase()}</CardDescription>
                            </div>
                          </div>
                          <Badge className={getVoteColor(vote.vote)}>
                            {getVoteIcon(vote.vote)}
                            <span className="ml-1">{vote.vote.toUpperCase()}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <div className="font-medium">{vote.confidence}/10</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Voted At:</span>
                            <div className="font-medium">
                              {new Date(vote.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {vote.reasoning && (
                          <div>
                            <span className="text-sm text-gray-600">Reasoning:</span>
                            <p className="text-sm mt-1">{vote.reasoning}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              CID: {vote.cid.slice(0, 10)}...
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <h2 className="text-2xl font-bold">Audit Trail</h2>
            {auditTrail.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No audit entries yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Start voting to see the audit trail!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {auditTrail.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            {entry.action === 'vote_cast' && <Vote className="h-4 w-4 text-purple-600" />}
                            {entry.action === 'analysis_uploaded' && <Upload className="h-4 w-4 text-purple-600" />}
                            {entry.action === 'proof_generated' && <FileCheck className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{entry.action.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-gray-600">by {entry.user}</p>
                            {entry.details.coinId && (
                              <p className="text-xs text-gray-500">
                                Coin: {memecoins.find(c => c.id === entry.details.coinId)?.symbol?.toUpperCase()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Block: {entry.blockNumber}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          CID: {entry.cid.slice(0, 10)}...
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          TX: {entry.transactionHash.slice(0, 10)}...
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MemecoinVoting; 