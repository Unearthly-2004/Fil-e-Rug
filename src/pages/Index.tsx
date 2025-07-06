import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Coins, 
  Vote, 
  Database, 
  TrendingUp, 
  FileArchive, 
  Users, 
  Globe,
  ArrowRight,
  Star,
  Zap,
  Target
} from "lucide-react";
import HeroSection from '@/components/HeroSection';
import DetectionFactors from '@/components/DetectionFactors';
import ChainStorage from '@/components/ChainStorage';
import BlockchainIntegration from '@/components/BlockchainIntegration';

const Index: React.FC = () => {
  return (
    <div className="pt-16">
      <HeroSection />
      
      {/* Features Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for memecoin analysis, voting, and permanent storage on Filecoin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Memecoin Voting */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-purple-100">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Coins className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">New</Badge>
                </div>
                <CardTitle className="text-xl">Memecoin Voting</CardTitle>
                <CardDescription>
                  Vote on your favorite memecoins with real-time data from CoinGecko API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Real-time market data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileArchive className="h-4 w-4 text-green-500" />
                    <span>Permanent storage on Filecoin</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Cryptographic proof</span>
                  </div>
                </div>
                <Link to="/memecoin-voting">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Voting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* On-Chain Governance */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-blue-100">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Vote className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Advanced</Badge>
                </div>
                <CardTitle className="text-xl">On-Chain Governance</CardTitle>
                <CardDescription>
                  Decentralized decision-making with permanent storage of all governance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Community voting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span>Immutable audit trail</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span>Proposal management</span>
                  </div>
                </div>
                <Link to="/governance">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Governance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Synapse Storage */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-green-100">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">Storage</Badge>
                </div>
                <CardTitle className="text-xl">Filecoin Storage</CardTitle>
                <CardDescription>
                  Advanced file storage with Synapse SDK and Lighthouse Web3 integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Synapse SDK integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Proof of Data Possession</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span>Decentralized storage</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link to="/synapse-storage">
                    <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                      Synapse Storage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/lighthouse-storage">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Lighthouse Storage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Statistics
            </h2>
            <p className="text-xl text-gray-600">
              Real-time metrics from our decentralized platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Coins className="h-12 w-12 mx-auto mb-3 opacity-90" />
                <h3 className="text-2xl font-bold">100+</h3>
                <p className="opacity-90">Memecoins Tracked</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <Vote className="h-12 w-12 mx-auto mb-3 opacity-90" />
                <h3 className="text-2xl font-bold">2,847</h3>
                <p className="opacity-90">Total Votes Cast</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <FileArchive className="h-12 w-12 mx-auto mb-3 opacity-90" />
                <h3 className="text-2xl font-bold">100%</h3>
                <p className="opacity-90">Data Permanently Stored</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-90" />
                <h3 className="text-2xl font-bold">1,247</h3>
                <p className="opacity-90">Active Users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Existing Components */}
      <DetectionFactors />
      <ChainStorage />
      <BlockchainIntegration />
    </div>
  );
};

export default Index;
