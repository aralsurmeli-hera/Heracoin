// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./HeraCoin.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/access/AccessControl.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/utils/Counters.sol";



contract EMRDatabase is Ownable, AccessControl {
    
    //Instantiates the HeraCoin Contract
    HeraCoin heracoin;
    
    //Initializes the owner of this EMRDatabase contract
    address public owner;

    //Initializes the reward amount
    uint256 public reward_ammount;

    constructor(address memory heracoin_address) public {
        heracoin = new HeraCoin(heracoin_address);
        owner = msg.sender;
    }
    
    //Create a counter for EMR Ids
    using Counters for Counters.Counter;
    Counters.Counter private _EMRIds;
    
    //Create index mapping for EMRs to IDs
    mapping(uint => EMR) private idsToEMRs;
    
    //Creates a mapping of patients to the indexes of their EMRs in the emrDatabase
    mapping (address => uint[]) private ownersToEMRs;
    
    //Creates a mapping of addresses to the indexes of EMRs in the ermDatabase
    mapping (address => uint[]) private accessorsToEMRs;
    
    //Creates a mapping of IPFS Image hashes to EMRs
    mapping (string => EMR) private imageHashesToEMRS;
    
    //Creates a mapping of IPFS Data hashes to EMRs
    mapping (string => EMR) private dataHashesToEMRS;
    
    
    
    //Creates an event for a new record being created
    event EMRCreated(address patient, int record_id);
    event SentRewardTokens(uint256 amount, address fromAccount, uint256 totalBalance);
    event EMRAccessed(address add);
    

    //Creates Modifier that checks for the owner of the EMR
    modifier isEMROwner(address calldata add, EMR calldata emr){
        require( emr.owner == add);
        _;
    }
    
    //Creates the EMR Struct
    struct EMR {
        uint256 id;
        address owner;
        bytes32 record_type;
        bytes32 record_status;
        uint256 record_date;
        uint256 publish_date;
        bytes32 ipfs_image_hash;
        bytes32 ipfs_data_hash;
    }

    //Creates an 
    function createEMR(bytes32 _record_type, bytes32 _record_status, uint256 _record_date, bytes32 _ipfs_image_hash, bytes32 _ipfs_data_hash) public returns(bool){
        _EMRIds.increment();
        uint newId = _EMRIds.current();
        
        //Create EMR
        EMR storage emr = idToEMR[newId];
        
        //Add the provided attributes to the EMR
        emr.id = newId;
        emr.owner = msg.sender;
        emr.record_status = _record_status;
        emr.record_date = _record_date;
        emr.record_type = _record_type;
        emr.ifps_image_hash = _ifps_image_hash;
        emr.ifps_data_hash = _ifps_image_hash;

        //Maps the new EMR to the Patient Address
        ownersToEMRs[msg.sender].push(emr.id);
        
        //Emits the creation event to the blockchain
        emit EMRCreated(msg.sender, emr.id);
        
        //Rewards the patient for creating an EMR
        sendRewardForEmrCreation(msg.sender);
    }

    function getOwnedEMR(uint id) public returns(EMR memory) {
        return idsToEMRs[id];
    }
    
    function getOwnedEMRsArray(address patient) public returns(EMR[] memory){
        require(
            msg.sender == patient,
            "Only owner can call this."
            );
        return ownersToEMRs[patient];
    }
    
    function getEMRHash(EMR emr) public isEMROwner(msg.sender,emr){
        return emr.ifps_hash;
    }
    
    function getEMR(string memory hash) public view returns(EMR memory){
        EMR returnedEMR = hashToEMR[hash];
        require(
            msg.sender == returnedEMR.owner,
            "Only owner can call this."
            );
        return returnedEMR;     
    }
    
    
    
    //Functions for reward payments
    
    function setRewardAmount(uint256 reward) public isOwner(msg.sender) returns (bool){
        reward_ammount = reward;
        return true;
    } 
    
    function sendRewardForEmrCreation(address patient) private { 
        heracoin.transferFrom(address(this), patient, this.reward_amount);
        emit SentRewardTokens(this.reward_amount, address(this), patient, heracoin.balanceOf(address(this));
    }
}
