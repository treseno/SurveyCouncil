# 🔒 SurveyCouncil

> **Privacy-Preserving Encrypted Voting Platform for Decentralized Governance**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama_fhEVM-0.9.1-green.svg)](https://docs.zama.ai/fhevm)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Hardhat](https://img.shields.io/badge/Hardhat-Latest-yellow.svg)](https://hardhat.org/)

SurveyCouncil is a cutting-edge decentralized voting platform that leverages **Fully Homomorphic Encryption (FHE)** to ensure complete vote privacy while maintaining verifiability and transparency. Built on Zama's fhEVM technology, it enables DAOs and organizations to conduct confidential surveys and voting without revealing individual choices.

---

## 🌟 Key Features

### 🛡️ Privacy-First Architecture
- **End-to-End Encryption**: Votes are encrypted client-side before submission
- **Homomorphic Computation**: Vote tallying occurs on encrypted data without decryption
- **Zero-Knowledge Privacy**: Individual votes remain confidential even after finalization
- **Selective Disclosure**: Only authorized viewers can decrypt aggregate results

### 🏛️ DAO Governance Ready
- **Multiple Concurrent Surveys**: Deploy and manage multiple independent voting instances
- **Flexible Options**: Support for 2-32 voting options per survey
- **Configurable Duration**: Voting periods from 1 hour to 30 days
- **Admin Controls**: Extend voting periods, finalize results, manage viewer access

### 🔐 Advanced Access Control
- **Role-Based Permissions**: Admin, voters, and result viewers with distinct privileges
- **Viewer Queue System**: Pre-authorize viewers before finalization for gas optimization
- **Batch Operations**: Grant access to multiple viewers in a single transaction
- **Granular Permissions**: Control who can decrypt results post-finalization

### ⚡ Production-Ready
- **Comprehensive Testing**: Full test suite with integration and unit tests
- **Gas Optimized**: Efficient FHE operations with batch processing support
- **Modern Stack**: React 18 + TypeScript + Vite + Wagmi v2 + RainbowKit
- **Responsive UI**: Mobile-first design with dark mode support

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SurveyCouncil Platform                       │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │     │ Smart Contract│     │   fhEVM      │
│  (React App) │────▶│  (Solidity)   │────▶│  (Sepolia)   │
└──────────────┘     └──────────────┘     └──────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ FHE Client   │     │  Vote Storage│     │FHE Precompiles│
│   Encryption │     │  (Encrypted)  │     │  (On-chain)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Technical Stack

#### Smart Contract Layer
- **Language**: Solidity 0.8.24
- **Framework**: Hardhat with TypeScript support
- **Blockchain**: Ethereum Sepolia Testnet (fhEVM-compatible)
- **Encryption**: Zama fhEVM 0.9.1 with FHE precompiles
- **Standards**: Custom encrypted voting protocol

#### Frontend Layer
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: TailwindCSS 3.4 + shadcn/ui components
- **Web3**: Wagmi 2.14 + Viem 2.21
- **Wallet**: RainbowKit 2.2 (multi-wallet support)
- **FHE SDK**: Zama RelayerSDK 0.3.0-5

#### Infrastructure
- **Deployment**: Vercel (Production: https://surveycouncil-kgmgq09yd-songsus-projects.vercel.app)
- **RPC**: Ethereum Sepolia Public Nodes
- **Storage**: On-chain encrypted state

---

## 🔬 How It Works

### Vote Encryption Flow

```
┌─────────────┐
│   Voter     │
│  Selects    │
│  Option 0   │
└──────┬──────┘
       │
       │ Client-side Encryption
       ▼
┌─────────────────────────────────┐
│  FHE SDK (RelayerSDK)           │
│  ┌─────────────────────────┐   │
│  │ encryptedOne = E(1)     │   │  Encrypt value "1"
│  │ proof = ZK_Proof        │   │  Generate ZK proof
│  └─────────────────────────┘   │
└──────────────┬──────────────────┘
               │
               │ Submit to Contract
               ▼
┌─────────────────────────────────┐
│  Smart Contract                  │
│  ┌─────────────────────────┐   │
│  │ Verify ZK Proof         │   │  Validate proof
│  │ tallies[0] += E(1)      │   │  FHE addition
│  │ FHE.allowThis(tallies)  │   │  Update ACL
│  └─────────────────────────┘   │
└──────────────┬──────────────────┘
               │
               │ Encrypted Storage
               ▼
┌─────────────────────────────────┐
│  Blockchain State                │
│  ┌─────────────────────────┐   │
│  │ tallies[0] = E(count₀) │   │  Option 0: E(n)
│  │ tallies[1] = E(count₁) │   │  Option 1: E(m)
│  │ tallies[2] = E(count₂) │   │  Option 2: E(k)
│  │ ...                     │   │  ...
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Result Decryption Flow

```
┌──────────────┐
│ Admin/Viewer │
│  Requests    │
│   Results    │
└──────┬───────┘
       │
       │ After Finalization
       ▼
┌─────────────────────────────────┐
│  Smart Contract                  │
│  ┌─────────────────────────┐   │
│  │ Check Authorization     │   │  Verify viewer ACL
│  │ Return E(count₀),...    │   │  Return encrypted handles
│  └─────────────────────────┘   │
└──────────────┬──────────────────┘
               │
               │ Encrypted Handles
               ▼
┌─────────────────────────────────┐
│  FHE SDK (RelayerSDK)           │
│  ┌─────────────────────────┐   │
│  │ Decrypt via Relayer     │   │  Public decryption
│  │ count₀ = D(E(count₀))   │   │  Get plaintext
│  └─────────────────────────┘   │
└──────────────┬──────────────────┘
               │
               │ Plaintext Results
               ▼
┌─────────────────────────────────┐
│  Frontend Display                │
│  ┌─────────────────────────┐   │
│  │ Option 0: 42 votes     │   │
│  │ Option 1: 35 votes     │   │
│  │ Option 2: 28 votes     │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 📋 Contract Architecture

### State Variables

```solidity
// Core State
address public admin;                              // Survey administrator
string public title;                               // Survey title
uint256 public votingStart;                        // Start timestamp
uint256 public votingEnd;                          // End timestamp
bool public finalized;                             // Finalization status
uint256 public totalVoters;                        // Participation count

// Encrypted Vote Storage
mapping(uint256 => euint64) private _votes;        // optionId => encrypted count
mapping(address => bool) private _hasVoted;        // voter => voted status

// Options and Access Control
string[] private _options;                         // Vote options
mapping(address => bool) public canViewResults;    // viewer => access status
mapping(address => bool) private _queuedViewers;   // queued viewer status
address[] private _queuedViewerList;               // queued viewer array
```

### Key Functions

#### Voting Operations
```solidity
function castVote(
    uint256 optionId,
    externalEuint64 encryptedOne,
    bytes calldata proof
) external;
```

#### Admin Operations
```solidity
function finalize() external onlyAdmin notFinalized;
function extendVoting(uint256 newEndTime) external onlyAdmin;
function grantView(address viewer) external onlyAdmin isFinalized;
function queueViewer(address viewer) external onlyAdmin notFinalized;
```

#### View Functions
```solidity
function getSurveyInfo() external view returns (...);
function getVotingStatus() external view returns (uint8);
function hasVoted(address voter) external view returns (bool);
function getTally(uint256 optionId) external view returns (euint64);
```

### Security Model

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Cryptographic Privacy (FHE)                   │
│  ├─ Client-side encryption                              │
│  ├─ Zero-knowledge proofs                               │
│  ├─ Homomorphic vote aggregation                        │
│  └─ Selective decryption with ACLs                      │
│                                                          │
│  Layer 2: Access Control                                │
│  ├─ Admin-only finalization                             │
│  ├─ One vote per address                                │
│  ├─ Time-based voting windows                           │
│  └─ Permissioned result viewing                         │
│                                                          │
│  Layer 3: Integrity Protection                          │
│  ├─ Immutable vote records                              │
│  ├─ Tamper-proof encrypted tallies                      │
│  ├─ Irreversible finalization                           │
│  └─ Transparent participation tracking                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia ETH for gas fees

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/SurveyCouncil.git
cd SurveyCouncil

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Smart Contract Setup

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" \
PRIVATE_KEY="your_private_key" \
npx hardhat run scripts/deploy.js --network sepolia

# Deploy multiple surveys
SEPOLIA_RPC_URL="..." \
PRIVATE_KEY="..." \
npx hardhat run scripts/deploy-multiple-surveys.js --network sepolia
```

### Frontend Setup

```bash
cd frontend

# Configure environment (if needed)
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration

Update `frontend/src/config/contracts.ts` with your deployed contract addresses:

```typescript
export const SURVEYS = [
  {
    id: 1,
    title: "Your Survey Title",
    address: "0xYourContractAddress" as `0x${string}`,
    description: "Survey description",
    category: "Governance",
  },
  // ... more surveys
];
```

---

## 📊 Usage Examples

### Deploy a New Survey

```javascript
const SurveyCouncil = await ethers.getContractFactory("SurveyCouncil");
const survey = await SurveyCouncil.deploy(
  "DAO Treasury Allocation",
  [
    "Protocol Development",
    "Marketing & Community",
    "Security Audits",
    "Reserve Fund",
  ],
  7 * 24 * 60 * 60 // 7 days
);
```

### Cast a Vote (Frontend)

```typescript
import { encryptVote } from '@/lib/fhe';

// Encrypt vote
const { encryptedOne, proof } = await encryptVote(
  userAddress,
  contractAddress
);

// Submit to contract
await surveyContract.castVote(optionId, encryptedOne, proof);
```

### Finalize and View Results

```typescript
// Admin finalizes after voting ends
await surveyContract.finalize();

// Get encrypted tallies
const tallies = await surveyContract.getAllTallies();

// Decrypt results
const results = await publicDecryptHandles(tallies);
console.log(results.values); // [42, 35, 28, ...]
```

---

## 🧪 Testing

### Run Test Suite

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/SurveyCouncil.basic.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Test Coverage

- ✅ Contract deployment validation
- ✅ Voting mechanism (encryption, submission, tallying)
- ✅ Admin operations (extend, finalize)
- ✅ Access control (admin, voters, viewers)
- ✅ Viewer management (queue, grant, remove)
- ✅ Result viewing permissions
- ✅ Integration scenarios

See [test/README.md](test/README.md) for detailed test documentation.

---

## 🔒 Security Considerations

### Cryptographic Security
- **FHE Encryption**: Votes encrypted with 64-bit ciphertexts (euint64)
- **Zero-Knowledge Proofs**: Validate encrypted inputs without revealing content
- **Homomorphic Properties**: Allows computation on encrypted data
- **Access Control Lists**: fhEVM native ACL for decryption permissions

### Smart Contract Security
- **Reentrancy Protection**: State updates before external calls
- **Integer Overflow**: Solidity 0.8+ built-in overflow checks
- **Access Modifiers**: `onlyAdmin`, `notFinalized`, `isFinalized`
- **Custom Errors**: Gas-efficient error handling

### Operational Security
- **One Vote Per Address**: Enforced with `_hasVoted` mapping
- **Time-Based Controls**: Voting window enforced with timestamps
- **Immutable Votes**: No vote modification after submission
- **Irreversible Finalization**: Finalized state cannot be reversed

### Known Limitations
- **Gas Costs**: FHE operations require ~200k-300k gas per vote
- **Relayer Dependency**: Result decryption requires Zama relayer service
- **Network Support**: Currently Sepolia testnet only (fhEVM v0.9.1)
- **Scalability**: Optimal for surveys with < 10,000 participants

---

## 📈 Gas Optimization

### Voting Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| `castVote` | ~200-300k | Includes FHE proof verification + addition |
| `finalize` | ~100-500k | Variable (depends on options + queued viewers) |
| `grantView` | ~100k | Single viewer authorization |
| `grantViewMany` | ~50k/viewer | Batch authorization (more efficient) |
| `queueViewer` | ~50k | Pre-finalization queue |

### Optimization Tips

1. **Batch Viewer Grants**: Use `grantViewMany()` instead of multiple `grantView()` calls
2. **Pre-Queue Viewers**: Queue viewers before finalization to save post-finalization gas
3. **Minimize Options**: Fewer options = less gas on finalization
4. **Optimal Duration**: Choose appropriate voting period to avoid extensions

---

## 🌐 Deployed Contracts

### Sepolia Testnet

| Survey | Contract Address | Category |
|--------|------------------|----------|
| DeFi Protocol Treasury | `0xd5B37C12c306e75913373505BB2D3A2C25349270` | DeFi |
| DAO Governance Model | `0x086a132059CAb4E15cb8046dA4B051Ef3B44Ebb0` | Governance |
| Layer 2 Scaling | `0xF428186adcca7c80ac4994C6a183B76f4e965929` | Infrastructure |
| Token Utility Enhancement | `0xDcBDfDFF47e46EDbfB15812FE177412a6c48d14a` | Tokenomics |
| Community Fund Q1 2025 | `0x846cB11cC93FE042b14c912c66e6dFcED9538199` | Treasury |

### Frontend

- **Production**: https://surveycouncil-kgmgq09yd-songsus-projects.vercel.app
- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111

---

## 🛠️ Development

### Project Structure

```
SurveyCouncil/
├── contracts/
│   └── SurveyCouncil.sol          # Main voting contract
├── scripts/
│   ├── deploy.js                  # Single survey deployment
│   ├── deploy-multiple-surveys.js # Batch deployment
│   └── check-status.js            # Contract status checker
├── test/
│   ├── SurveyCouncil.test.js      # Full integration tests
│   ├── SurveyCouncil.basic.test.js # Basic validation tests
│   └── README.md                  # Test documentation
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom hooks (Wagmi)
│   │   ├── lib/                   # FHE utilities
│   │   ├── pages/                 # Route pages
│   │   └── config/                # Contract configs
│   └── public/                    # Static assets
├── hardhat.config.ts              # Hardhat configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

### Available Scripts

```bash
# Contract development
npm run compile         # Compile contracts
npm run test           # Run tests
npm run deploy         # Deploy to configured network

# Frontend development
cd frontend
npm run dev            # Start dev server
npm run build          # Production build
npm run preview        # Preview build
npm run lint           # Run ESLint
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📚 Resources

### Documentation
- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)

### Related Projects
- [fhEVM Repository](https://github.com/zama-ai/fhevm)
- [fhEVM Solidity](https://github.com/zama-ai/fhevm-solidity)
- [Zama Examples](https://github.com/zama-ai/fhevm-examples)

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Twitter](https://twitter.com/zama_fhe)

---

## 🔮 Roadmap

### Phase 1: Core Features ✅
- [x] FHE-based encrypted voting
- [x] Multi-survey support
- [x] Admin controls and finalization
- [x] Viewer access management
- [x] Comprehensive testing

### Phase 2: Enhanced Features 🚧
- [ ] Weighted voting (token-based)
- [ ] Quadratic voting support
- [ ] Multi-round voting
- [ ] Delegation mechanisms
- [ ] Advanced result analytics

### Phase 3: Mainnet Launch 📅
- [ ] Security audit
- [ ] Gas optimization v2
- [ ] Mainnet deployment
- [ ] Production-ready relayer
- [ ] Enhanced UI/UX

### Phase 4: Ecosystem Integration 🌐
- [ ] Snapshot integration
- [ ] Tally integration
- [ ] Multi-chain support
- [ ] Mobile app
- [ ] API for third-party integrations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama Team** for pioneering FHE technology and fhEVM
- **Ethereum Foundation** for the robust smart contract platform
- **Hardhat Team** for excellent development tools
- **Wagmi & RainbowKit** for seamless Web3 integration
- **shadcn/ui** for beautiful UI components

---

## 📞 Contact

- **Project**: SurveyCouncil
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Discord**: Your Discord Server

---

<div align="center">

**Built with ❤️ using Zama FHE Technology**

⭐ Star us on GitHub if you find this project useful!

[Website](https://surveycouncil-kgmgq09yd-songsus-projects.vercel.app) • [Documentation](./docs) • [Examples](./examples) • [Contributing](./CONTRIBUTING.md)

</div>
