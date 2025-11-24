const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x086a132059CAb4E15cb8046dA4B051Ef3B44Ebb0";

  console.log("Checking contract:", contractAddress);

  const contract = await ethers.getContractAt("SurveyCouncil", contractAddress);

  const info = await contract.getSurveyInfo();
  const status = await contract.getVotingStatus();
  const now = Math.floor(Date.now() / 1000);

  console.log("\n=== Survey Info ===");
  console.log("Title:", info[0]);
  console.log("Start Time:", new Date(Number(info[1]) * 1000).toISOString());
  console.log("End Time:", new Date(Number(info[2]) * 1000).toISOString());
  console.log("Finalized:", info[3]);
  console.log("Options Count:", Number(info[4]));
  console.log("Voter Count:", Number(info[5]));

  console.log("\n=== Status ===");
  console.log("Status Code:", Number(status), "(0=NOT_STARTED, 1=ACTIVE, 2=ENDED, 3=FINALIZED)");
  console.log("Current Time:", new Date(now * 1000).toISOString());
  console.log("Start Timestamp:", Number(info[1]));
  console.log("End Timestamp:", Number(info[2]));
  console.log("Now Timestamp:", now);

  if (now < Number(info[1])) {
    console.log("\n⚠️  Voting has NOT STARTED yet!");
    console.log("Starts in:", Math.floor((Number(info[1]) - now) / 60), "minutes");
  } else if (now > Number(info[2])) {
    console.log("\n⚠️  Voting has ENDED!");
    console.log("Ended:", Math.floor((now - Number(info[2])) / 60), "minutes ago");
  } else {
    console.log("\n✅ Voting is ACTIVE");
  }
}

main().catch(console.error);
