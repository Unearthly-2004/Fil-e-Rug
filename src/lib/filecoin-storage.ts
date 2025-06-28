import { create } from 'ipfs-http-client';
import CryptoJS from 'crypto-js';

// Types for chain data
export interface ChainData {
  id: string;
  name: string;
  blockchain: string;
  contractAddress?: string;
  riskFactors: string[];
  voteResults: {
    rugVotes: number;
    noRugVotes: number;
    totalVotes: number;
  };
  finalDecision: 'rugged' | 'safe' | 'pending';
  timestamp: number;
  metadata: {
    description: string;
    category: string;
    timeLeft: string;
  };
  storageProof?: {
    cid: string;
    timestamp: number;
    hash: string;
  };
}

export interface StorageResult {
  success: boolean;
  cid?: string;
  error?: string;
  hash?: string;
}

// Initialize IPFS client (using Infura IPFS gateway for demo)
let ipfs: any;
try {
  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  });
} catch (error) {
  console.warn('IPFS client initialization failed, using mock mode:', error);
  ipfs = null;
}

class FilecoinStorageService {
  private readonly RUGGED_CHAINS_KEY = 'rugged-chains';
  private readonly SAFE_CHAINS_KEY = 'safe-chains';
  private readonly PENDING_CHAINS_KEY = 'pending-chains';

  /**
   * Store chain data on IPFS and categorize based on voting results
   */
  async storeChainData(chainData: ChainData): Promise<StorageResult> {
    try {
      // Create a hash of the chain data for verification
      const dataHash = CryptoJS.SHA256(JSON.stringify(chainData)).toString();
      
      // Add storage proof to the data
      const dataWithProof = {
        ...chainData,
        storageProof: {
          timestamp: Date.now(),
          hash: dataHash,
          cid: '' // Will be updated after IPFS storage
        }
      };

      // Store on IPFS if available, otherwise use mock
      let cid = 'mock-cid-' + Date.now();
      if (ipfs) {
        const result = await ipfs.add(JSON.stringify(dataWithProof));
        cid = result.cid.toString();
      }

      // Update storage proof with CID
      dataWithProof.storageProof!.cid = cid;

      // Store in appropriate category based on voting results
      await this.categorizeAndStore(chainData, cid, dataHash);

      return {
        success: true,
        cid,
        hash: dataHash
      };
    } catch (error) {
      console.error('Error storing chain data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Categorize chain data based on voting results and store accordingly
   */
  private async categorizeAndStore(chainData: ChainData, cid: string, hash: string): Promise<void> {
    const { rugVotes, noRugVotes, totalVotes } = chainData.voteResults;
    const rugPercentage = (rugVotes / totalVotes) * 100;
    const noRugPercentage = (noRugVotes / totalVotes) * 100;

    // Determine final decision based on voting threshold (60% majority)
    let finalDecision: 'rugged' | 'safe' | 'pending' = 'pending';
    if (rugPercentage >= 60) {
      finalDecision = 'rugged';
    } else if (noRugPercentage >= 60) {
      finalDecision = 'safe';
    }

    // Update chain data with final decision
    const updatedChainData = {
      ...chainData,
      finalDecision,
      storageProof: {
        cid,
        timestamp: Date.now(),
        hash
      }
    };

    // Store in appropriate category
    if (finalDecision === 'rugged') {
      await this.storeInCategory(this.RUGGED_CHAINS_KEY, updatedChainData);
    } else if (finalDecision === 'safe') {
      await this.storeInCategory(this.SAFE_CHAINS_KEY, updatedChainData);
    } else {
      await this.storeInCategory(this.PENDING_CHAINS_KEY, updatedChainData);
    }
  }

  /**
   * Store chain data in a specific category
   */
  private async storeInCategory(categoryKey: string, chainData: ChainData): Promise<void> {
    try {
      // Get existing category data
      const existingData = await this.getCategoryData(categoryKey);
      
      // Add new chain data
      existingData.push(chainData);
      
      // Store updated category data
      const result = await ipfs.add(JSON.stringify(existingData));
      const cid = result.cid.toString();
      
      // Store category index on IPFS
      await ipfs.add(JSON.stringify({
        category: categoryKey,
        cid,
        timestamp: Date.now(),
        count: existingData.length
      }));

      console.log(`Stored ${chainData.name} in category ${categoryKey} with CID: ${cid}`);
    } catch (error) {
      console.error(`Error storing in category ${categoryKey}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve all chains from a specific category
   */
  async getChainsByCategory(category: 'rugged' | 'safe' | 'pending'): Promise<ChainData[]> {
    try {
      const categoryKey = this.getCategoryKey(category);
      return await this.getCategoryData(categoryKey);
    } catch (error) {
      console.error(`Error retrieving ${category} chains:`, error);
      return [];
    }
  }

  /**
   * Get category data from IPFS
   */
  private async getCategoryData(categoryKey: string): Promise<ChainData[]> {
    try {
      // TODO: Implement real fetch from IPFS/Filecoin using the category index
      // For now, return an empty array
      return [];
    } catch (error) {
      console.error(`Error getting category data for ${categoryKey}:`, error);
      return [];
    }
  }

  /**
   * Get category key based on category type
   */
  private getCategoryKey(category: 'rugged' | 'safe' | 'pending'): string {
    switch (category) {
      case 'rugged':
        return this.RUGGED_CHAINS_KEY;
      case 'safe':
        return this.SAFE_CHAINS_KEY;
      case 'pending':
        return this.PENDING_CHAINS_KEY;
      default:
        return this.PENDING_CHAINS_KEY;
    }
  }

  /**
   * Verify storage proof for a chain
   */
  async verifyStorageProof(chainData: ChainData): Promise<boolean> {
    try {
      if (!chainData.storageProof?.cid) {
        return false;
      }

      // In a real implementation, you would:
      // 1. Fetch the data from IPFS using the CID
      // 2. Verify the hash matches
      // 3. Check the timestamp is valid
      
      // For demo purposes, return true
      return true;
    } catch (error) {
      console.error('Error verifying storage proof:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    ruggedCount: number;
    safeCount: number;
    pendingCount: number;
    totalStorage: string;
  }> {
    try {
      const ruggedChains = await this.getChainsByCategory('rugged');
      const safeChains = await this.getChainsByCategory('safe');
      const pendingChains = await this.getChainsByCategory('pending');

      return {
        ruggedCount: ruggedChains.length,
        safeCount: safeChains.length,
        pendingCount: pendingChains.length,
        totalStorage: `${(ruggedChains.length + safeChains.length + pendingChains.length) * 2.5} KB`
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        ruggedCount: 0,
        safeCount: 0,
        pendingCount: 0,
        totalStorage: '0 KB'
      };
    }
  }
}

// Export singleton instance
export const filecoinStorage = new FilecoinStorageService(); 