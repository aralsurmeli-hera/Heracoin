// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./HeraCoinRewarder.sol";

contract EMRDatabase {
    //Instantiates the HeraCoinRewarder Contract that will be paying out rewards
    HeraCoinRewarder private rewarder;

    //Events
    event EMRCreated(address patient, uint256 emr);
    event EMRAccessed(address accesor, uint256 emr);
    event SentRewardTokens(
        uint256 amount,
        address fromAccount,
        address toAccount,
        uint256 totalBalance
    );


    //Constructor requires the address of the rewarder contract
    constructor(HeraCoinRewarder _rewarder) {
        rewarder = _rewarder;
    }

    //Create a counter for EMR Ids that we will use to assign an ID to a new EMR
    using Counters for Counters.Counter;
    Counters.Counter private _EMRIds;

    //Create mapping for EMRs to IDs
    mapping(uint256 => EMR) private idsToEMRs;

    //Creates a mapping of patients addresses to an array of the indexes of their EMRs in the emrDatabase
    mapping(address => uint256[]) private ownersToEMRs;

    //Creates a mapping of accessor addresses to an array of the indexes of their EMRs in the emrDatabase
    mapping(address => uint256[]) private accessorsToEMRs;

    // //Creates a mapping of IPFS Image hashes to EMRs
    // mapping(string => EMR) private imageHashesToEMRS;

    // //Creates a mapping of IPFS Data hashes to EMRs
    // mapping(string => EMR) private dataHashesToEMRS;

    //Creates Modifier that checks for the owner of the EMR (Functions with this modifier will only execute if the owner of the EMR is calling them)
    modifier isEMROwner(address add, EMR calldata emr) {
        require(emr.owner == add);
        _;
    }

    //Creates the EMR Struct
    struct EMR {
        uint256 id;
        address owner;
        string record_type;
        string record_status;
        uint256 record_date;
        uint256 publish_date;
        string ipfs_image_hash;
        string ipfs_data_hash;
    }

    //Creates an EMR object when passed in Record Type, Status, Date, IPFS Hashes
    function createEMR(
        string memory _record_type,
        string memory _record_status,
        uint256 _record_date,
        string memory _ipfs_image_hash,
        string memory _ipfs_data_hash
    ) public returns (bool) {
        _EMRIds.increment();
        uint256 newId = _EMRIds.current();

        //Create EMR struct and add to the IDs to EMRs mapping
        EMR storage emr = idsToEMRs[newId];

        //Add the provided attributes to the EMR
        emr.id = newId;
        emr.owner = msg.sender;
        emr.record_status = _record_status;
        emr.record_date = _record_date;
        emr.publish_date = block.timestamp;
        emr.record_type = _record_type;
        emr.ipfs_image_hash = _ipfs_image_hash;
        emr.ipfs_data_hash = _ipfs_data_hash;

        //Maps the new EMR to the Patient Address
        ownersToEMRs[msg.sender].push(emr.id);

        //Emits the creation event to the blockchain
        emit EMRCreated(msg.sender, emr.id);

        //Rewards the patient for creating an EMR using the Rewarder contract
        rewarder.sendRewardForEmrCreation(msg.sender);

        return true;
    }

    //Returns an number of owned EMRs for the address that calls the function
    function getNumberOwnedEMRs() public view returns (uint256 count) {
        return ownersToEMRs[msg.sender].length;
    }

    //Returns an array of the IDs of owned EMRs for the address that calls the function
    function getOwnedEMRsArray() public view returns (uint256[] memory) {
        return ownersToEMRs[msg.sender];
    }

    //Returns a the EMR struct given the ID (requires the owner of the EMR calls this, or will revert)
    function getEMRById(uint256 _id) public view returns (EMR memory) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR;
    }

    //Returns a tuple of the image and data hash on IPFS (Only EMR Owner)
    function getEMRHashes(EMR calldata emr)
        public view
        isEMROwner(msg.sender, emr)
        returns (string memory, string memory)
    {
        return (emr.ipfs_image_hash, emr.ipfs_data_hash);
    }

    //Returns the record type for EMR given ID
    function getRecordType(uint256 _id) public view returns (string memory) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR.record_type;
    }

    //Returns the record status for EMR given ID
    function getRecordStatus(uint256 _id) public view returns (string memory) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR.record_status;
    }

    //Returns the image hash for EMR given ID
    function getImageIPFSHash(uint256 _id) public view returns (string memory) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR.ipfs_image_hash;
    }

    //Returns the data hash for EMR given ID
    function getDataIPFSHash(uint256 _id) public view returns (string memory) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR.ipfs_data_hash;
    }

    //Returns the record date for EMR given ID
    function getRecordDate(uint256 _id) public view returns (uint256) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR.record_date;
    }

    //Returns the publish date for EMR given ID
    function getPublishDate(uint256 _id) public view returns (uint256) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR.publish_date;
    }
}
