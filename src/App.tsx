import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wagmi-config'
import { Toaster } from "@/components/ui/sonner"
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import DetectionFactors from './components/DetectionFactors'
import MemecoinList from './components/MemecoinList'
import GovernanceVoting from './components/GovernanceVoting'
import ChainStorage from './components/ChainStorage'
import BlockchainIntegration from './components/BlockchainIntegration'
import SynapseStorageManager from './components/SynapseStorageManager'
import SynapseFileUploader from './components/SynapseFileUploader'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <HeroSection />
            <DetectionFactors />
            <MemecoinList />
            <GovernanceVoting />
            
            {/* Synapse Storage Section */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Filecoin Synapse Storage
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Advanced file storage with Proof of Data Possession (PDP) on Filecoin
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <SynapseStorageManager />
                  <SynapseFileUploader />
                </div>
              </div>
            </section>
            
            <ChainStorage />
            <BlockchainIntegration />
          </main>
          <Toaster />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
