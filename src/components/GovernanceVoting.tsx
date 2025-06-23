
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, FileText, Shield, ExternalLink } from "lucide-react";
import { useState } from "react";

const GovernanceVoting = () => {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  const proposals = [
    {
      id: "PROP-001",
      title: "Ethereum Project: DeFiMax Token",
      description: "Community assessment of DeFiMax token for potential rug pull indicators",
      category: "Pending Review",
      rugVotes: 342,
      noRugVotes: 128,
      totalVotes: 470,
      timeLeft: "2 days",
      riskFactors: ["High fake volume", "Anonymous team", "No audits"],
      blockchain: "Filecoin"
    },
    {
      id: "PROP-002", 
      title: "Solana Project: MoonCoin",
      description: "Automated Flow analysis flagged suspicious patterns requiring manual review",
      category: "Flow Flagged",
      rugVotes: 89,
      noRugVotes: 234,
      totalVotes: 323,
      timeLeft: "5 days",
      riskFactors: ["Coordinated transactions", "New project"],
      blockchain: "Filecoin"
    }
  ];

  const handleVote = (proposalId: string, vote: 'rug' | 'no-rug') => {
    setSelectedVote(`${proposalId}-${vote}`);
    console.log(`Voted ${vote} for proposal ${proposalId}`);
  };

  return (
    <section id="governance" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Community Governance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized decision-making powered by Filecoin storage with cryptographic proof
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {proposals.map((proposal) => {
            const rugPercentage = (proposal.rugVotes / proposal.totalVotes) * 100;
            const noRugPercentage = (proposal.noRugVotes / proposal.totalVotes) * 100;
            
            return (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{proposal.id}</Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {proposal.category}
                    </Badge>
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
                        disabled={selectedVote === `${proposal.id}-rug`}
                      >
                        {selectedVote === `${proposal.id}-rug` ? 'Voted RUG' : 'Vote RUG'}
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, 'no-rug')}
                        className="flex-1 safe-gradient text-white"
                        disabled={selectedVote === `${proposal.id}-no-rug`}
                      >
                        {selectedVote === `${proposal.id}-no-rug` ? 'Voted SAFE' : 'Vote SAFE'}
                      </Button>
                    </div>

                    {/* Blockchain Info */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Stored on {proposal.blockchain}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Governance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">100%</h3>
              <p className="text-gray-600">Decisions Archived</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GovernanceVoting;
