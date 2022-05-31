
const hre = require("hardhat");
const fs = require('fs');
const { heracoinAddress } = require("../src/config");

async function main() {

  const HeraCoinFactory = await hre.ethers.getContractFactory("HeraCoin");
  const HeraCoin = await HeraCoinFactory.deploy();
  const HeraCoinAddress = await HeraCoin.deployed();

  const RewarderFactory = await hre.ethers.getContractFactory("HeraCoinRewarder");
  const Rewarder = await RewarderFactory.deploy(HeraCoinAddress.address);
  const RewarderAddress = await Rewarder.deployed();

  const EMRDatabaseFactory = await hre.ethers.getContractFactory("EMRContractDatabase");
  const EMRDatabase = await EMRDatabaseFactory.deploy(RewarderAddress.address);
  const EMRDatabaseAddress = await EMRDatabase.deployed();

  console.log("EMR Database deployed to:", EMRDatabaseAddress.address);
  console.log("HeraCoin deployed to:", HeraCoinAddress.address);
  console.log("Rewarder deployed to:", RewarderAddress.address);

  fs.writeFileSync('./src/config.js', `
  export const databaseAddress = "${EMRDatabaseAddress.address}"
  export const heracoinAddress = "${HeraCoinAddress.address}"
  export const rewarderAddress = "${RewarderAddress.address}"
  export const ownerAddress = "${EMRDatabaseAddress.signer.address}"
  `)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
