const { expect } = require("chai");
const { Signer } = require("ethers");
const { ethers } = require("hardhat");


describe("EMR Storage Contract Tests", function () {

  it("Should create a HeraCoin contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

  });

  it("Should create a Heracoin Rewarder Contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    await rewarder_contract.deployed();
    expect(await rewarder_contract.getRewardAmount()).to.equal(100000000000000);
  });

  it("Should create an EMR Storage Contract", async function () {
    const [owner] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 100000000000);

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy(rewarder_address.address);
    const database_address = await database.deployed();


    const created = await database_address.createEMRStorage();
    const address = await database_address.getEMRStorageContract();
    console.log(address);

  });

  // it("Should return an array of EMRs owned by this address", async function () {
  //   const [owner] = await ethers.getSigners();

  //   const HeraCoin = await ethers.getContractFactory("HeraCoin");
  //   const heracoin = await HeraCoin.deploy();
  //   const heracoin_token = heracoin.deployed();

  //   const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
  //   const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
  //   const rewarder_address = await rewarder_contract.deployed();

  //   await heracoin.transfer(rewarder_address.address, 1000);

  //   const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
  //   const database = await EMRDatabase.deploy(rewarder_address.address);
  //   const database_address = await database.deployed();

  //   await database_address.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
  //   await database_address.createEMR("test2", "test2", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");

  //   const owned_emrs_count = await database.getNumberOwnedEMRs();
  //   expect(owned_emrs_count).to.equal(2);
  // });

  // it("Should transfer heracoin to the EMR creator", async function () {
  //   const [owner, patient] = await ethers.getSigners();

  //   const HeraCoin = await ethers.getContractFactory("HeraCoin");
  //   const heracoin = await HeraCoin.deploy();
  //   const heracoin_token = heracoin.deployed();

  //   const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
  //   const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
  //   const rewarder_address = await rewarder_contract.deployed();

  //   await heracoin.transfer(rewarder_address.address, 1000);

  //   const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
  //   const database = await EMRDatabase.deploy(rewarder_address.address);
  //   const database_address = await database.deployed();

  //   await database_address.connect(patient).createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");


  //   const emrfactory = await ethers.getContractFactory("EMRContract");
  //   const emr = await database_address.getEMRById(0);
  //   const emr_data = await emrfactory.attach(emr);

  //   expect(await emr_data.connect(patient).getRecordType()).to.equal("test");

  //   patient_balance = await heracoin.balanceOf(patient.getAddress());
  //   contract_balance = await heracoin.balanceOf(rewarder_address.address);

  //   expect(patient_balance).to.equal(10);
  //   expect(contract_balance).to.equal(990);

  // });


  // it("Should not allow one patient to access another patient's EMRs", async function () {
  //   const [owner, patient1, patient2] = await ethers.getSigners();

  //   const HeraCoin = await ethers.getContractFactory("HeraCoin");
  //   const heracoin = await HeraCoin.deploy();
  //   const heracoin_token = heracoin.deployed();

  //   const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
  //   const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
  //   const rewarder_address = await rewarder_contract.deployed();

  //   await heracoin.transfer(rewarder_address.address, 1000);

  //   const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
  //   const database = await EMRDatabase.deploy(rewarder_address.address);
  //   const database_address = await database.deployed();

  //   const emrfactory = await ethers.getContractFactory("EMRContract");
  //   await database_address.connect(patient1).createEMR("test1", "test1", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
  //   await database_address.connect(patient2).createEMR("test2", "test2", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");

  //   const emr1 = emrfactory.attach(database_address.getEMRById(0));
  //   const emr2 = emrfactory.attach(database_address.getEMRById(1));


  //   await expect(emr1.connect(patient2).getRecordType()).to.be.reverted;
  //   await expect(emr2.connect(patient1).getRecordType()).to.be.reverted;

  // });

});
