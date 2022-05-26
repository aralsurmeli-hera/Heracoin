// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AccountAdministrator is Ownable {
    mapping(address => bytes32) userAddresses;

    //Create a mapping of the Blockchain address to the encrypted userID from Hera App
    function mapNewAddress(address a, bytes32 _userhash) public onlyOwner {
        userAddresses[a] = _userhash;
    }

    function getUserFromAddress(address a) public onlyOwner returns (bytes32) {
        return userAddresses[a];
    }

    function removeUserFromAddress(address a) public onlyOwner {
        delete userAddresses[a];
    }
}
