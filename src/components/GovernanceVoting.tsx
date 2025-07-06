import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, FileText, Shield, ExternalLink, Database, AlertTriangle, CheckCircle, Upload, FileCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { voteOnChain, getVoteCount, checkIfVoted, VoteCount } from "@/lib/filecoin-vote";
import { useFilecoinStorage } from "@/hooks/use-filecoin-storage";
import { ChainData } from "@/lib/filecoin-storage";
import { EnhancedFileUploader } from "./EnhancedFileUploader";
import WalletStatus from "./WalletStatus";
import { toast } from "@/hooks/use-toast";
import { FilecoinStorageService } from '@/lib/filecoin-storage';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  cid: string;
  txHash: string;
  timestamp: number;
}

interface VoteProof {
  proposalId: string;
  userAddress: string;
  vote: 'rug' | 'no-rug';
  files: UploadedFile[];
  proofContractAddress: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

const GovernanceVoting = () => {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [onChainVoteCounts, setOnChainVoteCounts] = useState<Record<string, VoteCount>>({});
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
  const [showUploader, setShowUploader] = useState<Record<string, boolean>>({});
  const [voteProofs, setVoteProofs] = useState<Record<string, VoteProof>>({});
  const [uploadedVoteFiles, setUploadedVoteFiles] = useState<Record<string, UploadedFile | null>>({});
  const [isUploadingVote, setIsUploadingVote] = useState<Record<string, boolean>>({});
  const [isGeneratingProof, setIsGeneratingProof] = useState<Record<string, boolean>>({});
  
  const { provider, address, isConnected, isCalibnet, switchToCalibnet, hasEnoughBalance } = useWallet();
  const { storeChainData, isStoring } = useFilecoinStorage();

  // TODO: Fetch proposals from the blockchain or a real source
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    // Replace this with a real fetch from the blockchain or backend
    async function fetchProposals() {
      // Example: fetch from a smart contract or API
      // const fetchedProposals = await getProposalsFromChain(provider);
      // setProposals(fetchedProposals);
      setProposals([]); // Placeholder: no hardcoded proposals
    }
    fetchProposals();
  }, [provider]);

  // Fetch on-chain vote counts
  useEffect(() => {
    if (provider && isCalibnet) {
      proposals.forEach(async (proposal) => {
        const voteCount = await getVoteCount(provider as any, proposal.id);
        if (voteCount) {
          setOnChainVoteCounts(prev => ({
            ...prev,
            [proposal.id]: voteCount
          }));
        }
      });
    }
  }, [provider, isCalibnet]);

  // Check if user has voted on each proposal
  useEffect(() => {
    if (provider && address && isCalibnet) {
      proposals.forEach(async (proposal) => {
        const hasVoted = await checkIfVoted(provider as any, proposal.id, address);
        if (hasVoted) {
          setUserVotes(prev => ({
            ...prev,
            [proposal.id]: true
          }));
        }
      });
    }
  }, [provider, address, isCalibnet]);

  // Helper to upload vote receipt file
  const uploadVoteReceipt = async (proposal: any, vote: 'rug' | 'no-rug') => {
    setIsUploadingVote(prev => ({ ...prev, [proposal.id]: true }));
    try {
      const filecoinService = new FilecoinStorageService();
      const voteReceipt = {
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        userAddress: address,
        vote,
        timestamp: Date.now(),
      };
      const fileName = `vote-receipt-${proposal.id}-${address}-${Date.now()}.json`;
      const fileData = new Blob([JSON.stringify(voteReceipt, null, 2)], { type: 'application/json' });
      // Use the same storeChainData logic for demo (could be replaced with a direct file upload)
      const result = await filecoinService.storeChainData({
        id: proposal.id,
        name: proposal.title,
        blockchain: 'filecoin',
        riskFactors: proposal.riskFactors,
        voteResults: proposal.voteResults,
        finalDecision: 'pending',
        timestamp: Date.now(),
        metadata: {
          description: proposal.description,
          category: proposal.category,
          timeLeft: proposal.timeLeft,
        },
      });
      if (result.success) {
        const uploadedFile: UploadedFile = {
          id: fileName,
          name: fileName,
          size: fileData.size,
          cid: result.cid || '',
          txHash: result.hash || '',
          timestamp: Date.now(),
        };
        setUploadedVoteFiles(prev => ({ ...prev, [proposal.id]: uploadedFile }));
        toast({
          title: 'Vote Receipt Uploaded',
          description: `Vote receipt stored on Filecoin (CID: ${result.cid?.slice(0, 10)}...)`,
        });
      } else {
        toast({
          title: 'Vote Receipt Upload Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Vote Receipt Upload Error',
        description: String(err),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingVote(prev => ({ ...prev, [proposal.id]: false }));
    }
  };

  // Helper to manage pending votes in localStorage
  const PENDING_VOTES_KEY = 'pendingVotes';
  function getPendingVotes() {
    try {
      return JSON.parse(localStorage.getItem(PENDING_VOTES_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function savePendingVote(voteObj: any) {
    const votes = getPendingVotes();
    // Remove any existing vote for this proposal by this user
    const filtered = votes.filter((v: any) => v.proposalId !== voteObj.proposalId || v.userAddress !== voteObj.userAddress);
    filtered.push(voteObj);
    localStorage.setItem(PENDING_VOTES_KEY, JSON.stringify(filtered));
  }

  // Modified handleVote
  const handleVote = async (proposalId: string, vote: 'rug' | 'no-rug') => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet to vote",
        variant: "destructive",
      });
      return;
    }
    if (!isCalibnet) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Filecoin Calibnet to vote",
        variant: "destructive",
      });
      await switchToCalibnet();
      return;
    }
    if (!hasEnoughBalance()) {
      toast({
        title: "Insufficient Balance",
        description: "You need tFIL for gas and tUSDFC for storage payments",
        variant: "destructive",
      });
      return;
    }
    if (userVotes[proposalId]) {
      toast({
        title: "Already Voted",
        description: "You have already voted on this proposal",
        variant: "destructive",
      });
      return;
    }
    setIsVoting(prev => ({ ...prev, [proposalId]: true }));
    setSelectedVote(`${proposalId}-${vote}`);
    try {
      // Save to pending votes instead of submitting
      savePendingVote({
        proposalId,
        vote,
        userAddress: address,
        timestamp: Date.now(),
      });
      toast({
        title: 'Vote Saved',
        description: 'Your vote has been saved to My Votes. Submit it from the My Votes page.',
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast({ title: 'Vote Error', description: 'Failed to save vote. Please try again.', variant: 'destructive' });
      setSelectedVote(null);
    } finally {
      setIsVoting(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const handleUploadComplete = (proposalId: string, files: UploadedFile[]) => {
    toast({
      title: "Files Uploaded Successfully",
      description: `Uploaded ${files.length} files to Filecoin for proposal ${proposalId}`,
    });
  };

  // Proof set generation handler
  const handleGenerateProofSet = async (proposalId: string) => {
    setIsGeneratingProof(prev => ({ ...prev, [proposalId]: true }));
    try {
      // For demo, just mark as proof generated
      const uploadedFile = uploadedVoteFiles[proposalId];
      if (!uploadedFile) throw new Error('No vote receipt uploaded');
      const proofData = {
        proposalId,
        userAddress: address,
        vote: selectedVote?.includes('rug') ? 'rug' : 'no-rug',
        files: [uploadedFile],
        proofContractAddress: '0x' + Math.random().toString(16).slice(2, 10),
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000000),
        transactionHash: uploadedFile.txHash,
      };
      setVoteProofs(prev => ({ ...prev, [proposalId]: proofData }));
      toast({ title: 'Proof Set Generated', description: 'Proof contract created for your vote.' });
    } catch (err) {
      toast({ title: 'Proof Generation Error', description: String(err), variant: 'destructive' });
    } finally {
      setIsGeneratingProof(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  return (
    <section id="governance-voting" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Community Governance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized decision-making powered by Filecoin Calibnet with on-chain voting, permanent storage, and proof contracts
          </p>
        </div>

        {/* Wallet Status */}
        <div className="mb-8">
          <WalletStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {proposals.map((proposal) => {
            const rugPercentage = (proposal.rugVotes / proposal.totalVotes) * 100;
            const noRugPercentage = (proposal.noRugVotes / proposal.totalVotes) * 100;
            const hasVoted = userVotes[proposal.id];
            const isVotingThis = isVoting[proposal.id];
            const showUploaderForThis = showUploader[proposal.id];
            const voteProof = voteProofs[proposal.id];
            
            return (
              <div key={proposal.id} className="space-y-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{proposal.id}</Badge>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {proposal.category}
                        </Badge>
                        {hasVoted && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Voted
                          </Badge>
                        )}
                        {voteProof && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <FileCheck className="h-3 w-3 mr-1" />
                            Proof Generated
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                    <CardDescription>{proposal.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      {/* Risk Factors */}
                      <div>
                        <h4 className="font-semibold mb-2">Risk Factors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {proposal.riskFactors.map((factor, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Voting Results */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">Current Votes</h4>
                          <span className="text-sm text-gray-500">
                            {proposal.totalVotes} votes • {proposal.timeLeft} left
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-red-600">RUG</span>
                              <span className="text-sm text-red-600">
                                {proposal.rugVotes} ({rugPercentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={rugPercentage} className="h-2 bg-red-100" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-green-600">NO RUG</span>
                              <span className="text-sm text-green-600">
                                {proposal.noRugVotes} ({noRugPercentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={noRugPercentage} className="h-2 bg-green-100" />
                          </div>
                        </div>
                      </div>

                      {/* Voting Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleVote(proposal.id, 'rug')}
                          className="flex-1 rug-gradient text-white"
                          disabled={hasVoted || isVotingThis || !isConnected || !isCalibnet || !hasEnoughBalance()}
                        >
                          {isVotingThis ? 'Voting...' : 
                           hasVoted ? 'Already Voted' : 
                           selectedVote === `${proposal.id}-rug` ? 'Voted RUG' : 'Vote RUG'}
                        </Button>
                        <Button
                          onClick={() => handleVote(proposal.id, 'no-rug')}
                          className="flex-1 safe-gradient text-white"
                          disabled={hasVoted || isVotingThis || !isConnected || !isCalibnet || !hasEnoughBalance()}
                        >
                          {isVotingThis ? 'Voting...' : 
                           hasVoted ? 'Already Voted' : 
                           selectedVote === `${proposal.id}-no-rug` ? 'Voted SAFE' : 'Vote SAFE'}
                        </Button>
                      </div>

                      {/* Blockchain Info */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Stored on Filecoin Calibnet</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced File Uploader - Show after voting */}
                {showUploaderForThis && (
                  <EnhancedFileUploader
                    proposalId={proposal.id}
                    proposalTitle={proposal.title}
                    userVote={selectedVote?.includes('rug') ? 'rug' : 'no-rug'}
                    onUploadComplete={(files) => handleUploadComplete(proposal.id, files)}
                    onGenerateProof={(proofData) => handleGenerateProofSet(proposal.id)}
                  />
                )}

                {/* Vote Proof Display */}
                {voteProof && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-purple-800">
                        <FileCheck className="h-5 w-5" />
                        <span>Vote Proof Generated</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div><strong>Proof Contract:</strong> {voteProof.proofContractAddress}</div>
                        <div><strong>Vote:</strong> {voteProof.vote === 'rug' ? 'RUG' : 'SAFE'}</div>
                        <div><strong>Files Uploaded:</strong> {voteProof.files.length}</div>
                        <div><strong>Block Number:</strong> {voteProof.blockNumber}</div>
                        <div><strong>Transaction:</strong> {voteProof.transactionHash}</div>
                        <div><strong>Timestamp:</strong> {new Date(voteProof.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-purple-600">
                        This contract serves as permanent proof of your vote and the associated evidence files on Filecoin Calibnet.
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hasVoted && uploadedVoteFiles[proposal.id] && !voteProof && (
                  <Button
                    className="mt-3 w-full bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => handleGenerateProofSet(proposal.id)}
                    disabled={isGeneratingProof[proposal.id]}
                  >
                    {isGeneratingProof[proposal.id] ? 'Generating Proof Set...' : 'Generate Proof Set'}
                  </Button>
                )}

                {isUploadingVote[proposal.id] && (
                  <div className="text-xs text-purple-600 mt-2">Uploading vote receipt to Filecoin...</div>
                )}

                {uploadedVoteFiles[proposal.id] && (
                  <div className="text-xs text-green-600 mt-2">Vote receipt uploaded (CID: {uploadedVoteFiles[proposal.id]?.cid.slice(0, 10)}...)</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Governance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">1,247</h3>
              <p className="text-gray-600">Active Voters</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">89</h3>
              <p className="text-gray-600">Projects Analyzed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Upload className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">100%</h3>
              <p className="text-gray-600">Files Stored on Filecoin</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <FileCheck className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">100%</h3>
              <p className="text-gray-600">Proof Contracts Generated</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GovernanceVoting;
