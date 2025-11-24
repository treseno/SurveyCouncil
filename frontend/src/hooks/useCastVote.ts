import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { SURVEY_COUNCIL_ABI, SURVEY_COUNCIL_ADDRESS } from "@/config/contracts";
import { encryptVote, initializeFHE } from "@/lib/fhe";
import type { Address } from "viem";

const EXPLORER_URL = "https://sepolia.etherscan.io/tx";

// Helper function to create explorer link action
const createExplorerAction = (hash: string) => ({
  label: "View on Explorer",
  onClick: () => window.open(`${EXPLORER_URL}/${hash}`, '_blank'),
});

export function useCastVote(contractAddress?: `0x${string}`) {
  const targetAddress = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { address } = useAccount();
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Use refs to track toast state to avoid triggering re-renders
  const toastStateRef = useRef({
    submittedHash: null as string | null,
    confirmedHash: null as string | null,
    errorHash: null as string | null,
  });

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Show submission toast when hash is received (transaction sent to mempool)
  useEffect(() => {
    if (hash && toastStateRef.current.submittedHash !== hash) {
      toastStateRef.current.submittedHash = hash;
      toast.info("Transaction sent", {
        description: "Waiting for on-chain confirmation...",
        action: createExplorerAction(hash),
      });
    }
  }, [hash]);

  // Show success toast when transaction is confirmed on-chain
  useEffect(() => {
    if (isSuccess && hash && toastStateRef.current.confirmedHash !== hash) {
      toastStateRef.current.confirmedHash = hash;
      toast.success("Vote confirmed on-chain!", {
        description: "Your encrypted vote has been recorded on the blockchain",
        action: createExplorerAction(hash),
      });
    }
  }, [isSuccess, hash]);

  // Show error toast for transaction failure (reverted on-chain)
  useEffect(() => {
    if (isError && hash && toastStateRef.current.errorHash !== hash) {
      toastStateRef.current.errorHash = hash;
      toast.error("Transaction failed on-chain", {
        description: waitError?.message || "The transaction was reverted",
        action: createExplorerAction(hash),
      });
    }
  }, [isError, hash, waitError]);

  // Show error toast for write failure (user rejection or other errors before sending)
  useEffect(() => {
    if (writeError) {
      const isUserRejection = writeError.message.includes("User rejected") ||
                              writeError.message.includes("user rejected");
      toast.error(
        isUserRejection ? "Transaction cancelled" : "Failed to send transaction",
        {
          description: isUserRejection
            ? "You rejected the transaction in your wallet"
            : writeError.message.slice(0, 100),
        }
      );
    }
  }, [writeError]);

  const castVote = useCallback(async (optionId: number): Promise<boolean> => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return false;
    }

    if (optionId < 0) {
      toast.error("Please select an option");
      return false;
    }

    // Reset toast state for new vote attempt
    toastStateRef.current = {
      submittedHash: null,
      confirmedHash: null,
      errorHash: null,
    };

    try {
      setIsEncrypting(true);
      toast.info("Initializing FHE encryption...");

      // Initialize FHE if needed
      await initializeFHE();

      toast.info("Encrypting your vote...");

      // Encrypt the vote (value of 1) - must use target contract address for FHE proof
      const encrypted = await encryptVote(address as Address, targetAddress);

      setIsEncrypting(false);
      toast.info("Encryption complete, please confirm transaction in your wallet");

      // Submit to the smart contract
      writeContract({
        address: targetAddress,
        abi: SURVEY_COUNCIL_ABI,
        functionName: "castVote",
        args: [
          BigInt(optionId),
          encrypted.encryptedOne,
          encrypted.proof,
        ],
      });

      return true;
    } catch (error) {
      setIsEncrypting(false);
      console.error("Error casting vote:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to encrypt vote"
      );
      return false;
    }
  }, [address, writeContract, targetAddress]);

  return {
    castVote,
    isEncrypting,
    isSubmitting: isWriting || isConfirming,
    isSuccess,
    hash,
  };
}
