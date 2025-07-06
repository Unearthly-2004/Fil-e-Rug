import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import DetectionFactors from '@/components/DetectionFactors';
import ChainStorage from '@/components/ChainStorage';
import BlockchainIntegration from '@/components/BlockchainIntegration';
import GovernanceVoting from '@/components/GovernanceVoting';
import OnChainGovernance from '@/components/OnChainGovernance';
import MemecoinVoting from '@/components/MemecoinVoting';
import FilecoinDemo from '@/components/FilecoinDemo';
import SynapseStorageManager from '@/components/SynapseStorageManager';
import SynapseFileUploader from '@/components/SynapseFileUploader';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import MyVotes from './pages/MyVotes';
import Chatbot from './pages/Chatbot';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/governance" element={<OnChainGovernance />} />
          <Route path="/memecoin-voting" element={<MemecoinVoting />} />
          <Route path="/filecoin-demo" element={<FilecoinDemo />} />
          <Route path="/synapse-storage" element={<SynapseStorageManager />} />
          <Route path="/synapse-upload" element={<SynapseFileUploader />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/my-votes" element={<MyVotes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
