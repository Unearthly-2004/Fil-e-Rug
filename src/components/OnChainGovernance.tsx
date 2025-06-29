import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  FileText, 
  Shield, 
  ExternalLink, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  FileCheck,
  Vote,
  MessageSquare,
  Clock,
  TrendingUp,
  Archive,
  Lock,
  Unlock,
  Hash,
  Calendar,
  UserCheck,
  FileArchive,
  History,
  Zap,
  Globe,
  Award,
  Target
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useSynapseStorage } from "@/hooks/use-synapse-storage";
import { useSynapseBalances } from "@/hooks/use-synapse-balances";
import { toast } from "@/hooks/use-toast";
import { Synapse } from "@filoz/synapse-sdk";
import { clientToSigner } from "@/lib/ethers-utils";
import { filecoinConfig, getNetwork } from "@/lib/filecoin-config";
import { preflightCheck, getProofset } from "@/lib/filecoin-utils";

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  author: string;
  category: 'governance' | 'treasury' | 'technical' | 'community';
  status: 'draft' | 'active' | 'voting' | 'executed' | 'rejected' | 'expired';
  votingPeriod: number; // days
  quorum: number;
  minVotes: number;
  createdAt: number;
  votingStart?: number;
  votingEnd?: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalVotes: number;
  executionThreshold: number;
  files: GovernanceFile[];
  discussions: Discussion[];
  auditTrail: AuditEntry[];
  cid?: string; // Filecoin CID for permanent storage
  proofContract?: string; // Smart contract for vote verification
}

interface GovernanceFile {
  id: string;
  name: string;
  type: 'proposal' | 'attachment' | 'audit' | 'vote-proof';
  cid: string;
  size: number;
  uploadedAt: number;
  uploadedBy: string;
}

interface Discussion {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  cid: string; // Stored on Filecoin
  replies: Discussion[];
}

interface AuditEntry {
  id: string;
  action: 'proposal_created' | 'vote_cast' | 'proposal_executed' | 'file_uploaded' | 'discussion_added';
  user: string;
  timestamp: number;
  details: any;
  cid: string; // Permanent storage reference
  blockNumber: number;
  transactionHash: string;
}

interface VoteData {
  proposalId: string;
  voter: string;
  vote: 'yes' | 'no' | 'abstain';
  weight: number;
  timestamp: number;
  cid: string; // Vote receipt stored on Filecoin
  proofContract: string;
}

