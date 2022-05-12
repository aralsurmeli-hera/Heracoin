// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./EMRContractDatabase.sol";

//Defines an EMR as a Smart Contract that is Ownable
contract EMRContract is Ownable {

    //EMR Contract Database
    EMRContractDatabase private EMRdatabase;

    //EMR Components
    address public patient;
    string record_type;
    string record_status;
    uint256 record_date;
    uint256 publish_date;
    string ipfs_image_hash;
    string ipfs_data_hash;

    //Mapping of Accessors to approval
    mapping(address => bool) approvedAccessors;

    //Constructor that contains the rewarder contract
    constructor(
        string memory _record_type,
        string memory _record_status,
        uint256 _record_date,
        string memory _ipfs_image_hash,
        string memory _ipfs_data_hash
    ) {
        patient = msg.sender;
        record_status = _record_status;
        record_date = _record_date;
        publish_date = block.timestamp;
        record_type = _record_type;
        ipfs_image_hash = _ipfs_image_hash;
        ipfs_data_hash = _ipfs_data_hash;
    }

    //Returns a tuple of the image and data hash on IPFS (Only EMR Owner)
    function getEMRHashes() view
        public
        onlyOwner
        returns (string memory, string memory)
    {
        return (ipfs_image_hash, ipfs_data_hash);
    }

    function getRecordType() public view onlyOwner returns (string memory) {
        return record_type;
    }

    function getRecordStatus() public view onlyOwner returns (string memory) {
        return record_status;
    }

    function getImageIPFSHash() public view onlyOwner returns (string memory) {
        return ipfs_image_hash;
    }

    function getDataIPFSHash() public view onlyOwner returns (string memory) {
        return ipfs_data_hash;
    }

    function getRecordDate() public view onlyOwner returns (uint256) {
        return record_date;
    }

    function getPublishDate() public view onlyOwner returns (uint256) {
        return publish_date;
    }
}
