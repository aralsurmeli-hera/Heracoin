const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("EMR Database Tests", function () {

  it("Should create a HeraCoin contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

  });

  it("Should create a HeraCoin Rewarder Contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

  });

  it("Should create an EMR Contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await rewarder_address).address);
    await database.deployed();
  });

  it("Should create an EMR Struct", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await rewarder_address).address);
    const database_address = await database.deployed();

    await heracoin.transfer(rewarder_address.address, 1000);

    await database.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    const emr = await database.getEMRById(1);
    expect(emr.id).to.equal(1);

  });

  it("Should return an array of EMRs owned by this address", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await rewarder_address).address);
    const database_address = await database.deployed();

    await heracoin.transfer(rewarder_address.address, 1000);


    await database.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    const emr1 = await database.getEMRById(1);
    expect(emr1.id).to.equal(1);
    expect(emr1.record_type).to.equal("test");

    await database.createEMR("test2", "test2", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    const emr2 = await database.getEMRById(2);
    expect(emr2.id).to.equal(2);
    expect(emr2.record_type).to.equal("test2");


    const owned_emrs_count = await database.getNumberOwnedEMRs();
    expect(owned_emrs_count).to.equal(2);
  });

  it("Should transfer heracoin to the EMR creator", async function () {
    const [owner, patient] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    var owner_balance = await heracoin.balanceOf(owner.getAddress());

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await rewarder_address).address);
    const database_address = await database.deployed();

    await heracoin.transfer(rewarder_address.address, 1000);
    owner_balance = await heracoin.balanceOf(owner.getAddress());

    var contract_balance = await heracoin.balanceOf(await rewarder_address.address);

    await database.connect(patient).createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    patient_balance = await heracoin.balanceOf(patient.getAddress());
    contract_balance = await heracoin.balanceOf(rewarder_address.address);

    expect(patient_balance).to.equal(10);
    expect(contract_balance).to.equal(990);
  });

  it("Should not allow one patient to access another patient's EMRs", async function () {
    const [owner, patient1, patient2] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();


    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await rewarder_address).address);
    const database_address = await database.deployed();

    await heracoin.transfer(rewarder_address.address, 1000);
    owner_balance = await heracoin.balanceOf(owner.getAddress());

    await database.connect(patient1).createEMR("test1", "test1", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    await database.connect(patient2).createEMR("test2", "test2", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");

    await expect(database.connect(patient1).getEMRById(2)).to.be.reverted;
    await expect(database.connect(patient2).getEMRById(1)).to.be.reverted;

  });

});


describe("EMR Contract Tests", function () {

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
    expect(await rewarder_contract.getRewardAmount()).to.equal(10);
  });

  it("Should create an EMR Contract", async function () {
    const [owner] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 1000);

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy(rewarder_address.address);
    const database_address = await database.deployed();

    await database_address.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    
    const owned_emrs_count = await database.getNumberOwnedEMRs();
    expect(owned_emrs_count).to.equal(1);

    const EMRContractFactory = await ethers.getContractFactory("EMRContract");
    const emr = await database_address.getEMRById(0);
    const emr_contract = await EMRContractFactory.attach(emr);

    expect(await emr_contract.getRecordType()).to.equal("test");
  });

  it("Should return an array of EMRs owned by this address", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 1000);


    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy();
    const database_address = await database.deployed();

    const emr = await ethers.getContractFactory("EMRContract");
    const emr1 = await emr.deploy("test1", "test1", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", (await rewarder_address).address, (await database_address).address);
    const emr2 = await emr.deploy("test2", "test2", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", (await rewarder_address).address, (await database_address).address);


    const owned_emrs_count = await database.getNumberOwnedEMRs();
    expect(owned_emrs_count).to.equal(2);
  });

  it("Should transfer heracoin to the EMR creator", async function () {
    const [owner, patient] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    var owner_balance = await heracoin.balanceOf(owner.getAddress());
    await heracoin.transfer(rewarder_address.address, 1000);

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy();
    const database_address = await database.deployed();

    const emr = await ethers.getContractFactory("EMRContract");
    const emr_deploy = await emr.connect(patient).deploy("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", (await rewarder_address).address, (await database_address).address);
    const emr_address = await emr_deploy.deployed();

    expect(await emr_deploy.getRecordType()).to.equal("test");

    patient_balance = await heracoin.balanceOf(patient.getAddress());
    contract_balance = await heracoin.balanceOf(rewarder_address.address);

    expect(patient_balance).to.equal(10);
    expect(contract_balance).to.equal(990);

  });

  it("Should not allow one patient to access another patient's EMRs", async function () {
    const [owner, patient1, patient2] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    var owner_balance = await heracoin.balanceOf(owner.getAddress());
    await heracoin.transfer(rewarder_address.address, 1000);

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy();
    const database_address = await database.deployed();

    const emr = await ethers.getContractFactory("EMRContract");
    const emr1 = await emr.connect(patient1).deploy("test1", "test1", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", (await rewarder_address).address, (await database_address).address);
    const emr2 = await emr.connect(patient2).deploy("test2", "test2", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", (await rewarder_address).address, (await database_address).address);

    await expect(emr1.connect(patient2).getRecordType()).to.be.reverted;
    await expect(emr2.connect(patient1).getRecordType()).to.be.reverted;

  });

});
