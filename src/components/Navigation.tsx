import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Users, Wallet, AlertTriangle, Coins, Vote } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const { 
    address, 
    connect, 
    disconnect, 
    switchToCalibnet, 
    isConnecting, 
    isConnected, 
    isCalibnet 
  } = useWallet();

  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Fil-E-Rug
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              className={`text-gray-600 hover:text-purple-600 font-medium transition-all duration-200 ${
                isActive('/') ? 'text-purple-600' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/memecoin-voting"
              className={`text-gray-600 hover:text-purple-600 font-medium transition-all duration-200 flex items-center space-x-1 ${
                isActive('/memecoin-voting') ? 'text-purple-600' : ''
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>Memecoin Voting</span>
            </Link>
            <Link 
              to="/governance"
              className={`text-gray-600 hover:text-purple-600 font-medium transition-all duration-200 flex items-center space-x-1 ${
                isActive('/governance') ? 'text-purple-600' : ''
              }`}
            >
              <Vote className="h-4 w-4" />
              <span>Governance</span>
            </Link>
            <Link 
              to="/synapse-storage"
              className={`text-gray-600 hover:text-purple-600 font-medium transition-all duration-200 ${
                isActive('/synapse-storage') ? 'text-purple-600' : ''
              }`}
            >
              Storage
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            {isConnected && !isCalibnet && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchToCalibnet}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Switch to Calibnet
              </Button>
            )}
            
            {isConnected && isCalibnet && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Calibnet
              </div>
            )}

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
