import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Synapse } from "@filoz/synapse-sdk";
import { useWallet } from "./useWallet";
import { filecoinConfig, getNetwork } from "@/lib/filecoin-config";
import { preflightCheck, getProofset } from "@/lib/filecoin-utils";
import { clientToSigner } from "@/lib/ethers-utils";
import { toast } from "@/hooks/use-toast";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  commp?: string;
  txHash?: string;
};

/**
 * Hook to upload files to the Filecoin network using Synapse.
 */
export const useSynapseStorage = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);

  const { provider, address, isConnected, isCalibnet } = useWallet();

  const mutation = useMutation({
    mutationKey: ["synapse-file-upload", address],
    mutationFn: async (file: File) => {
      if (!provider) throw new Error("Provider not found");
      if (!address) throw new Error("Address not found");
      if (!isCalibnet) throw new Error("Must be on Filecoin Calibnet");

      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing file upload to Filecoin...");

      // Convert viem client to ethers signer
      const signer = clientToSigner(provider);
      if (!signer) throw new Error("Failed to create signer");

      // Get network
      const network = getNetwork(314159); // Calibnet
      if (!network) throw new Error("Unsupported network");

      // 1) Convert File → ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // 2) Convert ArrayBuffer → Uint8Array
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      // 3) Create Synapse instance
      const synapse = await Synapse.create({
        provider: signer.provider,
        disableNonceManager: false,
        withCDN: filecoinConfig.withCDN,
      });

      // 4) Get proofset
      const { providerId } = await getProofset(signer, network, address);
      // 5) Check if we have a proofset
      const withProofset = !!providerId;

      // 6) Check if we have enough USDFC to cover the storage costs and deposit if not
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        network,
        withProofset,
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage service and proof set...");
      setProgress(25);

      // 7) Create storage service
      const storageService = await synapse.createStorage({
        providerId,
        callbacks: {
          onProofSetResolved: (info) => {
            setStatus("🔗 Existing proof set found and resolved");
            setProgress(30);
          },
          onProofSetCreationStarted: (transactionResponse, statusUrl) => {
            setStatus("🏗️ Creating new proof set on blockchain...");
            setProgress(35);
          },
          onProofSetCreationProgress: (status) => {
            console.log("Proof set creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Proof set transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(
                `🎉 Proof set ready! (${Math.round(status.elapsedMs / 1000)}s)`
              );
              setProgress(50);
            }
          },
          onProviderSelected: (provider) => {
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading file to storage provider...");
      setProgress(55);
      // 8) Upload file to storage provider
      const { commp } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (commp) => {
          setStatus(
            `📊 File uploaded! Signing msg to add roots to the proof set`
          );
          setUploadedInfo((prev) => ({
            ...prev,
            fileName: file.name,
            fileSize: file.size,
            commp: commp,
          }));
          setProgress(80);
        },
        onRootAdded: async (transactionResponse) => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
            }`
          );
          if (transactionResponse) {
            const receipt = await transactionResponse.wait();
            console.log("Receipt:", receipt);
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
          setStatus(`🔄 Waiting for storage provider confirmation`);
          setProgress(85);
        },
        onRootConfirmed: (rootIds) => {
          setStatus("🌳 Data roots added to proof set successfully");
          setProgress(90);
        },
      });

      // In case the transaction was not given back by the storage provider, we wait for 50 seconds
      // So we make sure that the transaction is confirmed on chain
      if (!uploadedInfo?.txHash) {
        await new Promise((resolve) => setTimeout(resolve, 50000));
      }

      setProgress(95);
      setUploadedInfo((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        commp: commp,
      }));
    },
    onSuccess: () => {
      setStatus("🎉 File successfully stored on Filecoin!");
      setProgress(100);
      toast({
        title: "Upload Successful",
        description: "File has been stored on Filecoin Calibnet",
      });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
}; 