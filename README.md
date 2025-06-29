# Fil-e-Rug Platform

A comprehensive decentralized platform for memecoin analysis, voting, and permanent storage on Filecoin.

## Features

- **Memecoin Voting**: Vote on your favorite memecoins with real-time data from CoinGecko API
- **On-Chain Governance**: Decentralized decision-making with permanent storage of all governance data
- **Filecoin Storage**: Advanced file storage with Proof of Data Possession (PDP) on Filecoin
- **Synapse Integration**: Seamless integration with Synapse SDK for decentralized storage

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Blockchain**: Filecoin Calibnet, MetaMask integration
- **Storage**: Filecoin IPFS, Synapse SDK
- **Data**: CoinGecko API for memecoin data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask wallet extension

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Fil-e-Rug_Main
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Configuration

1. Connect your MetaMask wallet
2. Switch to Filecoin Calibnet network
3. Ensure you have test FIL tokens for gas fees

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
