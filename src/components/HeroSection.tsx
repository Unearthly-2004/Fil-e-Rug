
import { Button } from "@/components/ui/button";
import { Shield, Zap, Users, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-20 pb-16 crypto-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Detect Rug Pulls
            <br />
            <span className="text-yellow-300">Before They Happen</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Advanced AI analysis combined with community governance to protect your investments 
            from fraudulent projects across the blockchain ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-14 font-semibold shadow-xl transform hover:scale-105 transition-all duration-200">
              Start Analysis
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-4 h-14 font-semibold shadow-xl transform hover:scale-105 transition-all duration-200">
              View Governance
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Flow Automation</h3>
              <p className="text-blue-100">Real-time detection using Flow blockchain</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">AI Protection</h3>
              <p className="text-blue-100">Advanced algorithms detect suspicious patterns</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Community Votes</h3>
              <p className="text-blue-100">Decentralized governance on Filecoin</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
