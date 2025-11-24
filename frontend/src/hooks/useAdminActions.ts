import { useEffect, useRef, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { SURVEY_COUNCIL_ABI, SURVEY_COUNCIL_ADDRESS } from "@/config/contracts";

const EXPLORER_URL = "https://sepolia.etherscan.io/tx";

// Helper function to create explorer link action
const createExplorerAction = (hash: string) => ({
  label: "View on Explorer",
  onClick: () => window.open(`${EXPLORER_URL}/${hash}`, '_blank'),
});

// Helper to check if error is user rejection
const isUserRejection = (error: Error) => {
  return error.message.includes("User rejected") || error.message.includes("user rejected");
};

// Hook for finalizing the survey
export function useFinalize() {
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
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  // Show submission toast when hash is received
  useEffect(() => {
    if (hash && toastStateRef.current.submittedHash !== hash) {
      toastStateRef.current.submittedHash = hash;
      toast.info("Transaction sent", {
        description: "Waiting for on-chain confirmation...",
        action: createExplorerAction(hash),
      });
    }
  }, [hash]);

  // Show success toast when confirmed on-chain
  useEffect(() => {
    if (isSuccess && hash && toastStateRef.current.confirmedHash !== hash) {
      toastStateRef.current.confirmedHash = hash;
      toast.success("Survey finalized!", {
        description: "Results can now be decrypted by authorized viewers",
        action: createExplorerAction(hash),
      });
    }
  }, [isSuccess, hash]);

  // Show error toast for transaction failure on-chain
  useEffect(() => {
    if (isError && hash && toastStateRef.current.errorHash !== hash) {
      toastStateRef.current.errorHash = hash;
      toast.error("Transaction failed on-chain", {
        description: waitError?.message || "Failed to finalize survey",
        action: createExplorerAction(hash),
      });
    }
  }, [isError, hash, waitError]);

  // Show error toast for write failure
  useEffect(() => {
    if (writeError) {
      toast.error(
        isUserRejection(writeError) ? "Transaction cancelled" : "Failed to send transaction",
        {
          description: isUserRejection(writeError)
            ? "You rejected the transaction in your wallet"
            : writeError.message.slice(0, 100),
        }
      );
    }
  }, [writeError]);

  const finalize = useCallback(() => {
    toastStateRef.current = { submittedHash: null, confirmedHash: null, errorHash: null };
    writeContract({
      address: SURVEY_COUNCIL_ADDRESS,
      abi: SURVEY_COUNCIL_ABI,
      functionName: "finalize",
    });
  }, [writeContract]);

  return {
    finalize,
    isSubmitting: isWriting || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for extending voting time
export function useExtendVoting() {
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
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash && toastStateRef.current.submittedHash !== hash) {
      toastStateRef.current.submittedHash = hash;
      toast.info("Transaction sent", {
        description: "Waiting for on-chain confirmation...",
        action: createExplorerAction(hash),
      });
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash && toastStateRef.current.confirmedHash !== hash) {
      toastStateRef.current.confirmedHash = hash;
      toast.success("Voting period extended!", {
        description: "The voting end time has been updated",
        action: createExplorerAction(hash),
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (isError && hash && toastStateRef.current.errorHash !== hash) {
      toastStateRef.current.errorHash = hash;
      toast.error("Transaction failed on-chain", {
        description: waitError?.message || "Failed to extend voting period",
        action: createExplorerAction(hash),
      });
    }
  }, [isError, hash, waitError]);

  useEffect(() => {
    if (writeError) {
      toast.error(
        isUserRejection(writeError) ? "Transaction cancelled" : "Failed to send transaction",
        {
          description: isUserRejection(writeError)
            ? "You rejected the transaction in your wallet"
            : writeError.message.slice(0, 100),
        }
      );
    }
  }, [writeError]);

  const extendVoting = useCallback((newEndTime: bigint) => {
    toastStateRef.current = { submittedHash: null, confirmedHash: null, errorHash: null };
    writeContract({
      address: SURVEY_COUNCIL_ADDRESS,
      abi: SURVEY_COUNCIL_ABI,
      functionName: "extendVoting",
      args: [newEndTime],
    });
  }, [writeContract]);

  return {
    extendVoting,
    isSubmitting: isWriting || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for granting view access
export function useGrantView() {
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
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash && toastStateRef.current.submittedHash !== hash) {
      toastStateRef.current.submittedHash = hash;
      toast.info("Transaction sent", {
        description: "Waiting for on-chain confirmation...",
        action: createExplorerAction(hash),
      });
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash && toastStateRef.current.confirmedHash !== hash) {
      toastStateRef.current.confirmedHash = hash;
      toast.success("View access granted!", {
        description: "The address can now view decrypted results",
        action: createExplorerAction(hash),
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (isError && hash && toastStateRef.current.errorHash !== hash) {
      toastStateRef.current.errorHash = hash;
      toast.error("Transaction failed on-chain", {
        description: waitError?.message || "Failed to grant view access",
        action: createExplorerAction(hash),
      });
    }
  }, [isError, hash, waitError]);

  useEffect(() => {
    if (writeError) {
      toast.error(
        isUserRejection(writeError) ? "Transaction cancelled" : "Failed to send transaction",
        {
          description: isUserRejection(writeError)
            ? "You rejected the transaction in your wallet"
            : writeError.message.slice(0, 100),
        }
      );
    }
  }, [writeError]);

  const grantView = useCallback((viewer: `0x${string}`) => {
    toastStateRef.current = { submittedHash: null, confirmedHash: null, errorHash: null };
    writeContract({
      address: SURVEY_COUNCIL_ADDRESS,
      abi: SURVEY_COUNCIL_ABI,
      functionName: "grantView",
      args: [viewer],
    });
  }, [writeContract]);

  return {
    grantView,
    isSubmitting: isWriting || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for queuing viewers (before finalization)
export function useQueueViewer() {
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
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash && toastStateRef.current.submittedHash !== hash) {
      toastStateRef.current.submittedHash = hash;
      toast.info("Transaction sent", {
        description: "Waiting for on-chain confirmation...",
        action: createExplorerAction(hash),
      });
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash && toastStateRef.current.confirmedHash !== hash) {
      toastStateRef.current.confirmedHash = hash;
      toast.success("Viewer queued!", {
        description: "Access will be granted when survey is finalized",
        action: createExplorerAction(hash),
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (isError && hash && toastStateRef.current.errorHash !== hash) {
      toastStateRef.current.errorHash = hash;
      toast.error("Transaction failed on-chain", {
        description: waitError?.message || "Failed to queue viewer",
        action: createExplorerAction(hash),
      });
    }
  }, [isError, hash, waitError]);

  useEffect(() => {
    if (writeError) {
      toast.error(
        isUserRejection(writeError) ? "Transaction cancelled" : "Failed to send transaction",
        {
          description: isUserRejection(writeError)
            ? "You rejected the transaction in your wallet"
            : writeError.message.slice(0, 100),
        }
      );
    }
  }, [writeError]);

  const queueViewer = useCallback((viewer: `0x${string}`) => {
    toastStateRef.current = { submittedHash: null, confirmedHash: null, errorHash: null };
    writeContract({
      address: SURVEY_COUNCIL_ADDRESS,
      abi: SURVEY_COUNCIL_ABI,
      functionName: "queueViewer",
      args: [viewer],
    });
  }, [writeContract]);

  return {
    queueViewer,
    isSubmitting: isWriting || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for removing queued viewer
export function useRemoveQueuedViewer() {
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
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash && toastStateRef.current.submittedHash !== hash) {
      toastStateRef.current.submittedHash = hash;
      toast.info("Transaction sent", {
        description: "Waiting for on-chain confirmation...",
        action: createExplorerAction(hash),
      });
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash && toastStateRef.current.confirmedHash !== hash) {
      toastStateRef.current.confirmedHash = hash;
      toast.success("Viewer removed!", {
        description: "The address has been removed from the queue",
        action: createExplorerAction(hash),
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (isError && hash && toastStateRef.current.errorHash !== hash) {
      toastStateRef.current.errorHash = hash;
      toast.error("Transaction failed on-chain", {
        description: waitError?.message || "Failed to remove viewer",
        action: createExplorerAction(hash),
      });
    }
  }, [isError, hash, waitError]);

  useEffect(() => {
    if (writeError) {
      toast.error(
        isUserRejection(writeError) ? "Transaction cancelled" : "Failed to send transaction",
        {
          description: isUserRejection(writeError)
            ? "You rejected the transaction in your wallet"
            : writeError.message.slice(0, 100),
        }
      );
    }
  }, [writeError]);

  const removeQueuedViewer = useCallback((viewer: `0x${string}`) => {
    toastStateRef.current = { submittedHash: null, confirmedHash: null, errorHash: null };
    writeContract({
      address: SURVEY_COUNCIL_ADDRESS,
      abi: SURVEY_COUNCIL_ABI,
      functionName: "removeQueuedViewer",
      args: [viewer],
    });
  }, [writeContract]);

  return {
    removeQueuedViewer,
    isSubmitting: isWriting || isConfirming,
    isSuccess,
    hash,
  };
}
