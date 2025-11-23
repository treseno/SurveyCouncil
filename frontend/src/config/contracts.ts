// SurveyCouncil contract configuration
// Contracts deployed on Sepolia: 2025-11-27

// All deployed surveys
export const SURVEYS = [
  {
    id: 1,
    title: "DeFi Protocol Treasury Allocation",
    address: "0xd5B37C12c306e75913373505BB2D3A2C25349270" as `0x${string}`,
    description: "Vote on how to allocate the protocol treasury funds for maximum community benefit.",
    category: "DeFi",
  },
  {
    id: 2,
    title: "DAO Governance Model Upgrade",
    address: "0x086a132059CAb4E15cb8046dA4B051Ef3B44Ebb0" as `0x${string}`,
    description: "Choose the next governance model for our decentralized autonomous organization.",
    category: "Governance",
  },
  {
    id: 3,
    title: "Layer 2 Scaling Solution Priority",
    address: "0xF428186adcca7c80ac4994C6a183B76f4e965929" as `0x${string}`,
    description: "Help decide which Layer 2 solution should be prioritized for deployment.",
    category: "Infrastructure",
  },
  {
    id: 4,
    title: "Token Utility Enhancement Proposal",
    address: "0xDcBDfDFF47e46EDbfB15812FE177412a6c48d14a" as `0x${string}`,
    description: "Vote on new utility features for the protocol token.",
    category: "Tokenomics",
  },
  {
    id: 5,
    title: "Community Fund Allocation Q1 2025",
    address: "0x846cB11cC93FE042b14c912c66e6dFcED9538199" as `0x${string}`,
    description: "Decide how to allocate community funds for the first quarter of 2025.",
    category: "Treasury",
  },
] as const;

export type Survey = typeof SURVEYS[number];

// Default survey address (first one)
const DEPLOYED_ADDRESS = SURVEYS[0].address;
const envAddress = (import.meta as any).env?.VITE_SURVEY_COUNCIL_ADDRESS as `0x${string}` | undefined;
export const SURVEY_COUNCIL_ADDRESS =
  envAddress && envAddress.startsWith("0x")
    ? envAddress
    : DEPLOYED_ADDRESS;

// Contract ABI - extracted from artifacts/contracts/SurveyCouncil.sol/SurveyCouncil.json
export const SURVEY_COUNCIL_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string[]", name: "optionList", type: "string[]" },
      { internalType: "uint256", name: "durationSeconds", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  { inputs: [], name: "AlreadyAuthorized", type: "error" },
  { inputs: [], name: "AlreadyFinalized", type: "error" },
  { inputs: [], name: "AlreadyVoted", type: "error" },
  { inputs: [], name: "InvalidDuration", type: "error" },
  { inputs: [], name: "InvalidOption", type: "error" },
  { inputs: [], name: "InvalidOptionsLength", type: "error" },
  { inputs: [], name: "InvalidViewer", type: "error" },
  { inputs: [], name: "NotAdmin", type: "error" },
  { inputs: [], name: "NotAuthorized", type: "error" },
  { inputs: [], name: "NotFinalized", type: "error" },
  { inputs: [], name: "NotQueued", type: "error" },
  { inputs: [], name: "ResultsLocked", type: "error" },
  { inputs: [], name: "VotingClosed", type: "error" },
  { inputs: [], name: "VotingNotEnded", type: "error" },
  { inputs: [], name: "VotingNotStarted", type: "error" },
  { inputs: [], name: "ZamaProtocolUnsupported", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalVoters", type: "uint256" }
    ],
    name: "Finalized",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "uint256", name: "optionsCount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "endTime", type: "uint256" }
    ],
    name: "SurveyCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "viewer", type: "address" }],
    name: "ViewerGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "viewer", type: "address" }],
    name: "ViewerQueued",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "viewer", type: "address" }],
    name: "ViewerRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "voter", type: "address" },
      { indexed: true, internalType: "uint256", name: "optionId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "VoteCast",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "oldEndTime", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newEndTime", type: "uint256" }
    ],
    name: "VotingExtended",
    type: "event"
  },
  {
    inputs: [],
    name: "MAX_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "MAX_OPTIONS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "MIN_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "canViewResults",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "optionId", type: "uint256" },
      { internalType: "externalEuint64", name: "encryptedOne", type: "bytes32" },
      { internalType: "bytes", name: "proof", type: "bytes" }
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "confidentialProtocolId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "newEndTime", type: "uint256" }],
    name: "extendVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "finalize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "finalized",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllTallies",
    outputs: [{ internalType: "euint64[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getOptions",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getOptionsCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getQueuedViewers",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getSurveyInfo",
    outputs: [
      { internalType: "string", name: "surveyTitle", type: "string" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "bool", name: "surveyFinalized", type: "bool" },
      { internalType: "uint256", name: "optionsCount", type: "uint256" },
      { internalType: "uint256", name: "voterCount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "optionId", type: "uint256" }],
    name: "getTally",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTimeRemaining",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getVotingStatus",
    outputs: [{ internalType: "uint8", name: "status", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "viewer", type: "address" }],
    name: "grantView",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address[]", name: "viewers", type: "address[]" }],
    name: "grantViewMany",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "voter", type: "address" }],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "viewer", type: "address" }],
    name: "isQueued",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "viewer", type: "address" }],
    name: "queueViewer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address[]", name: "viewers", type: "address[]" }],
    name: "queueViewers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "viewer", type: "address" }],
    name: "removeQueuedViewer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "title",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalVoters",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "votingEnd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "votingStart",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Voting status enum (matches contract)
export const VotingStatus = {
  NOT_STARTED: 0,
  ACTIVE: 1,
  ENDED: 2,
  FINALIZED: 3,
} as const;

export type VotingStatusType = typeof VotingStatus[keyof typeof VotingStatus];
