// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./EMRContractDatabase.sol";

struct EMR {
    string record_type;
    string record_status;
    uint256 record_date;
    uint256 publish_date;
    string ipfs_image_hash;
    string ipfs_data_hash;
}

contract EMRStorageContract is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private emrIdCounter;

    event EMRCreated(address patient, uint256 record_id);

    event EMRAccessed(address accessor, uint256 record_id);

    mapping(uint256 => EMR) private emrs;
    uint256[] private emrIds;

    EMRContractDatabase database;

    constructor(EMRContractDatabase _database) {
        database=_database;
    }

    function addRecord(
        string memory _record_type,
        string memory _record_status,
        uint256  _record_date,
        uint256  _publish_date,
        string memory _ipfs_image_hash,
        string memory _ipfs_data_hash
    ) public onlyOwner {
        uint256 _recordId = emrIdCounter.current();
        emrs[_recordId] = EMR(
            _record_type,
            _record_status,
            _record_date,
            _publish_date,
            _ipfs_image_hash,
            _ipfs_data_hash

        );
        emrIdCounter.increment();
        emrIds.push(_recordId);
        database.sendRewardForEmrCreation(msg.sender);

        emit EMRCreated(owner(), _recordId);
    }

    function voidEMR(uint256 _emrID) public onlyOwner {
        for (uint256 i = 0; i < emrIds.length; i++) {
            if (emrIds[i] == _emrID) {
                delete emrIds[i];
                emrIds[i] = emrIds[emrIds.length - 1];
                emrIds.pop();
                break;
            }
        }    
    }

    function getEMR(uint256 _emrID) public view onlyOwner returns(EMR memory) {
        return emrs[_emrID];
    }

    function getEMRIDs() public view onlyOwner returns(uint256[] memory){
        return emrIds;
    }

}
