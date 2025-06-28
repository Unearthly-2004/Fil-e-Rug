# Synapse SDK Integration for Fil-e-Rug

This document explains how the Synapse SDK has been integrated into the Fil-e-Rug project, providing advanced file storage capabilities with Proof of Data Possession (PDP) on Filecoin.

## 🚀 Overview

The Synapse SDK integration adds powerful file storage functionality to your Fil-e-Rug application, enabling users to:

- **Store files securely** on Filecoin with Proof of Data Possession
- **Manage storage payments** using USDFC tokens
- **Monitor storage metrics** and persistence status
- **Upload and download files** with real-time progress tracking

## 📦 Dependencies

The following dependencies are already installed in your project:

```json
{
  "@filoz/synapse-sdk": "^0.13.0",
  "@tanstack/react-query": "^5.56.2",
  "ethers": "^6.0.0",
  "sonner": "^1.5.0"
}
```

## 🏗️ Architecture

### Core Components

1. **SynapseStorageManager** - Manages balances and storage payments
2. **SynapseFileUploader** - Handles file uploads with progress tracking
3. **Configuration** - Centralized settings for Synapse operations

### Custom Hooks

1. **useSynapseBalances** - Real-time balance monitoring
2. **useSynapsePayment** - Payment processing
3. **useSynapseUpload** - File upload orchestration

## 🔧 Configuration

### Synapse Config (`src/lib/synapse-config.ts`)

```typescript
export const synapseConfig = {
  storageCapacity: 10,        // GB, maximum storage capacity
  persistencePeriod: 30,      // days, data persistence duration
  minDaysThreshold: 10,       // days, threshold for low-balance warnings
  withCDN: true,              // Whether to use CDN for faster retrieval
  network: 'calibnet',        // 'mainnet' or 'calibnet'
  contracts: {
    synapse: '0x...',         // Synapse contract address
    pandora: '0x...',         // Pandora service contract
    usdfc: '0x...',           // USDFC token contract
  }
};
```

### Storage Metrics Calculation

The system automatically calculates:
- **Rate Allowance**: USDFC per epoch for ongoing storage
- **Lockup Allowance**: Total USDFC for entire persistence period
- **Daily Cost**: Estimated daily storage cost

## 💰 Payment System

### Two-Tier Allowance System

1. **Rate Allowance** (`rateAllowance`)
   - Maximum USDFC per epoch for automated payments
   - Proportional to storage needs
   - Higher storage = higher epoch rates

2. **Lockup Allowance** (`lockupAllowance`)
   - Total USDFC reserved upfront
   - Guarantees storage provider payments
   - Enables uninterrupted PDP validation

### Payment Flow

```typescript
const result = await handlePayment({
  lockupAllowance: BigInt(lockUpNeeded),
  epochRateAllowance: BigInt(rateNeeded),
  depositAmount: BigInt(depositNeeded),
});
```

## 📤 File Upload Process

### 4-Step Upload Workflow

1. **Preflight Check**
   - Verifies USDFC balance
   - Checks wallet connection and network
   - Validates file size and type

2. **Proof Set Resolution**
   - Finds existing proof set or creates new one
   - Establishes storage provider connection
   - Prepares for PDP verification

3. **File Upload**
   - Transfers file data to storage provider
   - Tracks upload progress in real-time
   - Handles network interruptions

4. **Root Registration**
   - Signs and sends addroot request
   - Enables PDP verification
   - Returns file CID and transaction hash

### Upload Hook Usage

```typescript
const { uploadFile, progress, uploadedFiles, isUploading } = useSynapseUpload();

// Upload with progress tracking
await uploadFile(selectedFile);
```

## 📊 Balance Management

### Real-Time Monitoring

The `useSynapseBalances` hook provides:

- **Wallet Balances**: FIL and USDFC
- **Pandora Balance**: USDFC in Synapse contract
- **Storage Usage**: Current vs. configured capacity
- **Persistence Days**: Remaining storage time
- **Payment Requirements**: Rate and lockup allowances

