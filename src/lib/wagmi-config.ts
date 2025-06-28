import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

// Filecoin Calibnet chain configuration
export const filecoinCalibnet = {
  id: 314159,
  name: 'Filecoin Calibnet',
  network: 'filecoin-calibnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tFIL',
    symbol: 'tFIL',
  },
  rpcUrls: {
    public: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
    default: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: { name: 'Calibnet Explorer', url: 'https://calibnet.filfox.info' },
  },
  testnet: true,
} as const;

// Set up wagmi config with basic setup
export const config = createConfig({
  chains: [mainnet, filecoinCalibnet],
  connectors: [
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [filecoinCalibnet.id]: http(),
  },
}); 