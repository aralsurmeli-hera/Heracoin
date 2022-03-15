// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./HeraCoin.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/access/AccessControl.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/access/Ownable.sol";


contract EMRDatabase is Ownable, AccessControl {
    
    //Instantiates the HeraCoin Contract
    HeraCoin heracoin;
    
    //Initializes the owner of this EMRDatabase
    address owner;

    //Initializes the reward amount
    uint256 public reward_ammount;

    constructor(address heracoin_address) public {
        heracoin = new HeraCoin(heracoin_address);
        owner = msg.sender;
    }

    //Creates an event for a new record being created
    event recordCreated(address patient, int record_id);
    
    event sentRewardTokens(uint256 amount, address fromAccount, uint256 totalBalance);

    //Creates Modifier that checks for the owner of the EMR
    modifier isEMROwner(address calldata add, EMR calldata emr){
        require( emr.owner == add);
        _;
    }

    //Creates a mapping of patients to the IDs of their EMRs
    mapping (address => int[]) accountsToEMRs;

    //An array of all EMRs
    EMR[] emrDatabase; 

    struct EMR {
        uint256 id;
        address owner;
        bytes32 record_type;
        bytes32 record_status;
        uint256 record_date;
        uint256 publish_date;
        bytes32 ifps_hash;
    }

    function setRewardAmount(uint256 reward) public isOwner(msg.sender) returns (bool){
        reward_ammount = reward;
        return true;
    } 

    function createEMR(bytes32 _record_type, bytes32 _record_status, uint256 _record_date, bytes32 _ifps_hash) public returns(bool){
        EMR emr = new EMR();
        emr.id = emrDatabase.length;
        emr.owner = msg.sender;
        emr.record_status = _record_status;
        emr.record_date = _record_date;
        emr.record_type = _record_type;
        emr.ifps_hash = _ifps_hash;
    }

    function getEMR(int id) public returns(EMR) {
        require(emrDatabase[id].owner == msg.sender);
        return emrDatabase[id];
    }

    function getEMRHash(EMR emr) public isEMROwner(msg.sender,emr){
        return emr.ifps_hash;
    }

     function getEmrJSON(uint256 vaccineID) override(ERC721) public view returns (string memory) {
        string memory json = Base64.encode(
            bytes(string(
                abi.encodePacked(
                    //Fill in FHIR JSON Format to return for Vaccine here
                )
            ))
        );
        return string(abi.encodePacked('data:application/json;base64,', json));
    }    
}