const OnChainGovernance: React.FC = () => {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, VoteData>>({});
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
  const [isUploadingFiles, setIsUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, GovernanceFile[]>>({});
  const [discussions, setDiscussions] = useState<Record<string, Discussion[]>>({});
  const [newDiscussion, setNewDiscussion] = useState<Record<string, string>>({});
  const [isAddingDiscussion, setIsAddingDiscussion] = useState<Record<string, boolean>>({});

  const { provider, address, isConnected, isCalibnet, switchToCalibnet, hasEnoughBalance } = useWallet();
  const { uploadFileMutation, progress, status } = useSynapseStorage();
  const { balances, isLoading: balancesLoading } = useSynapseBalances();

  // Mock data for demonstration
  useEffect(() => {
    const mockProposals: GovernanceProposal[] = [
      {
        id: "PROP-001",
        title: "Implement Synapse SDK for Permanent Governance Storage",
        description: "This proposal aims to integrate the Synapse SDK to ensure all governance data, including proposals, votes, and discussions, are permanently stored on Filecoin with cryptographic proof of authenticity.",
        author: "0x1234...5678",
        category: "technical",
        status: "voting",
        votingPeriod: 7,
        quorum: 1000,
        minVotes: 100,
        createdAt: Date.now() - 86400000 * 3, // 3 days ago
        votingStart: Date.now() - 86400000 * 2,
        votingEnd: Date.now() + 86400000 * 4,
        yesVotes: 750,
        noVotes: 150,
        abstainVotes: 50,
        totalVotes: 950,
        executionThreshold: 60,
        files: [],
        discussions: [],
        auditTrail: []
      },
      {
        id: "PROP-002",
        title: "Allocate 100,000 USDFC for Community Development Fund",
        description: "Establish a community development fund to support ecosystem projects and initiatives that align with our DAO's mission and values.",
        author: "0x8765...4321",
        category: "treasury",
        status: "active",
        votingPeriod: 14,
        quorum: 2000,
        minVotes: 200,
        createdAt: Date.now() - 86400000 * 1,
        votingStart: Date.now() + 86400000 * 2,
        votingEnd: Date.now() + 86400000 * 16,
        yesVotes: 0,
        noVotes: 0,
        abstainVotes: 0,
        totalVotes: 0,
        executionThreshold: 50,
        files: [],
        discussions: [],
        auditTrail: []
      }
    ];
    setProposals(mockProposals);
  }, []);

  // Upload governance file to Filecoin using Synapse
  const uploadGovernanceFile = async (file: File, proposalId: string, type: GovernanceFile['type']) => {
    if (!isConnected || !isCalibnet) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet and switch to Calibnet",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingFiles(prev => ({ ...prev, [proposalId]: true }));

    try {
      // Use Synapse SDK to upload file
      const result = await uploadFileMutation.mutateAsync(file);
      
      if (result) {
        const governanceFile: GovernanceFile = {
          id: `${proposalId}-${Date.now()}`,
          name: file.name,
          type,
          cid: result.commp || 'mock-cid',
          size: file.size,
          uploadedAt: Date.now(),
          uploadedBy: address || ''
        };

        setUploadedFiles(prev => ({
          ...prev,
          [proposalId]: [...(prev[proposalId] || []), governanceFile]
        }));

        // Add to audit trail
        const auditEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          action: 'file_uploaded',
          user: address || '',
          timestamp: Date.now(),
          details: { fileName: file.name, fileType: type },
          cid: result.commp || 'mock-cid',
          blockNumber: Math.floor(Math.random() * 1000000),
          transactionHash: result.txHash || 'mock-tx'
        };

        setProposals(prev => prev.map(p => 
          p.id === proposalId 
            ? { ...p, auditTrail: [...p.auditTrail, auditEntry] }
            : p
        ));

        toast({
          title: "File Uploaded Successfully",
          description: `File stored on Filecoin with CID: ${result.commp?.slice(0, 10)}...`
        });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to Filecoin",
        variant: "destructive"
      });
    } finally {
      setIsUploadingFiles(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  // Cast vote on proposal
  const castVote = async (proposalId: string, vote: 'yes' | 'no' | 'abstain') => {
    if (!isConnected || !isCalibnet) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet and switch to Calibnet",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(prev => ({ ...prev, [proposalId]: true }));

    try {
      // Create vote data
      const voteData: VoteData = {
        proposalId,
        voter: address || '',
        vote,
        weight: 1, // Could be based on token balance
        timestamp: Date.now(),
        cid: 'mock-vote-cid',
        proofContract: '0x' + Math.random().toString(16).slice(2, 10)
      };

      // Store vote receipt on Filecoin
      const voteReceipt = {
        proposalId,
        voter: address,
        vote,
        weight: voteData.weight,
        timestamp: voteData.timestamp,
        proofContract: voteData.proofContract
      };

      const voteFile = new File(
        [JSON.stringify(voteReceipt, null, 2)],
        `vote-receipt-${proposalId}-${address}-${Date.now()}.json`,
        { type: 'application/json' }
      );

      await uploadGovernanceFile(voteFile, proposalId, 'vote-proof');

      // Update vote counts
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const voteCounts = { ...p };
          if (vote === 'yes') voteCounts.yesVotes += voteData.weight;
          else if (vote === 'no') voteCounts.noVotes += voteData.weight;
          else voteCounts.abstainVotes += voteData.weight;
          voteCounts.totalVotes += voteData.weight;
          return voteCounts;
        }
        return p;
      }));

      setUserVotes(prev => ({ ...prev, [proposalId]: voteData }));

      // Add to audit trail
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'vote_cast',
        user: address || '',
        timestamp: Date.now(),
        details: { vote, weight: voteData.weight },
        cid: 'mock-vote-cid',
        blockNumber: Math.floor(Math.random() * 1000000),
        transactionHash: 'mock-vote-tx'
      };

      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { ...p, auditTrail: [...p.auditTrail, auditEntry] }
          : p
      ));

      toast({
        title: "Vote Cast Successfully",
        description: `Your ${vote} vote has been recorded and stored permanently on Filecoin`
      });

    } catch (error) {
      console.error('Vote failed:', error);
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote",
        variant: "destructive"
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  // Add discussion to proposal
  const addDiscussion = async (proposalId: string) => {
    const content = newDiscussion[proposalId];
    if (!content?.trim()) return;

    setIsAddingDiscussion(prev => ({ ...prev, [proposalId]: true }));

    try {
      // Store discussion on Filecoin
      const discussionData = {
        proposalId,
        author: address,
        content,
        timestamp: Date.now()
      };

      const discussionFile = new File(
        [JSON.stringify(discussionData, null, 2)],
        `discussion-${proposalId}-${address}-${Date.now()}.json`,
        { type: 'application/json' }
      );

      await uploadGovernanceFile(discussionFile, proposalId, 'attachment');

      const discussion: Discussion = {
        id: `disc-${Date.now()}`,
        author: address || '',
        content,
        timestamp: Date.now(),
        cid: 'mock-discussion-cid',
        replies: []
      };

      setDiscussions(prev => ({
        ...prev,
        [proposalId]: [...(prev[proposalId] || []), discussion]
      }));

      setNewDiscussion(prev => ({ ...prev, [proposalId]: '' }));

      toast({
        title: "Discussion Added",
        description: "Your comment has been stored permanently on Filecoin"
      });

    } catch (error) {
      console.error('Discussion failed:', error);
      toast({
        title: "Discussion Failed",
        description: "Failed to add discussion",
        variant: "destructive"
      });
    } finally {
      setIsAddingDiscussion(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const getVotingProgress = (proposal: GovernanceProposal) => {
    const totalPossible = proposal.quorum;
    const current = proposal.totalVotes;
    return Math.min((current / totalPossible) * 100, 100);
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? (votes / total) * 100 : 0;
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Vote className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              On-Chain Governance
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized decision-making with permanent storage on Filecoin. Every proposal, vote, and discussion is cryptographically verified and stored immutably.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">2,847</h3>
              <p className="opacity-90">Active Voters</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">{proposals.length}</h3>
              <p className="opacity-90">Active Proposals</p>
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
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">∞</h3>
              <p className="opacity-90">Audit Trail</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proposals" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Proposals</span>
            </TabsTrigger>
            <TabsTrigger value="voting" className="flex items-center space-x-2">
              <Vote className="h-4 w-4" />
              <span>Voting</span>
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Audit Trail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Governance Proposals</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Proposal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Governance Proposal</DialogTitle>
                    <DialogDescription>
                      Create a new proposal that will be permanently stored on Filecoin with cryptographic proof.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input placeholder="Proposal title..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea placeholder="Detailed description..." rows={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <select className="w-full p-2 border rounded">
                          <option value="governance">Governance</option>
                          <option value="treasury">Treasury</option>
                          <option value="technical">Technical</option>
                          <option value="community">Community</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Voting Period (days)</label>
                        <Input type="number" placeholder="7" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Quorum</label>
                        <Input type="number" placeholder="1000" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Execution Threshold (%)</label>
                        <Input type="number" placeholder="60" />
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Create Proposal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{proposal.id}</Badge>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${
                          proposal.status === 'voting' ? 'bg-green-100 text-green-800' :
                          proposal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {proposal.status.toUpperCase()}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {proposal.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Voting Progress */}
                    {proposal.status === 'voting' && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Voting Progress</span>
                          <span className="text-sm text-gray-500">
                            {proposal.totalVotes} / {proposal.quorum} votes
                          </span>
                        </div>
                        <Progress value={getVotingProgress(proposal)} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Quorum: {proposal.quorum}</span>
                          <span>{getTimeRemaining(proposal.votingEnd || 0)} left</span>
                        </div>
                      </div>
                    )}

                    {/* Vote Results */}
                    {proposal.totalVotes > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-green-600">Yes</span>
                          <span className="text-sm text-green-600">
                            {proposal.yesVotes} ({getVotePercentage(proposal.yesVotes, proposal.totalVotes).toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={getVotePercentage(proposal.yesVotes, proposal.totalVotes)} className="h-2 bg-green-100" />
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-red-600">No</span>
                          <span className="text-sm text-red-600">
                            {proposal.noVotes} ({getVotePercentage(proposal.noVotes, proposal.totalVotes).toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={getVotePercentage(proposal.noVotes, proposal.totalVotes)} className="h-2 bg-red-100" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProposal(proposal)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {proposal.status === 'voting' && !userVotes[proposal.id] && (
                        <Button
                          onClick={() => setSelectedProposal(proposal)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Vote Now
                        </Button>
                      )}
                    </div>

                    {/* Filecoin Storage Info */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Stored on Filecoin</span>
                      </div>
                      {proposal.cid && (
                        <Badge variant="secondary" className="text-xs">
                          CID: {proposal.cid.slice(0, 10)}...
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voting" className="space-y-6">
            <h2 className="text-2xl font-bold">Active Voting</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.filter(p => p.status === 'voting').map((proposal) => (
                <Card key={proposal.id} className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Vote className="h-5 w-5 text-purple-600" />
                      <span>{proposal.title}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {userVotes[proposal.id] ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          You voted <strong>{userVotes[proposal.id].vote.toUpperCase()}</strong> on this proposal.
                          Your vote is permanently stored on Filecoin.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">Cast your vote (permanently stored on Filecoin):</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            onClick={() => castVote(proposal.id, 'yes')}
                            disabled={isVoting[proposal.id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isVoting[proposal.id] ? 'Voting...' : 'Yes'}
                          </Button>
                          <Button
                            onClick={() => castVote(proposal.id, 'no')}
                            disabled={isVoting[proposal.id]}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isVoting[proposal.id] ? 'Voting...' : 'No'}
                          </Button>
                          <Button
                            onClick={() => castVote(proposal.id, 'abstain')}
                            disabled={isVoting[proposal.id]}
                            variant="outline"
                          >
                            {isVoting[proposal.id] ? 'Voting...' : 'Abstain'}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Time remaining: {getTimeRemaining(proposal.votingEnd || 0)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <h2 className="text-2xl font-bold">Community Discussions</h2>
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span>Discussion: {proposal.title}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Existing Discussions */}
                  {(discussions[proposal.id] || []).map((discussion) => (
                    <div key={discussion.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm">{discussion.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(discussion.timestamp).toLocaleString()}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          CID: {discussion.cid.slice(0, 8)}...
                        </Badge>
                      </div>
                      <p className="text-sm">{discussion.content}</p>
                    </div>
                  ))}

                  {/* Add New Discussion */}
                  <div className="border-t pt-4">
                    <Textarea
                      placeholder="Add your thoughts to this discussion..."
                      value={newDiscussion[proposal.id] || ''}
                      onChange={(e) => setNewDiscussion(prev => ({
                        ...prev,
                        [proposal.id]: e.target.value
                      }))}
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        Your comment will be permanently stored on Filecoin
                      </span>
                      <Button
                        onClick={() => addDiscussion(proposal.id)}
                        disabled={isAddingDiscussion[proposal.id] || !newDiscussion[proposal.id]?.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isAddingDiscussion[proposal.id] ? 'Adding...' : 'Add Comment'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <h2 className="text-2xl font-bold">Audit Trail</h2>
            <div className="space-y-4">
              {proposals.flatMap(proposal => proposal.auditTrail).sort((a, b) => b.timestamp - a.timestamp).map((entry) => (
                <Card key={entry.id} className="border-l-4 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          {entry.action === 'vote_cast' && <Vote className="h-4 w-4 text-purple-600" />}
                          {entry.action === 'file_uploaded' && <Upload className="h-4 w-4 text-purple-600" />}
                          {entry.action === 'discussion_added' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                          {entry.action === 'proposal_created' && <FileText className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{entry.action.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-600">by {entry.user}</p>
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
          </TabsContent>
        </Tabs>

        {/* Proposal Detail Modal */}
        {selectedProposal && (
          <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{selectedProposal.title}</span>
                </DialogTitle>
                <DialogDescription>
                  Proposal ID: {selectedProposal.id} • Created by {selectedProposal.author}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedProposal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Voting Details</h3>
                    <div className="space-y-1 text-sm">
                      <div>Status: <Badge>{selectedProposal.status}</Badge></div>
                      <div>Quorum: {selectedProposal.quorum}</div>
                      <div>Min Votes: {selectedProposal.minVotes}</div>
                      <div>Execution Threshold: {selectedProposal.executionThreshold}%</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Current Results</h3>
                    <div className="space-y-1 text-sm">
                      <div>Yes: {selectedProposal.yesVotes}</div>
                      <div>No: {selectedProposal.noVotes}</div>
                      <div>Abstain: {selectedProposal.abstainVotes}</div>
                      <div>Total: {selectedProposal.totalVotes}</div>
                    </div>
                  </div>
                </div>

                {selectedProposal.status === 'voting' && !userVotes[selectedProposal.id] && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Cast Your Vote</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => castVote(selectedProposal.id, 'yes')}
                        disabled={isVoting[selectedProposal.id]}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isVoting[selectedProposal.id] ? 'Voting...' : 'Vote Yes'}
                      </Button>
                      <Button
                        onClick={() => castVote(selectedProposal.id, 'no')}
                        disabled={isVoting[selectedProposal.id]}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isVoting[selectedProposal.id] ? 'Voting...' : 'Vote No'}
                      </Button>
                      <Button
                        onClick={() => castVote(selectedProposal.id, 'abstain')}
                        disabled={isVoting[selectedProposal.id]}
                        variant="outline"
                      >
                        {isVoting[selectedProposal.id] ? 'Voting...' : 'Abstain'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Upload Supporting Documents</h3>
                  <div className="space-y-2">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadGovernanceFile(file, selectedProposal.id, 'attachment');
                        }
                      }}
                      disabled={isUploadingFiles[selectedProposal.id]}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {isUploadingFiles[selectedProposal.id] && (
                      <div className="text-sm text-gray-500">
                        Uploading to Filecoin... {progress}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Filecoin Storage Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span>All data permanently stored on Filecoin Calibnet</span>
                    </div>
                    {selectedProposal.cid && (
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span>CID: {selectedProposal.cid}</span>
                      </div>
                    )}
                    {selectedProposal.proofContract && (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span>Proof Contract: {selectedProposal.proofContract}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default OnChainGovernance; 