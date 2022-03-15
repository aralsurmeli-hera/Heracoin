// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/access/Ownable.sol";

contract AccountAdministrator is Ownable{

    address owner;

    mapping(address => bytes32) userAddresses;

    //Create a mapping of the Blockchain address to the encrypted userID from Hera App
    function mapNewAddress(bytes32 _address, bytes32 _userhash) public onlyOwner{
        address a = _address;
        userAddresses[a] = _userhash;
    }

    function getUserFromAddress(address a) public onlyOwner returns(bytes32){
        return userAddresses[a];
    } 

}
