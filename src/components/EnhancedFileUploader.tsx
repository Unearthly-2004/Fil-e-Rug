import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, Database, X, File } from "lucide-react";
import { useSynapseStorage } from "@/hooks/use-synapse-storage";
import { useWallet } from "@/hooks/useWallet";
import { useProofContract } from "@/hooks/useProofContract";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  cid: string;
  txHash: string;
  timestamp: number;
}

interface EnhancedFileUploaderProps {
  proposalId: string;
  proposalTitle: string;
  userVote: 'rug' | 'no-rug';
  onUploadComplete?: (files: UploadedFile[]) => void;
  onGenerateProof?: (proofData: any) => void;
}

export const EnhancedFileUploader = ({ 
  proposalId, 
  proposalTitle, 
  userVote,
  onUploadComplete,
  onGenerateProof 
}: EnhancedFileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const { isConnected, isCalibnet, hasEnoughBalance } = useWallet();
  const { uploadFileMutation, uploadedInfo, handleReset, status, progress } = useSynapseStorage();
  const { isPending: isLoading, mutateAsync: uploadFile } = uploadFileMutation;
  const { deployProofContract, isDeploying } = useProofContract();

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAllFiles = async () => {
    if (!files.length) return;
    
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

    if (!hasEnoughBalance()) {
      toast({
        title: "Insufficient Balance",
        description: "You need tFIL for gas and tUSDFC for storage payments",
        variant: "destructive",
      });
      return;
    }

    const newUploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      try {
        await uploadFile(file);
        
        if (uploadedInfo) {
          const uploadedFile: UploadedFile = {
            id: Date.now().toString(),
            name: uploadedInfo.fileName || file.name,
            size: uploadedInfo.fileSize || file.size,
            cid: uploadedInfo.commp || '',
            txHash: uploadedInfo.txHash || '',
            timestamp: Date.now(),
          };
          newUploadedFiles.push(uploadedFile);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    setFiles([]);
    handleReset();

    if (onUploadComplete) {
      onUploadComplete([...uploadedFiles, ...newUploadedFiles]);
    }

    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${newUploadedFiles.length} files to Filecoin`,
    });
  };

  const generateProof = async () => {
    if (!uploadedFiles.length) return;

    try {
      const proofData = await deployProofContract(proposalId, userVote, uploadedFiles);
      
      if (proofData && onGenerateProof) {
        onGenerateProof(proofData);
      }
    } catch (error) {
      console.error('Proof generation error:', error);
      toast({
        title: "Proof Generation Failed",
        description: "Failed to generate proof contract",
        variant: "destructive",
      });
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
          <span>Store Evidence on Filecoin Calibnet</span>
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
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-10 h-10 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
            <p className="text-lg font-medium">
              Drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop your files, or click to browse
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Selected Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={uploadAllFiles}
            disabled={!files.length || isLoading || !hasEnoughBalance()}
            className="flex-1"
          >
            {isLoading ? "Uploading..." : "Upload to Filecoin"}
          </Button>
          <Button
            onClick={() => {
              setFiles([]);
              handleReset();
            }}
            disabled={!files.length || isLoading}
            variant="outline"
          >
            Clear
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

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Uploaded Files:</h4>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{file.name}</span>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <div><strong>CID:</strong> {file.cid}</div>
                  <div><strong>Transaction:</strong> {file.txHash}</div>
                  <div><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Proof Button */}
        {uploadedFiles.length > 0 && (
          <div className="pt-4 border-t">
            <Button
              onClick={generateProof}
              disabled={isDeploying}
              className="w-full"
              size="lg"
            >
              {isDeploying ? "Deploying Proof Contract..." : "Generate Proof Contract"}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will deploy a contract containing your vote ({userVote.toUpperCase()}) and file references as permanent proof.
            </p>
          </div>
        )}

        {/* Proposal Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Proposal: {proposalId} - {proposalTitle}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Your Vote: <span className="font-medium">{userVote.toUpperCase()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 