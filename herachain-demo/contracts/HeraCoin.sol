// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HeraCoin is ERC20 {
    constructor() public ERC20("HERACoin", "HERA") {
        _mint(msg.sender, 1000000 * (10**uint256(decimals())));
    }
}
