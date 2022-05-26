// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//Creates an ownable Rewarder Contract (ownable by Hera administrator wallet)
contract HeraCoinRewarder is Ownable {
    //the HeraCoin token contract
    IERC20 heracoin;

    //the default reward amount
    uint256 public reward_amount = 10;

    //On-chain event when a reward was sent
    event SentRewardTokens(
        uint256 amount,
        address fromAccount,
        address toAccount,
        uint256 totalBalance
    );

    //Constructor takes in the address of the HeraCoin token contract
    constructor(IERC20 _heracoin) {
        heracoin = _heracoin;
    }

    //Returns the HeraCoin balance of this contract
    function getHeraCoinBalance() public view returns (uint256) {
        return heracoin.balanceOf(address(this));
    }

    //Functions for reward payments

    //Allows the owner of the contract to adjust what the default reward amount is
    function setRewardAmount(uint256 reward) public onlyOwner returns (bool) {
        reward_amount = reward;
        return true;
    }

    //Returns the default reward amount
    function getRewardAmount() public view returns (uint256) {
        return reward_amount;
    }

    //Sends a defined address the default reward amount in HeraCoin (from this contract's balance) and emits the SentRewardTokens event to the blockchain
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
