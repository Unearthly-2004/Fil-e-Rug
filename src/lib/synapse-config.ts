// Synapse SDK Configuration for Fil-e-Rug
export const synapseConfig = {
  // Storage configuration
  storageCapacity: 10, // GB, maximum storage capacity
  persistencePeriod: 30, // days, data persistence duration
  minDaysThreshold: 10, // days, threshold for low-balance warnings
  withCDN: true, // Whether to use CDN for faster retrieval
  
  // Network configuration
  network: 'calibnet', // 'mainnet' or 'calibnet'
  
  // Contract addresses (Calibnet)
  contracts: {
    synapse: '0x...', // Synapse contract address
    pandora: '0x...', // Pandora service contract
    usdfc: '0x...',   // USDFC token contract
  },
  
  // API endpoints
  api: {
    baseUrl: 'https://api.synapse.filecoin.io',
    timeout: 30000, // 30 seconds
  }
};

// Storage metrics calculation
export const calculateStorageMetrics = (config: typeof synapseConfig) => {
  const { storageCapacity, persistencePeriod, withCDN } = config;
  
  // Base rate per GB per epoch (approximate)
  const baseRatePerGBPerEpoch = withCDN ? 0.001 : 0.0005; // USDFC
  
  // Calculate allowances
  const rateAllowance = storageCapacity * baseRatePerGBPerEpoch;
  const lockupAllowance = rateAllowance * persistencePeriod;
  
  return {
    rateAllowance,
    lockupAllowance,
    totalCost: lockupAllowance,
    dailyCost: rateAllowance * 2880, // 2880 epochs per day
  };
}; 