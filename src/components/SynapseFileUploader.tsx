import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertTriangle,
  X,
  Download,
  ExternalLink
} from "lucide-react";
import { useSynapseUpload } from "@/hooks/use-synapse-upload";
import { useWallet } from "@/hooks/useWallet";

const SynapseFileUploader: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const { uploadFile, progress, uploadedFiles, isUploading, error, clearError } = useSynapseUpload();
  const { isConnected, isCalibnet } = useWallet();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      await uploadFile(file);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'preflight':
        return <AlertTriangle className="h-4 w-4" />;
      case 'proofset':
        return <File className="h-4 w-4" />;
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'preflight':
        return 'text-yellow-500';
      case 'proofset':
        return 'text-blue-500';
      case 'upload':
        return 'text-purple-500';
      case 'complete':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Synapse File Uploader
          </CardTitle>
          <CardDescription>
            Connect your wallet to upload files to Filecoin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect your MetaMask wallet to upload files to Filecoin storage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isCalibnet) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Synapse File Uploader
          </CardTitle>
          <CardDescription>
            Switch to Calibnet to upload files to Filecoin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Filecoin Calibnet to upload files to Filecoin storage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Synapse File Uploader
        </CardTitle>
        <CardDescription>
          Upload files to Filecoin with Proof of Data Possession (PDP)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Upload files to Filecoin</h3>
          <p className="text-gray-500 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span>
                {isUploading ? 'Uploading...' : 'Select Files'}
              </span>
            </Button>
          </label>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStageIcon(progress.stage)}
                <span className={getStageColor(progress.stage)}>
                  {progress.message}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress.percentage} className="h-2" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">0%</span>
                <span className="text-gray-500">100%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="ml-2 h-6 px-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Uploaded Files ({uploadedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.timestamp)}
                        </p>
                        <p className="text-xs text-gray-400">
                          CID: {file.cid.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {file.cid.slice(0, 10)}...
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default SynapseFileUploader; 