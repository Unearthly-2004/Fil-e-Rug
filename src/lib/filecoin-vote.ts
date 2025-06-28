import { ethers } from "ethers";
import PandoraServiceABI from "./PandoraServiceABI.json";

const PANDORA_ADDRESS = "0xf49ba5eaCdFD5EE3744efEdf413791935FE4D4c5";

export interface VoteResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface VoteCount {
  rugVotes: bigint;
  safeVotes: bigint;
  totalVotes: bigint;
}

export async function voteOnChain(
  provider: ethers.BrowserProvider,
  proposalId: string,
  vote: boolean // true = safe, false = rug
): Promise<VoteResult> {
  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(PANDORA_ADDRESS, PandoraServiceABI, signer);
    
    // Check if user has already voted
    const hasVoted = await contract.hasVoted(proposalId, await signer.getAddress());
    if (hasVoted) {
      return {
        success: false,
        error: "You have already voted on this proposal"
      };
    }

    // Submit vote transaction
    const tx = await contract.vote(proposalId, vote);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error: any) {
    console.error("Vote transaction failed:", error);
    return {
      success: false,
      error: error.message || "Transaction failed"
    };
  }
}

export async function getVoteCount(
  provider: ethers.BrowserProvider,
  proposalId: string
): Promise<VoteCount | null> {
  try {
    const contract = new ethers.Contract(PANDORA_ADDRESS, PandoraServiceABI, provider);
    const voteCount = await contract.getVoteCount(proposalId);
    
    return {
      rugVotes: voteCount.rugVotes,
      safeVotes: voteCount.safeVotes,
      totalVotes: voteCount.totalVotes
    };
  } catch (error) {
    console.error("Failed to get vote count:", error);
    return null;
  }
}

export async function checkIfVoted(
  provider: ethers.BrowserProvider,
  proposalId: string,
  address: string
): Promise<boolean> {
  try {
    const contract = new ethers.Contract(PANDORA_ADDRESS, PandoraServiceABI, provider);
    return await contract.hasVoted(proposalId, address);
  } catch (error) {
    console.error("Failed to check if voted:", error);
    return false;
  }
} 