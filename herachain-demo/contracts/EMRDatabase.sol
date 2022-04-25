// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EMRDatabase is Ownable, AccessControl {
    //Instantiates the HeraCoin Contract
    IERC20 private heracoin;

    //Initializes the reward amount
    uint256 public reward_amount;

    constructor(IERC20 _heracoin) {
        heracoin = _heracoin;
    }

    //Create a counter for EMR Ids
    using Counters for Counters.Counter;
    Counters.Counter private _EMRIds;

    //Create index mapping for EMRs to IDs
    mapping(uint256 => EMR) private idsToEMRs;

    //Creates a mapping of patients to the indexes of their EMRs in the emrDatabase
    mapping(address => uint256[]) private ownersToEMRs;

    //Creates a mapping of addresses to the indexes of EMRs in the ermDatabase
    mapping(address => uint256[]) private accessorsToEMRs;

    // //Creates a mapping of IPFS Image hashes to EMRs
    // mapping(string => EMR) private imageHashesToEMRS;

    // //Creates a mapping of IPFS Data hashes to EMRs
    // mapping(string => EMR) private dataHashesToEMRS;

    //Creates an event for a new record being created
    event EMRCreated(address patient, uint256 record_id);
    event SentRewardTokens(
        uint256 amount,
        address fromAccount,
        address toAccount,
        uint256 totalBalance
    );
    event EMRAccessed(address add);

    //Creates Modifier that checks for the owner of the EMR
    modifier isEMROwner(address add, EMR calldata emr) {
        require(emr.owner == add);
        _;
    }

    //Creates the EMR Struct
    struct EMR {
        uint256 id;
        address owner;
        string record_type;
        string record_status;
        uint256 record_date;
        uint256 publish_date;
        string ipfs_image_hash;
        string ipfs_data_hash;
    }

    //Creates an
    function createEMR(
        string memory _record_type,
        string memory _record_status,
        uint256 _record_date,
        string memory _ipfs_image_hash,
        string memory _ipfs_data_hash
    ) public returns (bool) {
        _EMRIds.increment();
        uint256 newId = _EMRIds.current();

        //Create EMR
        EMR storage emr = idsToEMRs[newId];

        //Add the provided attributes to the EMR
        emr.id = newId;
        emr.owner = msg.sender;
        emr.record_status = _record_status;
        emr.record_date = _record_date;
        emr.record_type = _record_type;
        emr.ipfs_image_hash = _ipfs_image_hash;
        emr.ipfs_data_hash = _ipfs_image_hash;

        //Maps the new EMR to the Patient Address
        ownersToEMRs[msg.sender].push(emr.id);

        //Emits the creation event to the blockchain
        emit EMRCreated(msg.sender, emr.id);

        //Rewards the patient for creating an EMR
        sendRewardForEmrCreation(msg.sender);
    }

    function getOwnedEMRsArray() public returns (uint256[] memory) {
        return ownersToEMRs[msg.sender];
    }

    function getEMRHashes(EMR calldata emr)
        public
        isEMROwner(msg.sender, emr)
        returns (string memory, string memory)
    {
        return (emr.ipfs_image_hash, emr.ipfs_data_hash);
    }

    function getEMRById(uint256 _id) public view returns (EMR memory) {
        EMR memory returnedEMR = idsToEMRs[_id];
        require(msg.sender == returnedEMR.owner, "Only owner can call this.");
        return returnedEMR;
    }

    //Functions for reward payments

    function setRewardAmount(uint256 reward) public onlyOwner returns (bool) {
        reward_amount = reward;
        return true;
    }

    function sendRewardForEmrCreation(address patient) private {
        heracoin.transferFrom(address(this), patient, reward_amount);
        emit SentRewardTokens(
            reward_amount,
            address(this),
            patient,
            heracoin.balanceOf(address(this))
        );
    }
}
