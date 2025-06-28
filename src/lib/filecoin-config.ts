/*
    This is the configuration for the Filecoin storage system using Synapse.
    It is used to configure the storage capacity, the persistence period, and the minimum number of days of lockup needed.
*/

export const filecoinConfig = {
  // The number of GB of storage capacity needed to be sufficient
  storageCapacity: 10,
  // The number of days of lockup needed to be sufficient
  persistencePeriod: 30,
  // The minimum number of days of lockup needed to be sufficient
  minDaysThreshold: 10,
  // Whether to use CDN for the storage for faster retrieval
  withCDN: true,
} satisfies {
  storageCapacity: number;
  persistencePeriod: number;
  minDaysThreshold: number;
  withCDN: boolean;
};

// Network configuration
export const getNetwork = (chainId: number) => {
  const network =
    chainId === 314159 ? "calibration" : chainId === 314 ? "mainnet" : null;
  return network;
};

// Constants
export const PROOF_SET_CREATION_FEE = BigInt(1000000000000000000); // 1 USDFC 