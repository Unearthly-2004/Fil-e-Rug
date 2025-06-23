
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, CheckCircle, ArrowRight } from "lucide-react";

const BlockchainIntegration = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dual-Blockchain Architecture
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combining Flow's automation capabilities with Filecoin's decentralized storage
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flow Blockchain */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Automation Layer</Badge>
              </div>
              <CardTitle className="text-2xl">Flow Blockchain</CardTitle>
              <CardDescription className="text-lg">
                Real-time automated analysis and detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Fake Volume Detection</h4>
                    <p className="text-gray-600 text-sm">AI algorithms analyze trading patterns in real-time</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Corporate Backing Verification</h4>
                    <p className="text-gray-600 text-sm">Automated verification of institutional partnerships</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Transaction Pattern Analysis</h4>
                    <p className="text-gray-600 text-sm">Identifies suspicious wallet behaviors and sybil attacks</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Speed</span>
                    <Badge variant="outline">< 1 second</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filecoin Storage */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Governance Layer</Badge>
              </div>
              <CardTitle className="text-2xl">Filecoin Network</CardTitle>
              <CardDescription className="text-lg">
                Decentralized governance and permanent archiving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Community Voting</h4>
                    <p className="text-gray-600 text-sm">Decentralized decision-making for manual reviews</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Permanent Archival</h4>
                    <p className="text-gray-600 text-sm">All governance decisions stored with cryptographic proof</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Immutable Records</h4>
                    <p className="text-gray-600 text-sm">Tamper-proof evidence of community consensus</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Guarantee</span>
                    <Badge variant="outline">Permanent</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Flow */}
        <div className="mt-12 p-8 bg-white rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-6">
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Flow Analysis</h4>
              <p className="text-gray-600 text-sm">Automated detection algorithms analyze project data</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
            
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Manual Review</h4>
              <p className="text-gray-600 text-sm">Flagged projects sent to community for voting</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
            
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Filecoin Storage</h4>
              <p className="text-gray-600 text-sm">All decisions permanently archived with cryptographic proof</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockchainIntegration;
