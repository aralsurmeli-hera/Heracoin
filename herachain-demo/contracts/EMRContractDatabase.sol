// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./HeraCoinRewarder.sol";
import "./EMRContract.sol";


contract EMRContractDatabase {
    //Reward Contract
    HeraCoinRewarder private rewarder;


    //Mapping of a patient's address to the integer IDs of their EMRContracts
    mapping(address => uint256[]) public ownersToEMRs;

    //Mapping the IDs of a contract to the address of the EMR
    mapping(uint256 => EMRContract) private idsToEMRs;

    //Mapping the IDs of a contract to the address of the owner
    mapping(uint256 => address) private idsToOwners;

    using Counters for Counters.Counter;
    Counters.Counter private _EMRIds;

    event EMRCreated(address patient, uint256 record_id);
    event SentRewardTokens(
        uint256 amount,
        address fromAccount,
        address toAccount,
        uint256 totalBalance
    );
    event EMRAccessed(address accessor, uint256 record_id);

    constructor(HeraCoinRewarder _rewarder){
        rewarder = _rewarder;
    }


    function createEMR(string memory _record_type,
        string memory _record_status,
        uint256 _record_date,
        string memory _ipfs_image_hash,
        string memory _ipfs_data_hash
        )
        public
        returns (bool)
    {
        //The database can build the EMRContract
        EMRContract new_emr = new EMRContract(_record_type, _record_status, _record_date, _ipfs_image_hash, _ipfs_data_hash);
        
        //Then transfer its ownership to the patient
        new_emr.transferOwnership(msg.sender);

        uint256 newId = _EMRIds.current();
        _EMRIds.increment();

        idsToEMRs[newId] = new_emr;

        //Maps the new EMR to the Patient Address
        ownersToEMRs[msg.sender].push(newId);

        //Emits the creation event to the blockchain
        emit EMRCreated(msg.sender, newId);

        //Rewards the patient for creating an EMR using the Rewarder contract
        rewarder.sendRewardForEmrCreation(payable(msg.sender));
        return true;
    }

    function getEMRById(uint256 _id) public view returns (EMRContract) {
        return idsToEMRs[_id];
    }

    //Returns an number of owned EMRs for the address that calls the function
    function getNumberOwnedEMRs() public view returns (uint256 count) {
        return ownersToEMRs[msg.sender].length;
    }

    //Returns an array of the IDs of owned EMRs for the address that calls the function
    function getOwnedEMRsArray() public view returns (uint256[] memory) {
        return ownersToEMRs[msg.sender];
    }
}
