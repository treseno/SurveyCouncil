const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Blockchain, Crypto, and DAO related surveys
const SURVEYS = [
  {
    title: "DeFi Protocol Treasury Allocation",
    options: [
      "Increase liquidity mining rewards",
      "Fund security audits",
      "Expand to new chains",
      "Buy back and burn tokens",
      "Invest in protocol development"
    ],
    durationDays: 5
  },
  {
    title: "DAO Governance Model Upgrade",
    options: [
      "Quadratic voting implementation",
      "Conviction voting system",
      "Delegated voting with veto",
      "Holographic consensus",
      "Keep current model"
    ],
    durationDays: 7
  },
  {
    title: "Layer 2 Scaling Solution Priority",
    options: [
      "Optimistic rollups (Arbitrum/Optimism)",
      "ZK rollups (zkSync/StarkNet)",
      "Polygon zkEVM",
      "Base (Coinbase L2)",
      "Multi-chain deployment"
    ],
    durationDays: 6
  },
  {
    title: "Token Utility Enhancement Proposal",
    options: [
      "Staking rewards increase",
      "Governance power boost",
      "Fee discount mechanism",
      "NFT holder benefits",
      "Cross-protocol integration"
    ],
    durationDays: 5
  },
  {
    title: "Community Fund Allocation Q1 2025",
    options: [
      "Developer grants program",
      "Marketing and partnerships",
      "Bug bounty expansion",
      "Community events and hackathons",
      "Reserve for future initiatives"
    ],
    durationDays: 10
  }
];

async function main() {
  console.log("🚀 Deploying multiple blockchain/DAO surveys...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const deployments = [];
  const SurveyCouncil = await hre.ethers.getContractFactory("SurveyCouncil");

  for (let i = 0; i < SURVEYS.length; i++) {
    const survey = SURVEYS[i];
    const durationSeconds = survey.durationDays * 24 * 60 * 60;

    console.log(`\n📝 [${i + 1}/${SURVEYS.length}] Deploying: ${survey.title}`);
    console.log(`   Options: ${survey.options.length}`);
    survey.options.forEach((opt, j) => console.log(`     ${j + 1}. ${opt}`));
    console.log(`   Duration: ${survey.durationDays} days`);

    try {
      const contract = await SurveyCouncil.deploy(
        survey.title,
        survey.options,
        durationSeconds
      );
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();
      const votingStart = await contract.votingStart();
      const votingEnd = await contract.votingEnd();

      console.log(`   ✅ Deployed to: ${contractAddress}`);

      deployments.push({
        id: i + 1,
        title: survey.title,
        address: contractAddress,
        options: survey.options,
        durationDays: survey.durationDays,
        votingStart: votingStart.toString(),
        votingEnd: votingEnd.toString(),
        admin: deployer.address
      });

      // Small delay between deployments
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`   ❌ Failed to deploy: ${error.message}`);
    }
  }

  // Save all deployments
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const outputFile = path.join(deploymentsDir, `${hre.network.name}-surveys.json`);
  const output = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    surveys: deployments
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n📁 Saved deployments to: ${outputFile}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  deployments.forEach((d, i) => {
    console.log(`\n${i + 1}. ${d.title}`);
    console.log(`   Address: ${d.address}`);
    console.log(`   Etherscan: https://sepolia.etherscan.io/address/${d.address}`);
  });
  console.log("\n" + "=".repeat(60));

  console.log("\n🎉 All surveys deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
