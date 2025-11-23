const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting SurveyCouncil deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy SurveyCipherCouncil
  // Parameters: title, options array, duration in seconds
  const surveyTitle = "Community Infrastructure Priority Survey";
  const options = [
    "Improve public transportation",
    "Expand green spaces and parks",
    "Enhance healthcare facilities",
    "Upgrade educational infrastructure",
    "Develop sustainable energy"
  ];
  const durationSeconds = 7 * 24 * 60 * 60; // 7 days

  console.log("🔨 Deploying SurveyCouncil...");
  console.log("   Title:", surveyTitle);
  console.log("   Options:", options.length);
  options.forEach((opt, i) => console.log(`     ${i + 1}. ${opt}`));
  console.log("   Duration:", durationSeconds, "seconds (7 days)");

  const SurveyCouncil = await hre.ethers.getContractFactory("SurveyCouncil");
  const survey = await SurveyCouncil.deploy(surveyTitle, options, durationSeconds);
  await survey.waitForDeployment();

  const contractAddress = await survey.getAddress();
  console.log("✅ SurveyCouncil deployed to:", contractAddress);

  // Verify initial contract state
  const admin = await survey.admin();
  const title = await survey.title();
  const votingStart = await survey.votingStart();
  const votingEnd = await survey.votingEnd();
  const finalized = await survey.finalized();

  console.log("\n📋 Contract Info:");
  console.log("   Admin:", admin);
  console.log("   Title:", title);
  console.log("   Voting start:", new Date(Number(votingStart) * 1000).toLocaleString());
  console.log("   Voting end:", new Date(Number(votingEnd) * 1000).toLocaleString());
  console.log("   Finalized:", finalized);

  // Verify options were set correctly
  const storedOptions = await survey.getOptions();
  console.log("   Options count:", storedOptions.length);

  // Update frontend configuration
  console.log("\n🔧 Updating frontend configuration...");
  const configPath = path.join(__dirname, "../frontend/src/constants/contracts.ts");

  try {
    let configContent = fs.readFileSync(configPath, "utf8");

    // Update contract address
    configContent = configContent.replace(
      /export const SURVEY_COUNCIL_ADDRESS: Address =\s*"0x[a-fA-F0-9]{40}";/,
      `export const SURVEY_COUNCIL_ADDRESS: Address =\n  "${contractAddress}";`
    );

    fs.writeFileSync(configPath, configContent);
    console.log("✅ Frontend configuration updated!");
  } catch (error) {
    console.error("⚠️  Warning: Could not update frontend config:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contract: contractAddress,
    admin: admin,
    title: title,
    votingStart: votingStart.toString(),
    votingEnd: votingEnd.toString(),
    durationSeconds: durationSeconds,
    options: storedOptions,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment info saved to: ${deploymentFile}`);

  console.log("\n🎉 Deployment complete!");
  console.log("\n📚 Next steps:");
  console.log("   1. Verify the contract on Etherscan (optional)");
  console.log("   2. Start the frontend: cd frontend && npm run dev");
  console.log("   3. Cast votes before voting period ends");
  console.log("   4. Queue viewers (optional)");
  console.log("   5. Finalize survey after voting ends");
  console.log("   6. Grant view permissions to queued viewers");
  console.log("\n🔗 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
