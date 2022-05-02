// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EMRContractDatabase {
    //Mapping of a patient's address to the integer IDs of their EMRContracts
    mapping(address => uint256[]) public ownersToEMRs;

    //Mapping the IDs of a contract to the address of the EMR
    mapping(uint256 => address) private idsToEMRs;

    //Mapping the IDs of a contract to the address of the owner
    mapping(uint256 => address) private idsToOwners;

    using Counters for Counters.Counter;
    Counters.Counter private _EMRIds;

    function addEMR(address owner_address, address emr_address)
        public
        returns (bool)
    {
        _EMRIds.increment();
        uint256 newId = _EMRIds.current();
        idsToEMRs[newId] = emr_address;
        ownersToEMRs[owner_address].push(newId);
        return true;
    }

    function getEMRById(uint256 _id) public view returns (address) {
        require(msg.sender == idsToOwners[_id], "Only owner can call this.");
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
