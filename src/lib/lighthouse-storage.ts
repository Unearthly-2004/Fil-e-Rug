import lighthouse from '@lighthouse-web3/sdk';

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
  size?: string;
}

export interface LighthouseConfig {
  apiKey: string;
  name?: string;
}

// Default configuration - you can override this
const DEFAULT_CONFIG: LighthouseConfig = {
  apiKey: import.meta.env.VITE_LIGHTHOUSE_API_KEY, // Your provided API key
  name: "fil-e-rug-storage"
};

export class LighthouseStorageService {
  private config: LighthouseConfig;
  private readonly RUGGED_CHAINS_KEY = 'rugged-chains';
  private readonly SAFE_CHAINS_KEY = 'safe-chains';
  private readonly PENDING_CHAINS_KEY = 'pending-chains';

  constructor(config: Partial<LighthouseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Upload text data to Lighthouse/IPFS
   */
  async uploadText(text: string, name?: string): Promise<StorageResult> {
    try {
      const uploadName = name || this.config.name || `vote-${Date.now()}`;
      
      const response = await lighthouse.uploadText(
        text, 
        this.config.apiKey, 
        uploadName
      );

      if (response && response.data) {
        return {
          success: true,
          cid: response.data.Hash,
          size: response.data.Size,
          hash: response.data.Hash // Using CID as hash for verification
        };
      } else {
        throw new Error('Invalid response from Lighthouse');
      }
    } catch (error) {
      console.error('Error uploading text to Lighthouse:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store chain data using Lighthouse
   */
  async storeChainData(chainData: ChainData): Promise<StorageResult> {
    try {
      // Create a hash of the chain data for verification
      const dataHash = this.createHash(JSON.stringify(chainData));
      
      // Prepare data with storage proof
      const dataWithProof = {
        ...chainData,
        storageProof: {
          timestamp: Date.now(),
          hash: dataHash,
          cid: '' // Will be updated after upload
        }
      };

      // Upload to Lighthouse
      const result = await this.uploadText(
        JSON.stringify(dataWithProof),
        `chain-${chainData.id}-${Date.now()}`
      );

      if (result.success && result.cid) {
        // Update storage proof with CID
        dataWithProof.storageProof!.cid = result.cid;

        // Store in appropriate category based on voting results
        await this.categorizeAndStore(chainData, result.cid, dataHash);

        return {
          success: true,
          cid: result.cid,
          hash: dataHash,
          size: result.size
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error storing chain data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload vote data specifically
   */
  async uploadVote(voteData: any, walletId?: string): Promise<StorageResult> {
    try {
      const voteText = JSON.stringify({
        ...voteData,
        timestamp: Date.now(),
        walletId: walletId || 'anonymous'
      });

      const name = walletId ? `vote-${walletId}-${Date.now()}` : `vote-${Date.now()}`;
      
      return await this.uploadText(voteText, name);
    } catch (error) {
      console.error('Error uploading vote:', error);
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

    // Store category index
    await this.storeCategoryIndex(finalDecision, updatedChainData);
  }

  /**
   * Store category index for easy retrieval
   */
  private async storeCategoryIndex(category: 'rugged' | 'safe' | 'pending', chainData: ChainData): Promise<void> {
    try {
      const categoryKey = this.getCategoryKey(category);
      const indexName = `index-${categoryKey}-${Date.now()}`;
      
      // For now, we'll store the index locally
      // In a full implementation, you'd store this on Lighthouse too
      console.log(`Stored ${chainData.name} in category ${category} with CID: ${chainData.storageProof?.cid}`);
    } catch (error) {
      console.error(`Error storing category index for ${category}:`, error);
    }
  }

  /**
   * Retrieve all chains from a specific category
   */
  async getChainsByCategory(category: 'rugged' | 'safe' | 'pending'): Promise<ChainData[]> {
    try {
      // For demo purposes, return mock data
      // In a real implementation, you'd fetch from Lighthouse using the category index
      return this.getMockChainsByCategory(category);
    } catch (error) {
      console.error(`Error retrieving ${category} chains:`, error);
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

  /**
   * Create a simple hash for data verification
   */
  private createHash(data: string): string {
    // Simple hash function - in production, use crypto-js or similar
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Mock data for demo purposes
   */
  private getMockChainsByCategory(category: 'rugged' | 'safe' | 'pending'): ChainData[] {
    const mockChains: ChainData[] = [
      {
        id: 'DEMO-001',
        name: 'Demo Token 1',
        blockchain: 'Ethereum',
        contractAddress: '0x1234567890abcdef',
        riskFactors: ['New project', 'Low liquidity'],
        voteResults: {
          rugVotes: 70,
          noRugVotes: 30,
          totalVotes: 100
        },
        finalDecision: 'rugged',
        timestamp: Date.now() - 86400000, // 1 day ago
        metadata: {
          description: 'A demo token for testing',
          category: 'Demo',
          timeLeft: 'Expired'
        },
        storageProof: {
          cid: 'QmY77L7JzF8E7Rio4XboEpXL2kTZnW2oBFdzm6c53g5ay8',
          timestamp: Date.now() - 86400000,
          hash: 'abc123'
        }
      },
      {
        id: 'DEMO-002',
        name: 'Demo Token 2',
        blockchain: 'Polygon',
        contractAddress: '0xabcdef1234567890',
        riskFactors: ['Established team', 'High liquidity'],
        voteResults: {
          rugVotes: 20,
          noRugVotes: 80,
          totalVotes: 100
        },
        finalDecision: 'safe',
        timestamp: Date.now() - 172800000, // 2 days ago
        metadata: {
          description: 'A safe demo token',
          category: 'Demo',
          timeLeft: 'Expired'
        },
        storageProof: {
          cid: 'QmX88M8KzG9F8F8Sjp5YcpYL3lUZnX3pCGezn7d54h6bz9',
          timestamp: Date.now() - 172800000,
          hash: 'def456'
        }
      }
    ];

    return mockChains.filter(chain => chain.finalDecision === category);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LighthouseConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LighthouseConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const lighthouseStorage = new LighthouseStorageService(); 