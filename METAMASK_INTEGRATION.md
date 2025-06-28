# MetaMask Integration & On-Chain Voting

This document explains the MetaMask wallet integration and on-chain voting functionality for the Fil-E-Rug project using Filecoin Calibnet.

## Overview

The application now supports full MetaMask integration for on-chain voting on Filecoin Calibnet. Users can connect their MetaMask wallet, switch to the Calibnet network, and vote on crypto projects with transactions stored on the blockchain.

## Features

### 🔗 **MetaMask Wallet Integration**
- Automatic wallet detection and connection
- Account change handling
- Network switching to Filecoin Calibnet
- Wallet status display in navigation

### 🗳️ **On-Chain Voting**
- Real-time voting on proposals
- Transaction confirmation and status
- Vote verification and duplicate prevention
- Integration with PandoraService smart contract

### 🌐 **Network Management**
- Automatic Calibnet network detection
- One-click network switching
- Network status indicators
- Fallback network addition

## Architecture

### Components

1. **useWallet Hook** (`src/hooks/useWallet.ts`)
   - MetaMask provider detection and management
   - Account and network state management
   - Connection and disconnection handling
   - Network switching functionality

2. **filecoin-vote Service** (`src/lib/filecoin-vote.ts`)
   - On-chain voting functions
   - Smart contract interaction
   - Vote verification and counting
   - Transaction handling

3. **Navigation Component** (`src/components/Navigation.tsx`)
   - Wallet connection button
   - Network status display
   - Account address display
   - Network switching controls

4. **GovernanceVoting Component** (`src/components/GovernanceVoting.tsx`)
   - Enhanced voting interface with wallet integration
   - On-chain vote submission
   - Real-time vote status updates
   - Error handling and user feedback

5. **WalletDemo Component** (`src/components/WalletDemo.tsx`)
   - Wallet connection demonstration
   - Setup instructions
   - Network information display
   - Status indicators

## Smart Contract Integration

### PandoraService Contract
- **Address**: `0xf49ba5eaCdFD5EE3744efEdf413791935FE4D4c5`
- **Network**: Filecoin Calibnet (Chain ID: 314159)
- **Functions**:
  - `vote(string proposalId, bool vote)` - Submit a vote
  - `getVoteCount(string proposalId)` - Get vote counts
  - `hasVoted(string proposalId, address voter)` - Check if user voted

### Network Configuration
```javascript
{
  chainId: "0x4cb2f", // 314159 in hex
  chainName: "Filecoin - Calibration",
  nativeCurrency: {
    name: "tFIL",
    symbol: "tFIL",
    decimals: 18,
  },
  rpcUrls: ["https://api.calibration.node.glif.io/rpc/v1"],
  blockExplorerUrls: ["https://calibration.filfox.info/en"],
}
```

## Usage Flow

### 1. Wallet Connection
```typescript
import { useWallet } from '@/hooks/useWallet';

const { connect, isConnected, address } = useWallet();

// Connect wallet
await connect();
```

### 2. Network Switching
```typescript
const { switchToCalibnet, isCalibnet } = useWallet();

// Switch to Calibnet
await switchToCalibnet();
```

### 3. On-Chain Voting
```typescript
import { voteOnChain } from '@/lib/filecoin-vote';

const result = await voteOnChain(provider, proposalId, true); // true = safe, false = rug
```

## User Experience

### Connection Flow
1. User clicks "Connect Wallet" button
2. MetaMask popup appears requesting connection
3. User approves connection
4. Wallet address and network status displayed
5. If not on Calibnet, user prompted to switch networks

### Voting Flow
1. User navigates to Governance section
2. System checks wallet connection and network
3. User selects vote (RUG or SAFE)
4. MetaMask popup appears for transaction approval
5. Transaction submitted to Calibnet
6. Vote status updated in real-time
7. Success/error feedback provided

### Error Handling
- **Wallet not connected**: Prompts user to connect
- **Wrong network**: Automatically switches to Calibnet
- **Transaction failed**: Shows error message with retry option
- **Already voted**: Prevents duplicate votes
- **Network issues**: Graceful fallback and retry

## Security Features

### Transaction Security
- All votes require MetaMask signature
- Duplicate vote prevention on-chain
- Transaction hash verification
- Network validation

### Data Integrity
- On-chain vote storage
- Cryptographic proof of votes
- Immutable transaction history
- Public verification capability

## Development Setup

### Prerequisites
- MetaMask browser extension
- Filecoin Calibnet testnet access
- Test FIL tokens for gas fees

### Installation
```bash
# Install dependencies
npm install ethers@^6.0.0 @metamask/detect-provider

# Start development server
npm run dev
```

### Testing
1. Open browser with MetaMask installed
2. Connect to Filecoin Calibnet
3. Get test FIL from faucet
4. Test voting functionality

## Configuration

### Environment Variables
```env
# Optional: Custom RPC URL
VITE_CALIBNET_RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# Optional: Custom contract address
VITE_PANDORA_CONTRACT_ADDRESS=0xf49ba5eaCdFD5EE3744efEdf413791935FE4D4c5
```

### Custom Networks
You can add custom networks by modifying the `switchToCalibnet` function in `useWallet.ts`.

## Troubleshooting

### Common Issues

1. **MetaMask not detected**
   - Ensure MetaMask extension is installed
   - Refresh the page
   - Check browser console for errors

2. **Network switching fails**
   - Manual network addition may be required
   - Check network configuration
   - Verify RPC endpoint availability

3. **Transaction fails**
   - Ensure sufficient tFIL for gas
   - Check network connectivity
   - Verify contract address and ABI

4. **Vote not registering**
   - Check transaction confirmation
   - Verify on-chain vote count
   - Refresh page to sync state

### Debug Mode
Enable debug logging:
```typescript
// In browser console
localStorage.setItem('debug', 'true');
```

## Future Enhancements

1. **Multi-wallet Support**
   - WalletConnect integration
   - Other wallet providers
   - Hardware wallet support

2. **Advanced Voting**
   - Delegated voting
   - Vote weighting
   - Time-locked voting

3. **Enhanced UI**
   - Transaction history
   - Vote analytics
   - Real-time updates

4. **Mobile Support**
   - Mobile wallet integration
   - Responsive design
   - Touch-friendly interface

## Contributing

When contributing to the MetaMask integration:

1. Test with multiple MetaMask versions
2. Verify network switching functionality
3. Test error scenarios
4. Update documentation
5. Follow security best practices

## Support

For issues related to:
- **MetaMask**: Check MetaMask documentation
- **Filecoin Calibnet**: Visit Filecoin documentation
- **Smart Contracts**: Check Filecoin Services repo
- **Application**: Open an issue in the project repository 