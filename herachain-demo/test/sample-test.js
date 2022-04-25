const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EMR", function () {


  it("Should create a HeraCoin contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

  });

  it("Should create an EMR Contract", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();


    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await heracoin_token).address);
    await database.deployed();
  });

  it("Should create an EMR Struct", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();


    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await heracoin_token).address);
    await database.deployed();

    await database.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    const emr = await database.getEMRById(1);
    expect(emr.id).to.equal(1);

  });

  it("Should return an array of EMRs owned by this address", async function () {
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();


    const EMRDatabase = await ethers.getContractFactory("EMRDatabase");
    const database = await EMRDatabase.deploy((await heracoin_token).address);
    await database.deployed();

    await database.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    const emr1 = await database.getEMRById(1);
    expect(emr1.id).to.equal(1);
    expect(emr1.record_type).to.equal("test");


    await database.createEMR("test", "test", 1650505906, "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P", "QmNS4xrK3FT9c2FxocxqGpJxWHWXxf5dzv72sritQbkP3P");
    const emr2 = await database.getEMRById(2);
    expect(emr2.id).to.equal(2);
    expect(emr2.record_type).to.equal("test");


    const emr_array = ethers.decodeParameter("uint256[]", (await database.getOwnedEMRsArray()));
    console.log(emr_array);
  });


});
