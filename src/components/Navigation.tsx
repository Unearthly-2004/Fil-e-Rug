
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Users } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Fil-E-Rug
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#dashboard" className="text-gray-600 hover:text-purple-600 font-medium">
              Dashboard
            </a>
            <a href="#governance" className="text-gray-600 hover:text-purple-600 font-medium">
              Governance
            </a>
            <a href="#analytics" className="text-gray-600 hover:text-purple-600 font-medium">
              Analytics
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden sm:flex">
              Connect Wallet
            </Button>
            <Button className="crypto-gradient text-white">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
