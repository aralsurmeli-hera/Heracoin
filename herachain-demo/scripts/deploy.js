
const hre = require("hardhat");
const fs = require('fs');

async function main() {

  const HeraCoinFactory = await hre.ethers.getContractFactory("HeraCoin");
  const HeraCoin = await HeraCoinFactory.deploy();
  const HeraCoinAddress = await HeraCoin.deployed();
  console.log("HeraCoin deployed to:", HeraCoinAddress.address);

  const RewarderFactory = await hre.ethers.getContractFactory("HeraCoinRewarder");
  const Rewarder = await RewarderFactory.deploy(HeraCoinAddress.address);
  const RewarderAddress = await Rewarder.deployed();
  console.log("Rewarder deployed to:", RewarderAddress.address);

  await HeraCoin.transfer(RewarderAddress.address, "100000000000000000");
  console.log("Rewarder has been funded");

  const EMRDatabaseFactory = await hre.ethers.getContractFactory("EMRContractDatabase");
  const EMRDatabase = await EMRDatabaseFactory.deploy(RewarderAddress.address);
  const EMRDatabaseAddress = await EMRDatabase.deployed();
  console.log("EMR Database deployed to:", EMRDatabaseAddress.address);

  fs.writeFileSync('./src/config.js',
    `export const databaseAddress = "${EMRDatabaseAddress.address}"
    export const heracoinAddress = "${HeraCoinAddress.address}"
    export const rewarderAddress = "${RewarderAddress.address}"
    export const ownerAddress = "${EMRDatabaseAddress.signer.address}"`
    , { encoding: 'utf8', flag: 'w' })

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
