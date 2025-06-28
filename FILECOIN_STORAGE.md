# Filecoin Storage Integration

This document explains the Filecoin storage implementation for the Fil-E-Rug project, which separates and stores "rugged" and "safe" chains based on user manual voting.

## Overview

The Filecoin storage system provides decentralized, immutable storage for community voting results on crypto projects. When users vote on whether a project is a potential rug pull, the results are automatically categorized and stored on Filecoin with cryptographic proof.

## Architecture

### Components

1. **FilecoinStorageService** (`src/lib/filecoin-storage.ts`)
   - Core service for interacting with IPFS/Filecoin
   - Handles data categorization (rugged/safe/pending)
   - Provides storage proof verification
   - Manages storage statistics

2. **useFilecoinStorage Hook** (`src/hooks/use-filecoin-storage.ts`)
   - React hook for Filecoin storage operations
   - Provides state management and error handling
   - Integrates with React Query for caching

3. **ChainStorage Component** (`src/components/ChainStorage.tsx`)
   - UI for displaying stored chains by category
   - Shows storage statistics and verification options
   - Tabbed interface for rugged, safe, and pending chains

4. **GovernanceVoting Component** (`src/components/GovernanceVoting.tsx`)
   - Enhanced voting interface with Filecoin integration
   - Automatically stores results when voting threshold is reached
   - Real-time updates and storage confirmation

5. **FilecoinDemo Component** (`src/components/FilecoinDemo.tsx`)
   - Demo interface for testing storage functionality
   - Form for creating and storing demo chain data
   - Storage statistics display

## How It Works

### 1. Voting Process
- Users vote on proposals in the GovernanceVoting component
- Votes are tallied in real-time
- When a 60% majority is reached, the decision is finalized

### 2. Data Storage
- Chain data is structured with metadata, voting results, and risk factors
- Data is hashed using SHA-256 for integrity verification
- Stored on IPFS with a unique Content Identifier (CID)
- Categorized automatically based on voting results

### 3. Categorization Logic
```typescript
// 60% threshold for decision
if (rugPercentage >= 60) {
  finalDecision = 'rugged';
} else if (noRugPercentage >= 60) {
  finalDecision = 'safe';
} else {
  finalDecision = 'pending';
}
```

### 4. Storage Categories
- **Rugged Chains**: Projects confirmed as rug pulls
- **Safe Chains**: Projects confirmed as legitimate
- **Pending Chains**: Projects still under review

## Data Structure

```typescript
interface ChainData {
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
```

## Features

### Storage Proof Verification
- Each stored chain includes a cryptographic hash
- Verification ensures data integrity
- CID (Content Identifier) provides permanent reference

### Real-time Updates
- React Query provides automatic caching and updates
- Storage statistics update in real-time
- UI reflects current storage state

### Error Handling
- Comprehensive error handling for storage operations
- User-friendly error messages via toast notifications
- Graceful fallbacks for network issues

## Usage

### Basic Storage
```typescript
import { useFilecoinStorage } from '@/hooks/use-filecoin-storage';

const { storeChainData } = useFilecoinStorage();

const chainData = {
  id: "PROP-001",
  name: "Example Token",
  blockchain: "Ethereum",
  // ... other fields
};

await storeChainData(chainData);
```

### Retrieving Stored Data
```typescript
const { 
  ruggedChains, 
  safeChains, 
  pendingChains,
  storageStats 
} = useFilecoinStorage();
```

### Verification
```typescript
const { verifyStorageProof } = useFilecoinStorage();
const isValid = await verifyStorageProof(chainData);
```

## Configuration

### IPFS Setup
The system uses Infura's IPFS gateway for demo purposes. In production, you can configure:

```typescript
const ipfs = create({
  host: 'your-ipfs-gateway.com',
  port: 5001,
  protocol: 'https'
});
```

### Voting Threshold
The voting threshold can be adjusted in `filecoin-storage.ts`:

```typescript
// Current: 60% majority required
if (rugPercentage >= 60) {
  finalDecision = 'rugged';
}
```

## Security Features

1. **Cryptographic Hashing**: All data is hashed using SHA-256
2. **Immutable Storage**: Once stored, data cannot be modified
3. **Verification**: Storage proofs can be verified independently
4. **Decentralized**: No single point of failure

## Future Enhancements

1. **Filecoin Mainnet Integration**: Direct integration with Filecoin mainnet
2. **Advanced Verification**: Multi-signature verification for important decisions
3. **Storage Incentives**: Token rewards for storage providers
4. **Cross-chain Support**: Support for multiple blockchain networks
5. **API Integration**: REST API for external applications

## Dependencies

- `ipfs-http-client`: IPFS client for storage operations
- `crypto-js`: Cryptographic hashing functions
- `@tanstack/react-query`: State management and caching
- `lucide-react`: Icons for UI components

## Getting Started

1. Install dependencies:
```bash
npm install ipfs-http-client crypto-js @types/crypto-js
```

2. Configure IPFS gateway (optional):
```typescript
// In filecoin-storage.ts
const ipfs = create({
  host: 'your-gateway.com',
  port: 5001,
  protocol: 'https'
});
```

3. Use the components in your application:
```typescript
import ChainStorage from '@/components/ChainStorage';
import FilecoinDemo from '@/components/FilecoinDemo';
```

## Troubleshooting

### Common Issues

1. **IPFS Connection Failed**: Check gateway configuration and network connectivity
2. **Storage Operation Failed**: Verify data structure and required fields
3. **Verification Failed**: Check if CID is valid and data hasn't been corrupted

### Debug Mode
Enable debug logging by setting:
```typescript
console.log('Storage operation:', result);
```

## Contributing

When contributing to the Filecoin storage system:

1. Follow the existing code structure
2. Add proper error handling
3. Include TypeScript types
4. Update documentation
5. Test with both success and failure scenarios 