
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import DetectionFactors from "@/components/DetectionFactors";
import GovernanceVoting from "@/components/GovernanceVoting";
import BlockchainIntegration from "@/components/BlockchainIntegration";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DetectionFactors />
      <GovernanceVoting />
      <BlockchainIntegration />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Fil-E-Rug</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Protecting the crypto ecosystem through advanced AI detection and decentralized governance.
              Built on Flow and Filecoin for maximum security and transparency.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Documentation</a>
              <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
              <a href="#" className="text-gray-400 hover:text-white">Discord</a>
              <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
