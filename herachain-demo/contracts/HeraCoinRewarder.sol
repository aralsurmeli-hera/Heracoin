// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HeraCoinRewarder is Ownable {
    IERC20 heracoin;
    uint256 public reward_amount = 10;

    event SentRewardTokens(
        uint256 amount,
        address fromAccount,
        address toAccount,
        uint256 totalBalance
    );

    constructor(IERC20 _heracoin) {
        heracoin = _heracoin;
    }

    function getHeraCoinBalance() public view returns (uint256) {
        return heracoin.balanceOf(address(this));
    }

    //Functions for reward payments

    function setRewardAmount(uint256 reward) public onlyOwner returns (bool) {
        reward_amount = reward;
        return true;
    }

    function getRewardAmount() public view returns (uint256) {
        return reward_amount;
    }

    function sendRewardForEmrCreation(address patient) public {
        heracoin.transfer(patient, reward_amount);
        emit SentRewardTokens(
            reward_amount,
            address(this),
            patient,
            heracoin.balanceOf(address(this))
        );
    }
}
