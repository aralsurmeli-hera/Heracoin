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

    //An array of all EMRs
    
    //Create index mapping for EMRs to IDs
    mapping(int => EMR) private idsToEMRs;
    
    //Creates a mapping of patients to the indexes of their EMRs in the emrDatabase
    mapping (address => int[]) private ownersToEMRs;
    
    //Creates a mapping of addresses to the indexes of EMRs in the ermDatabase
    mapping (address => int[]) private accessorsToEMRs;
    
    //Creates a mapping of IPFS hashes to EMRs
    mapping (string => EMR) private hashesToEMRS;
    
    
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
        bytes32 ifps_hash;
    }

    //Creates an 
    function createEMR(bytes32 _record_type, bytes32 _record_status, uint256 _record_date, bytes32 _ifps_hash) public returns(bool){
        EMR emr = new EMR();
        emr.id = emrDatabase.length;
        emr.owner = msg.sender;
        emr.record_status = _record_status;
        emr.record_date = _record_date;
        emr.record_type = _record_type;
        emr.ifps_hash = _ifps_hash;
        
        //Adds the EMR to the Database
        emrDatabase.push(emr);
        
        //Maps the new EMR to the Patient Address
        ownersToEMRs[msg.sender].push(emr.id);
        
        //Emits the creation event to the blockchain
        emit EMRCreated(msg.sender, emr.id);
        
        //Rewards the patient for creating an EMR
        sendRewardForEmrCreation(msg.sender);s
    }

    function getOwnedEMR(int id) public returns(EMR) {
        return emrDatabase[id];
    }
    
    function getOwnedEMRsArray(address patient) public returns(EMR[]){
        return ownersToEMRs[patient];
    }
    
    function getEMRHash(EMR emr) public isEMROwner(msg.sender,emr){
        return emr.ifps_hash;
    }
    
    function getEMR(string memory hash) public view returns(EMR memory){
      return hashToEMR[hash];
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
