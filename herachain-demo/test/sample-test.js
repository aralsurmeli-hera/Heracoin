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

  it("Should NOT create a second EMR Storage Contract for a single contact", async function () {
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

    await expect(database_address.createEMRStorage()).to.be.reverted;

  });


  it("A user should be able to add a record and retrieve a record", async function () {
    const [owner] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 1000000000000000);

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy(rewarder_address.address);
    const database_address = await database.deployed();


    const created = await database_address.createEMRStorage();

    const storageFactory = await ethers.getContractFactory("EMRStorageContract");
    const storageAddress = await database_address.getEMRStorageContract();
    const storageContract = await storageFactory.attach(storageAddress);



    await storageContract.addRecord("test","test",100,101,"test","test");
    const record = await storageContract.getEMR(0);

    expect(record.record_type).to.equal("test");

  });

  it("Should transfer heracoin to the EMR creator", async function () {
    const [owner, patient] = await ethers.getSigners();
    
    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 1000000000000000);
    

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy(rewarder_address.address);
    const database_address = await database.deployed();


    const created = await database_address.connect(patient).createEMRStorage();

    const storageFactory = await ethers.getContractFactory("EMRStorageContract");
    const storageAddress = await database_address.connect(patient).getEMRStorageContract();
    const storageContract = await storageFactory.attach(storageAddress);



    await storageContract.connect(patient).addRecord("test","test",100,101,"test","test");
    patient_balance = await heracoin.balanceOf(patient.getAddress());
    contract_balance = await heracoin.balanceOf(rewarder_address.address);

    expect(patient_balance).to.equal(100000000000000);
    expect(contract_balance).to.equal(900000000000000);

  });


  it("Should not allow one patient to access another patient's EMR Storage Contract", async function () {
    const [owner, patient1, patient2] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 1000000000000000);
    

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy(rewarder_address.address);
    const database_address = await database.deployed();

    await database_address.connect(patient1).createEMRStorage();
    await database_address.connect(patient2).createEMRStorage();

    const storageFactory = await ethers.getContractFactory("EMRStorageContract");
    const storageAddress = await database_address.connect(patient1).getEMRStorageContract();
    const storageContract = await storageFactory.attach(storageAddress);



    await expect(storageContract.connect(patient2).addRecord("test","test",100,101,"test","test")).to.be.reverted;

  });


  it("Should allow a  patient to remove a Record from the EMR Storage Contract", async function () {
    const [owner, patient] = await ethers.getSigners();

    const HeraCoin = await ethers.getContractFactory("HeraCoin");
    const heracoin = await HeraCoin.deploy();
    const heracoin_token = heracoin.deployed();

    const rewarder = await ethers.getContractFactory("HeraCoinRewarder");
    const rewarder_contract = await rewarder.deploy((await heracoin_token).address);
    const rewarder_address = await rewarder_contract.deployed();

    await heracoin.transfer(rewarder_address.address, 1000000000000000);
    

    const EMRDatabase = await ethers.getContractFactory("EMRContractDatabase");
    const database = await EMRDatabase.deploy(rewarder_address.address);
    const database_address = await database.deployed();

    await database_address.connect(patient).createEMRStorage();

    const storageFactory = await ethers.getContractFactory("EMRStorageContract");
    const storageAddress = await database_address.connect(patient).getEMRStorageContract();
    const storageContract = await storageFactory.attach(storageAddress);

    await storageContract.connect(patient).addRecord("test","test",100,101,"test","test");
    await storageContract.connect(patient).addRecord("test2","test2",102,103,"test2","test2");

    await storageContract.connect(patient).voidEMR(0);

    console.log(await storageContract.connect(patient).getEMR(1));
    console.log(await storageContract.connect(patient).getEMRIDs());
  });

});
