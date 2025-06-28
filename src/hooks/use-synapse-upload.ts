import { useState } from 'react';
import { useWallet } from './useWallet';
import { toast } from 'sonner';

interface UploadProgress {
  stage: 'preflight' | 'proofset' | 'upload' | 'complete';
  percentage: number;
  message: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  cid: string;
  txHash: string;
  timestamp: number;
}

export const useSynapseUpload = () => {
  const [progress, setProgress] = useState<UploadProgress>({
    stage: 'preflight',
    percentage: 0,
    message: 'Ready to upload',
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { provider, address, isConnected, isCalibnet } = useWallet();

  const preflightCheck = async (file: File) => {
    setProgress({
      stage: 'preflight',
      percentage: 10,
      message: 'Checking balance and permissions...',
    });

    // Mock preflight check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate balance check
    const hasBalance = Math.random() > 0.1; // 90% success rate
    
    if (!hasBalance) {
      throw new Error('Insufficient USDFC balance for upload');
    }

    setProgress({
      stage: 'preflight',
      percentage: 100,
      message: 'Preflight check passed',
    });
  };

  const getProofset = async () => {
    setProgress({
      stage: 'proofset',
      percentage: 20,
      message: 'Resolving proof set...',
    });

    // Mock proofset resolution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const proofsetId = 'proofset_' + Math.random().toString(36).substr(2, 9);
    
    setProgress({
      stage: 'proofset',
      percentage: 100,
      message: `Using proof set: ${proofsetId}`,
    });

    return proofsetId;
  };

  const uploadFile = async (file: File) => {
    if (!isConnected) {
      toast.error("Please connect your MetaMask wallet");
      return;
    }

    if (!isCalibnet) {
      toast.error("Please switch to Filecoin Calibnet");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Preflight check
      await preflightCheck(file);

      // Step 2: Get or create proofset
      const proofsetId = await getProofset();

      // Step 3: Upload file
      setProgress({
        stage: 'upload',
        percentage: 30,
        message: 'Uploading to Filecoin...',
      });

      // Simulate file upload with progress
      for (let i = 30; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress({
          stage: 'upload',
          percentage: i,
          message: `Uploading... ${i}%`,
        });
      }

      // Step 4: Complete upload
      setProgress({
        stage: 'complete',
        percentage: 100,
        message: 'Upload complete!',
      });

      // Generate mock file data
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        cid: 'bafy' + Math.random().toString(36).substr(2, 58),
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: Date.now(),
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      toast.success(`File uploaded successfully! CID: ${uploadedFile.cid.slice(0, 10)}...`);

      return uploadedFile;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      toast.error(`Upload failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setProgress({
          stage: 'preflight',
          percentage: 0,
          message: 'Ready to upload',
        });
      }, 2000);
    }
  };

  return {
    uploadFile,
    progress,
    uploadedFiles,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}; 