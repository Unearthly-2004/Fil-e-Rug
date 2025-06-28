import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import DetectionFactors from "@/components/DetectionFactors";
import GovernanceVoting from "@/components/GovernanceVoting";
import ChainStorage from "@/components/ChainStorage";
import FilecoinDemo from "@/components/FilecoinDemo";
import WalletDemo from "@/components/WalletDemo";
import BlockchainIntegration from "@/components/BlockchainIntegration";
import WalletTest from "@/components/WalletTest";
import WagmiDebug from "@/components/WagmiDebug";
import SimpleWalletConnect from "@/components/SimpleWalletConnect";
import PlainButtonTest from "@/components/PlainButtonTest";
import MemecoinList from "@/components/MemecoinList";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* Wallet Test Section - Temporary for debugging */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Wallet Connection Test</h2>
            <p className="text-gray-600">Debug MetaMask connection issues</p>
          </div>
          <div className="space-y-8">
            <PlainButtonTest />
            <SimpleWalletConnect />
            <WalletTest />
            <WagmiDebug />
          </div>
        </div>
      </section>
      
      {/* Memecoin Voting Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Vote on Latest Memecoins</h2>
            <p className="text-gray-600">Fetched live from CoinGecko. Vote on-chain for your favorite or most suspicious memecoins!</p>
          </div>
          <MemecoinList />
        </div>
      </section>
      
      <DetectionFactors />
      <WalletDemo />
      <GovernanceVoting />
      <ChainStorage />
      <FilecoinDemo />
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
