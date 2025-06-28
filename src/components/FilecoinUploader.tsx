import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, Database } from "lucide-react";
import { useSynapseStorage } from "@/hooks/use-synapse-storage";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";

interface FilecoinUploaderProps {
  proposalId: string;
  proposalTitle: string;
  onUploadComplete?: (uploadInfo: any) => void;
}

export const FilecoinUploader = ({ proposalId, proposalTitle, onUploadComplete }: FilecoinUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { isConnected, isCalibnet } = useWallet();
  const { uploadFileMutation, uploadedInfo, handleReset, status, progress } = useSynapseStorage();
  const { isPending: isLoading, mutateAsync: uploadFile } = uploadFileMutation;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet to upload files",
        variant: "destructive",
      });
      return;
    }

    if (!isCalibnet) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Filecoin Calibnet to upload files",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadFile(file);
      if (onUploadComplete && uploadedInfo) {
        onUploadComplete(uploadedInfo);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  if (!isConnected) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Connect your MetaMask wallet to upload files to Filecoin</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isCalibnet) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Switch to Filecoin Calibnet to upload files</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span>Store on Filecoin Calibnet</span>
        </CardTitle>
        <CardDescription>
          Upload project documentation, evidence, or analysis files to be permanently stored on Filecoin
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            onChange={(e) => {
              e.target.files && setFile(e.target.files[0]);
              e.target.value = "";
            }}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-10 h-10 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
            <p className="text-lg font-medium">
              {file ? file.name : "Drop your file here, or click to select"}
            </p>
            {!file && (
              <p className="text-sm text-gray-500">
                Drag and drop your file, or click to browse
              </p>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading || !!uploadedInfo}
            className="flex-1"
          >
            {isLoading ? "Uploading..." : !uploadedInfo ? "Upload to Filecoin" : "Uploaded"}
          </Button>
          <Button
            onClick={() => {
              handleReset();
              setFile(null);
            }}
            disabled={!file || isLoading}
            variant="outline"
          >
            Reset
          </Button>
        </div>

        {/* Status and Progress */}
        {status && (
          <div className="space-y-2">
            <p
              className={`text-sm text-center ${
                status.includes("❌")
                  ? "text-red-500"
                  : status.includes("✅") || status.includes("🎉")
                    ? "text-green-500"
                    : "text-blue-600"
              }`}
            >
              {status}
            </p>
            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Uploaded File Info */}
        {uploadedInfo && !isLoading && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-800">File Uploaded Successfully</h4>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <span className="font-medium">File name:</span> {uploadedInfo.fileName}
              </div>
              <div>
                <span className="font-medium">File size:</span>{" "}
                {uploadedInfo.fileSize?.toLocaleString() || "N/A"} bytes
              </div>
              <div className="break-all">
                <span className="font-medium">CommP:</span> {uploadedInfo.commp}
              </div>
              <div className="break-all">
                <span className="font-medium">Transaction Hash:</span>{" "}
                {uploadedInfo.txHash}
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Database className="h-3 w-3 mr-1" />
                Stored on Filecoin Calibnet
              </Badge>
            </div>
          </div>
        )}

        {/* Proposal Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Proposal: {proposalId} - {proposalTitle}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 