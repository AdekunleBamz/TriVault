// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ITriVaultCore.sol";

/**
 * @title SealVault
 * @dev Manages the collection of seals. Users pay a fee to collect each of 5 unique seals.
 *      Seals are non-transferable achievements recorded on-chain.
 */
contract SealVault {
    // ============ Constants ============
    
    uint256 public constant SEAL_FEE = 0.00001 ether;
    uint8 public constant TOTAL_SEALS = 5;
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    
    // Seal types
    bytes32 public constant SEAL_STABILITY = keccak256("STABILITY");
    bytes32 public constant SEAL_DIAMOND = keccak256("DIAMOND");
    bytes32 public constant SEAL_BRIDGE = keccak256("BRIDGE");
    bytes32 public constant SEAL_GUARDIAN = keccak256("GUARDIAN");
    bytes32 public constant SEAL_LEGEND = keccak256("LEGEND");
    
    // Action type for core contract
    bytes32 public constant ACTION_SEAL_COLLECTED = keccak256("SEAL_COLLECTED");
    
    // Seal data
    struct SealInfo {
        string name;
        string description;
        string emoji;
        bool active;
        uint256 totalCollected;
    }
    
    // Storage
    mapping(uint8 => SealInfo) public sealInfo;
    mapping(address => mapping(uint8 => bool)) public userSeals;
    mapping(address => mapping(uint8 => uint256)) public sealCollectionTime;
    mapping(address => uint256) public userSealCount;
    
    uint256 public totalSealsCollected;
    uint256 public totalFeesCollected;
    
    // ============ Events ============
    
    event SealCollected(
        address indexed user,
        uint8 indexed sealType,
        string sealName,
        uint256 timestamp
    );
    event AllSealsCollected(address indexed user, uint256 timestamp);
    event SealInfoUpdated(uint8 indexed sealType, string name, string description);
    event FeesWithdrawn(address indexed to, uint256 amount);
    
    // ============ Errors ============
    
    error InsufficientFee();
    error InvalidSealType();
    error SealAlreadyCollected();
    error SealNotActive();
    error OnlyCreator();
    error WithdrawFailed();
    
    // ============ Modifiers ============
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _core, address _creator) {
        core = ITriVaultCore(_core);
        creator = _creator;
        
        // Initialize seal info
        sealInfo[1] = SealInfo({
            name: "Stability Seal",
            description: "The seal of unwavering stability",
            emoji: unicode"💵",
            active: true,
            totalCollected: 0
        });
        
        sealInfo[2] = SealInfo({
            name: "Diamond Seal",
            description: "The precious diamond seal",
            emoji: unicode"💎",
            active: true,
            totalCollected: 0
        });
        
        sealInfo[3] = SealInfo({
            name: "Bridge Seal",
            description: "The seal of connection",
            emoji: unicode"🌉",
            active: true,
            totalCollected: 0
        });
        
        sealInfo[4] = SealInfo({
            name: "Guardian Seal",
            description: "The protective guardian seal",
            emoji: unicode"🛡️",
            active: true,
            totalCollected: 0
        });
        
        sealInfo[5] = SealInfo({
            name: "Legend Seal",
            description: "The legendary achievement seal",
            emoji: unicode"🏆",
            active: true,
            totalCollected: 0
        });
    }
    
    // ============ Main Functions ============
    
    /**
     * @dev Collect a seal by paying the fee
     * @param sealType The type of seal to collect (1-5)
     */
    function collectSeal(uint8 sealType) external payable {
        // Validate
        if (msg.value < SEAL_FEE) revert InsufficientFee();
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        if (!sealInfo[sealType].active) revert SealNotActive();
        if (userSeals[msg.sender][sealType]) revert SealAlreadyCollected();
        
        // Record seal collection
        userSeals[msg.sender][sealType] = true;
        sealCollectionTime[msg.sender][sealType] = block.timestamp;
        userSealCount[msg.sender]++;
        sealInfo[sealType].totalCollected++;
        totalSealsCollected++;
        totalFeesCollected += msg.value;
        
        emit SealCollected(msg.sender, sealType, sealInfo[sealType].name, block.timestamp);
        
        // Notify core contract
        core.recordInteraction(msg.sender, ACTION_SEAL_COLLECTED);
        
        // Forward fees to core for distribution
        core.distributeFees{value: msg.value}();
        
        // Check if user has all seals
        if (userSealCount[msg.sender] == TOTAL_SEALS) {
            emit AllSealsCollected(msg.sender, block.timestamp);
        }
    }
    
    /**
     * @dev Collect multiple seals at once
     * @param sealTypes Array of seal types to collect
     */
    function collectMultipleSeals(uint8[] calldata sealTypes) external payable {
        uint256 requiredFee = sealTypes.length * SEAL_FEE;
        if (msg.value < requiredFee) revert InsufficientFee();
        
        for (uint256 i = 0; i < sealTypes.length; i++) {
            uint8 sealType = sealTypes[i];
            
            if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
            if (!sealInfo[sealType].active) revert SealNotActive();
            if (userSeals[msg.sender][sealType]) revert SealAlreadyCollected();
            
            userSeals[msg.sender][sealType] = true;
            sealCollectionTime[msg.sender][sealType] = block.timestamp;
            userSealCount[msg.sender]++;
            sealInfo[sealType].totalCollected++;
            totalSealsCollected++;
            
            emit SealCollected(msg.sender, sealType, sealInfo[sealType].name, block.timestamp);
            core.recordInteraction(msg.sender, ACTION_SEAL_COLLECTED);
        }
        
        totalFeesCollected += msg.value;
        core.distributeFees{value: msg.value}();
        
        if (userSealCount[msg.sender] == TOTAL_SEALS) {
            emit AllSealsCollected(msg.sender, block.timestamp);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get all seals for a user
     */
    function getUserSeals(address user) external view returns (bool[5] memory) {
        return [
            userSeals[user][1],
            userSeals[user][2],
            userSeals[user][3],
            userSeals[user][4],
            userSeals[user][5]
        ];
    }
    
    /**
     * @dev Get detailed seal status for a user
     */
    function getUserSealsDetailed(address user) external view returns (
        bool[5] memory collected,
        uint256[5] memory collectionTimes
    ) {
        for (uint8 i = 1; i <= TOTAL_SEALS; i++) {
            collected[i-1] = userSeals[user][i];
            collectionTimes[i-1] = sealCollectionTime[user][i];
        }
    }
    
    /**
     * @dev Check if user has all seals
     */
    function hasAllSeals(address user) external view returns (bool) {
        return userSealCount[user] == TOTAL_SEALS;
    }
    
    /**
     * @dev Get number of seals collected by user
     */
    function getSealCount(address user) external view returns (uint256) {
        return userSealCount[user];
    }
    
    /**
     * @dev Get total seals collected across all users
     */
    function getTotalSealsCollected() external view returns (uint256) {
        return totalSealsCollected;
    }
    
    /**
     * @dev Get info for a specific seal type
     */
    function getSealInfo(uint8 sealType) external view returns (SealInfo memory) {
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        return sealInfo[sealType];
    }
    
    /**
     * @dev Get all seal info
     */
    function getAllSealInfo() external view returns (SealInfo[5] memory) {
        SealInfo[5] memory allInfo;
        for (uint8 i = 0; i < TOTAL_SEALS; i++) {
            allInfo[i] = sealInfo[i + 1];
        }
        return allInfo;
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalSealsCollected,
        uint256 _totalFeesCollected,
        uint256[5] memory sealCounts
    ) {
        for (uint8 i = 0; i < TOTAL_SEALS; i++) {
            sealCounts[i] = sealInfo[i + 1].totalCollected;
        }
        return (totalSealsCollected, totalFeesCollected, sealCounts);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update seal info
     */
    function updateSealInfo(
        uint8 sealType,
        string calldata name,
        string calldata description
    ) external onlyCreator {
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        sealInfo[sealType].name = name;
        sealInfo[sealType].description = description;
        emit SealInfoUpdated(sealType, name, description);
    }
    
    /**
     * @dev Toggle seal active status
     */
    function setSealActive(uint8 sealType, bool active) external onlyCreator {
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        sealInfo[sealType].active = active;
    }
    
    /**
     * @dev Withdraw any stuck funds
     */
    function withdrawFees() external onlyCreator {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawFailed();
        
        (bool success, ) = creator.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit FeesWithdrawn(creator, balance);
    }
    
    // ============ Receive ETH ============
    
    receive() external payable {}
}
