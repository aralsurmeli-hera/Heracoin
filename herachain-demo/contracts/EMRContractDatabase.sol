// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./HeraCoinRewarder.sol";
import "./EMRStorageContract.sol";

contract EMRContractDatabase {
    //Reward Contract
    HeraCoinRewarder private rewarder;

    //Mapping of a patient's address to the integer IDs of their EMRContracts
    mapping(address => address) public ownersToEMRStorage;

    event EMRCreated(address patient, uint256 record_id);
    event SentRewardTokens(
        uint256 amount,
        address fromAccount,
        address toAccount,
        uint256 totalBalance
    );

    constructor(HeraCoinRewarder _rewarder) {
        rewarder = _rewarder;
    }

    function createEMRStorage() public returns (bool) {
        //The database can build the EMRStorageContract
        if (ownersToEMRStorage[msg.sender] != address(0x0)) {
            revert("An EMRStorageContract already exists for this address");
        }

        EMRStorageContract new_emr_storage = new EMRStorageContract(this);

        //Then transfer its ownership to the patient
        new_emr_storage.transferOwnership(msg.sender);

        //Maps the new EMRStorage to the Patient Address
        ownersToEMRStorage[msg.sender] = address(new_emr_storage);

        //Rewards the patient for creating an EMR using the Rewarder contract
        return true;
    }

    function createEMRStorageInternal(address add) internal returns (bool) {
        //The database can build the EMRStorageContract
        if (ownersToEMRStorage[add] != address(0x0)) {
            revert("An EMRStorageContract already exists for this address");
        }

        EMRStorageContract new_emr_storage = new EMRStorageContract(this);

        //Then transfer its ownership to the patient
        new_emr_storage.transferOwnership(add);

        //Maps the new EMRStorage to the Patient Address
        ownersToEMRStorage[add] = address(new_emr_storage);

        //Rewards the patient for creating an EMR using the Rewarder contract
        return true;
    }

    function sendRewardForEmrCreation(address patient) public {
        rewarder.sendRewardForEmrCreation(payable(patient));
    }

    function createEMR(
        string memory _record_type,
        string memory _record_status,
        uint256 _record_date,
        string memory _ipfs_image_hash,
        string memory _ipfs_data_hash
    ) public returns (bool) {
        //Check if an address exists for an EMR Storage contract for that patient
        if (ownersToEMRStorage[msg.sender] == address(0x0)) {
            createEMRStorageInternal(msg.sender);
        }

        //Then create a new record struct in the newly created contract
        EMRStorageContract storageContract = EMRStorageContract(
            ownersToEMRStorage[msg.sender]
        );
        storageContract.addRecordFromDatabase(
            _record_type,
            _record_status,
            _record_date,
            _ipfs_image_hash,
            _ipfs_data_hash
        );

        return true;
    }

    function getEMRStorageContract() public view returns (address) {
        return ownersToEMRStorage[msg.sender];
    }
}
