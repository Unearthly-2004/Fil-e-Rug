import { BrowserProvider, JsonRpcSigner } from "ethers";
import type { Account, Chain, Client, Transport } from "viem";

export const clientToSigner = (client: Client<Transport, Chain, Account>) => {
  const { account, chain, transport } = client;
  if (!chain) return null;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  provider.getSigner();
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
};

export const clientToProvider = (client: Client<Transport, Chain, Account>) => {
  const { chain, transport } = client;
  if (!chain) return null;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return provider;
}; 