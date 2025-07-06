import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lighthouseStorage, ChainData, StorageResult } from '@/lib/lighthouse-storage';
import { toast } from '@/hooks/use-toast';

export const useLighthouseStorage = () => {
  const queryClient = useQueryClient();
  const [isStoring, setIsStoring] = useState(false);

  // Query for rugged chains
  const {
    data: ruggedChains,
    isLoading: loadingRugged,
    error: ruggedError
  } = useQuery({
    queryKey: ['lighthouse-storage', 'rugged'],
    queryFn: () => lighthouseStorage.getChainsByCategory('rugged'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for safe chains
  const {
    data: safeChains,
    isLoading: loadingSafe,
    error: safeError
  } = useQuery({
    queryKey: ['lighthouse-storage', 'safe'],
    queryFn: () => lighthouseStorage.getChainsByCategory('safe'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for pending chains
  const {
    data: pendingChains,
    isLoading: loadingPending,
    error: pendingError
  } = useQuery({
    queryKey: ['lighthouse-storage', 'pending'],
    queryFn: () => lighthouseStorage.getChainsByCategory('pending'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for storage statistics
  const {
    data: storageStats,
    isLoading: loadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['lighthouse-storage', 'stats'],
    queryFn: () => lighthouseStorage.getStorageStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for storing chain data
  const storeChainMutation = useMutation({
    mutationFn: (chainData: ChainData) => lighthouseStorage.storeChainData(chainData),
    onSuccess: (result: StorageResult) => {
      if (result.success) {
        toast({
          title: "Success",
          description: `Chain data stored successfully with CID: ${result.cid}`,
        });
        
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries({ queryKey: ['lighthouse-storage'] });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to store chain data",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to store chain data",
        variant: "destructive",
      });
    },
  });

  // Mutation for uploading vote data
  const uploadVoteMutation = useMutation({
    mutationFn: ({ voteData, walletId }: { voteData: any; walletId?: string }) => 
      lighthouseStorage.uploadVote(voteData, walletId),
    onSuccess: (result: StorageResult) => {
      if (result.success) {
        toast({
          title: "Vote Uploaded",
          description: `Vote stored successfully with CID: ${result.cid}`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload vote",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload vote",
        variant: "destructive",
      });
    },
  });

  // Function to store chain data
  const storeChainData = useCallback(async (chainData: ChainData) => {
    setIsStoring(true);
    try {
      await storeChainMutation.mutateAsync(chainData);
    } finally {
      setIsStoring(false);
    }
  }, [storeChainMutation]);

  // Function to upload vote data
  const uploadVote = useCallback(async (voteData: any, walletId?: string) => {
    return await uploadVoteMutation.mutateAsync({ voteData, walletId });
  }, [uploadVoteMutation]);

  // Function to upload text
  const uploadText = useCallback(async (text: string, name?: string) => {
    return await lighthouseStorage.uploadText(text, name);
  }, []);

  // Function to verify storage proof
  const verifyStorageProof = useCallback(async (chainData: ChainData) => {
    try {
      const isValid = await lighthouseStorage.verifyStorageProof(chainData);
      if (isValid) {
        toast({
          title: "Verification Successful",
          description: "Storage proof verified successfully",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Storage proof verification failed",
          variant: "destructive",
        });
      }
      return isValid;
    } catch (error) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Function to refresh all data
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['lighthouse-storage'] });
  }, [queryClient]);

  return {
    // Data
    ruggedChains: ruggedChains || [],
    safeChains: safeChains || [],
    pendingChains: pendingChains || [],
    storageStats: storageStats || {
      ruggedCount: 0,
      safeCount: 0,
      pendingCount: 0,
      totalStorage: '0 KB'
    },

    // Loading states
    loadingRugged,
    loadingSafe,
    loadingPending,
    loadingStats,
    isStoring,
    isUploadingVote: uploadVoteMutation.isPending,

    // Errors
    ruggedError,
    safeError,
    pendingError,
    statsError,

    // Actions
    storeChainData,
    uploadVote,
    uploadText,
    verifyStorageProof,
    refreshData,
  };
}; 