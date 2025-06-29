import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Shield, Home, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Shield className="h-16 w-16 text-purple-600" />
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