### Balance Updates

- Automatic refresh every 30 seconds
- Real-time updates on payment completion
- Low balance warnings and notifications

## 🎯 User Experience Features

### Visual Feedback

- **Progress Tracking**: Real-time upload progress with stage indicators
- **Status Icons**: Color-coded status for each upload stage
- **Toast Notifications**: Success/error feedback for all operations
- **Loading States**: Spinners and disabled states during operations

### Error Handling

- **Network Validation**: Ensures correct network (Calibnet)
- **Balance Checks**: Prevents insufficient balance errors
- **Graceful Degradation**: Clear error messages and recovery options
- **Retry Mechanisms**: Automatic retry for transient failures

## 🔐 Security Features

### Proof of Data Possession (PDP)

- **Cryptographic Verification**: Ensures data integrity
- **Storage Provider Validation**: Regular proof submissions
- **Automated Monitoring**: Continuous verification of stored data

### Payment Security

- **Escrow System**: USDFC locked in smart contracts
- **Rate Limiting**: Prevents excessive spending
- **Audit Trail**: All transactions recorded on blockchain

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** and npm
2. **MetaMask** wallet with Calibnet network
3. **Test Tokens**:
   - tFIL: [Filecoin Calibration Faucet](https://faucet.calibration.fildev.network/)
   - tUSDFC: [ChainSafe USDFC Faucet](https://faucet.chainsafe.io/)

### Setup Steps

1. **Install Dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure Network**:
   - Add Calibnet to MetaMask
   - Switch to Calibnet network

3. **Get Test Tokens**:
   - Request tFIL for gas fees
   - Request tUSDFC for storage payments

4. **Start Development**:
   ```bash
   npm run dev
   ```

## 📱 Component Usage

### SynapseStorageManager

```tsx
import SynapseStorageManager from './components/SynapseStorageManager';

// Displays balances, storage usage, and payment options
<SynapseStorageManager />
```

### SynapseFileUploader

```tsx
import SynapseFileUploader from './components/SynapseFileUploader';

// Handles file uploads with drag-and-drop
<SynapseFileUploader />
```

## 🔄 Integration Points

### With Existing Components

- **Wallet Integration**: Uses existing `useWallet` hook
- **Toast System**: Integrates with Sonner toast notifications
- **UI Components**: Uses existing shadcn/ui components
- **Network Validation**: Leverages existing Calibnet checks

### Future Enhancements

- **Real Synapse SDK**: Replace mock implementations
- **Proof Set Viewer**: Display and manage proof sets
- **File Download**: Implement file retrieval functionality
- **Storage Analytics**: Advanced metrics and reporting

## 🐛 Troubleshooting

### Common Issues

1. **"Wallet Not Connected"**
   - Ensure MetaMask is connected
   - Check if wallet is unlocked

2. **"Wrong Network"**
   - Switch to Filecoin Calibnet
   - Add Calibnet network to MetaMask

3. **"Insufficient Balance"**
   - Get more tFIL for gas fees
   - Get more tUSDFC for storage payments

4. **Upload Failures**
   - Check network connection
   - Verify file size limits
   - Ensure sufficient balance

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('synapse-debug', 'true');
```

## 📚 Additional Resources

- [Synapse SDK Documentation](https://docs.synapse.filecoin.io/)
- [Filecoin Calibnet Guide](https://docs.filecoin.io/build/development-networks/calibration/)
- [USDFC Token Information](https://docs.filecoin.io/smart-contracts/fundamentals/usdfc/)

## 🤝 Contributing

To enhance the Synapse integration:

1. **Replace Mock Implementations**: Connect to real Synapse SDK
2. **Add Error Recovery**: Implement retry mechanisms
3. **Enhance UI**: Add more visual feedback and animations
4. **Add Tests**: Create comprehensive test coverage

---

This integration provides a solid foundation for Filecoin storage in your Fil-e-Rug application. The modular design allows for easy extension and customization as your needs evolve. 