import { useAccount, useReadContract } from "wagmi";
import { SURVEY_COUNCIL_ABI, SURVEY_COUNCIL_ADDRESS, VotingStatus } from "@/config/contracts";

// Hook for reading survey info
export function useSurveyInfo(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "getSurveyInfo",
  });

  return {
    surveyInfo: data ? {
      title: data[0] as string,
      startTime: Number(data[1]),
      endTime: Number(data[2]),
      finalized: data[3] as boolean,
      optionsCount: Number(data[4]),
      voterCount: Number(data[5]),
    } : null,
    isLoading,
    error,
    refetch,
  };
}

// Hook for reading options
export function useSurveyOptions(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "getOptions",
  });

  return {
    options: data as string[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for voting status
export function useVotingStatus(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "getVotingStatus",
  });

  const statusMap = {
    [VotingStatus.NOT_STARTED]: "not_started",
    [VotingStatus.ACTIVE]: "active",
    [VotingStatus.ENDED]: "ended",
    [VotingStatus.FINALIZED]: "finalized",
  } as const;

  return {
    status: data !== undefined ? statusMap[data as keyof typeof statusMap] : undefined,
    statusCode: data as number | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for time remaining
export function useTimeRemaining(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "getTimeRemaining",
  });

  return {
    timeRemaining: data !== undefined ? Number(data) : undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for checking if user has voted
export function useHasVoted(userAddress?: string, contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    hasVoted: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for checking if user can view results
export function useCanViewResults(userAddress?: string, contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "canViewResults",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    canViewResults: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting admin address
export function useAdmin(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "admin",
  });

  return {
    admin: data as `0x${string}` | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for checking if current user is admin
export function useIsAdmin(contractAddress?: `0x${string}`) {
  const { address: userAddress } = useAccount();
  const { admin, isLoading, error } = useAdmin(contractAddress);

  return {
    isAdmin: userAddress && admin ? userAddress.toLowerCase() === admin.toLowerCase() : false,
    isLoading,
    error,
  };
}

// Hook for getting all tallies (encrypted)
export function useAllTallies(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "getAllTallies",
  });

  return {
    tallies: data as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting queued viewers
export function useQueuedViewers(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "getQueuedViewers",
  });

  return {
    queuedViewers: data as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook for total voters count
export function useTotalVoters(contractAddress?: `0x${string}`) {
  const address = contractAddress || SURVEY_COUNCIL_ADDRESS;
  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: SURVEY_COUNCIL_ABI,
    functionName: "totalVoters",
  });

  return {
    totalVoters: data !== undefined ? Number(data) : undefined,
    isLoading,
    error,
    refetch,
  };
}
