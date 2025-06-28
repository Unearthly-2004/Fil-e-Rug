# Filecoin Storage Integration

This document explains the Filecoin storage system integration that has been implemented in the Fil-e-Rug application.

## Overview

The application now includes a complete Filecoin storage system using the Synapse SDK, allowing users to:

1. **Vote on proposals** using Filecoin Calibnet
2. **Upload files** to Filecoin Calibnet after voting
3. **Permanently store** voting results and evidence on Filecoin

## Architecture

### Components

1. **FilecoinUploader Component** (`src/components/FilecoinUploader.tsx`)
   - Drag-and-drop file upload interface
   - Real-time upload progress tracking
   - Integration with voting system

2. **Synapse Storage Hook** (`src/hooks/use-synapse-storage.ts`)
   - Handles file uploads to Filecoin using Synapse SDK
   - Manages USDFC balance and allowances
   - Provides upload status and progress

3. **Filecoin Configuration** (`src/lib/filecoin-config.ts`)
   - Storage capacity settings
   - Network configuration for Calibnet
   - CDN and persistence settings

4. **Utility Functions** (`src/lib/filecoin-utils.ts`)
   - Preflight checks for USDFC balance
   - Proofset management
   - Pandora service integration

### Workflow

1. **User votes** on a proposal using Filecoin Calibnet
2. **After successful vote**, the FilecoinUploader component appears
3. **User uploads files** (evidence, documentation, analysis)
4. **Files are stored** permanently on Filecoin Calibnet
5. **Voting results** are also stored on Filecoin for permanent record

## Features

### File Upload
- Drag-and-drop interface
- Support for any file type
- Real-time progress tracking
- Automatic USDFC balance checking
- Proofset creation and management

### Storage Benefits
- **Permanent storage** on Filecoin network
- **Decentralized** and censorship-resistant
- **Verifiable** storage proofs
- **Cost-effective** using USDFC tokens

### Integration
- **Seamless workflow** from voting to file storage
- **Automatic network switching** to Filecoin Calibnet
- **Wallet integration** with MetaMask
- **Real-time status updates**

## Technical Details

### Dependencies Added
```json
{
  "@filoz/synapse-sdk": "^0.13.0",
  "@wagmi/core": "^2.6.7",
  "viem": "^2.30.3",
  "wagmi": "^2.15.4"
}
```

### Network Configuration
- **Filecoin Calibnet** (Chain ID: 314159)
- **RPC URL**: https://api.calibnet.node.glif.io/rpc/v1
- **Block Explorer**: https://calibnet.filfox.info

### Storage Configuration
- **Storage Capacity**: 10 GB
- **Persistence Period**: 30 days
- **CDN Enabled**: Yes
- **Proofset Creation Fee**: 1 USDFC

## Usage

### For Users
1. Connect MetaMask wallet
2. Switch to Filecoin Calibnet network
3. Vote on a proposal
4. Upload supporting files after voting
5. Files are permanently stored on Filecoin

### For Developers
1. The system automatically handles USDFC balance checks
2. Files are uploaded using the Synapse SDK
3. Storage proofs are generated and verified
4. All data is permanently stored on Filecoin Calibnet

## Benefits

### Decentralization
- No single point of failure
- Censorship-resistant storage
- Community-owned infrastructure

### Transparency
- All voting results permanently stored
- Verifiable storage proofs
- Public blockchain records

### Cost-Effectiveness
- Uses USDFC tokens for storage
- Competitive pricing compared to traditional storage
- No recurring fees after initial storage

## Future Enhancements

1. **File Retrieval**: Add ability to download stored files
2. **Storage Management**: Interface to manage stored files
3. **Batch Uploads**: Support for multiple file uploads
4. **Storage Analytics**: Dashboard showing storage usage
5. **Cross-Chain Integration**: Support for other networks

## Troubleshooting

### Common Issues
1. **Insufficient USDFC**: Ensure wallet has enough USDFC tokens
2. **Wrong Network**: Make sure you're on Filecoin Calibnet
3. **Upload Failures**: Check file size and network connection
4. **Wallet Connection**: Ensure MetaMask is properly connected

### Support
For technical support or questions about the Filecoin storage integration, please refer to the Synapse SDK documentation or contact the development team. 