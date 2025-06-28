import { Synapse } from "@filoz/synapse-sdk";
import { PandoraService, CONTRACT_ADDRESSES } from "@filoz/synapse-sdk";
import { JsonRpcSigner } from "ethers";
import { filecoinConfig, PROOF_SET_CREATION_FEE } from "./filecoin-config";

/**
 * Performs a preflight check before file upload to ensure sufficient USDFC balance and allowances
 * for storage costs.
 */
export const preflightCheck = async (
  file: File,
  synapse: Synapse,
  network: "mainnet" | "calibration",
  withProofset: boolean,
  setStatus: (status: string) => void,
  setProgress: (progress: number) => void
) => {
  // Verify signer and provider are available
  const signer = synapse.getSigner();
  if (!signer) throw new Error("Signer not found");
  if (!signer.provider) throw new Error("Provider not found");

  // Initialize Pandora service for allowance checks
  const pandoraService = new PandoraService(
    signer.provider,
    CONTRACT_ADDRESSES.PANDORA_SERVICE[network]
  );

  // Check if current allowance is sufficient for the file size
  const preflight = await pandoraService.checkAllowanceForStorage(
    file.size,
    filecoinConfig.withCDN,
    synapse.payments
  );

  // If allowance is insufficient, handle deposit and approval process
  if (!preflight.sufficient) {
    setStatus("💰 Insufficient USDFC allowance...");

    // Calculate total allowance needed including proofset creation fee if required
    const proofSetCreationFee = withProofset
      ? PROOF_SET_CREATION_FEE
      : BigInt(0);

    const allowanceNeeded =
      preflight.lockupAllowanceNeeded + proofSetCreationFee;

    // Step 1: Deposit USDFC to cover storage costs
    setStatus("💰 Approving & depositing USDFC to cover storage costs...");
    await synapse.payments.deposit(allowanceNeeded);
    setStatus("💰 USDFC deposited successfully");
    setProgress(10);

    // Step 2: Approve Pandora service to spend USDFC at specified rates
    setStatus("💰 Approving Pandora service USDFC spending rates...");
    await synapse.payments.approveService(
      getPandoraAddress(network),
      preflight.rateAllowanceNeeded,
      allowanceNeeded
    );
    setStatus("💰 Pandora service approved to spend USDFC");
    setProgress(20);
  }
};

/**
 * Get the best proofset for a user based on storage usage
 */
export const getProofset = async (
  signer: JsonRpcSigner,
  network: "mainnet" | "calibration",
  address: string
) => {
  const pandoraService = new PandoraService(
    signer.provider,
    CONTRACT_ADDRESSES.PANDORA_SERVICE[network]
  );
  let providerId;
  let bestProofset;
  const AllproofSets =
    await pandoraService.getClientProofSetsWithDetails(address);

  const proofSetsWithCDN = AllproofSets.filter((proofSet) => proofSet.withCDN);

  const proofSetsWithoutCDN = AllproofSets.filter(
    (proofSet) => !proofSet.withCDN
  );

  const proofSets = filecoinConfig.withCDN ? proofSetsWithCDN : proofSetsWithoutCDN;

  try {
    bestProofset = proofSets.reduce((max, proofSet) => {
      return proofSet.currentRootCount > max.currentRootCount ? proofSet : max;
    }, proofSets[0]);
    if (bestProofset) {
      providerId = await pandoraService.getProviderIdByAddress(
        bestProofset.payee
      );
    }
  } catch (error) {
    console.error("Error getting providerId", error);
  }
  return { providerId, proofset: bestProofset };
};

/**
 * Get Pandora service address for a network
 */
export const getPandoraAddress = (network: "mainnet" | "calibration") => {
  return CONTRACT_ADDRESSES.PANDORA_SERVICE[network];
}; 