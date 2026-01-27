// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SealVault v1.1
 * @dev Manages the collection of seals. Users pay a fee to collect each of 5 unique seals.
 * 
 * REMIX DEPLOYMENT GUIDE:
 * ========================
 * Order: Deploy SECOND (Contract #2)
 * 
 * Constructor Arguments:
 *   _core (address):    TriVaultCore address from Contract #1
 *   _creator (address): Your wallet address
 * 
 * Example: "0xTriVaultCoreAddress", "0xYourWalletAddress"
 * 
 * After deployment, save the address as SEAL_VAULT_ADDRESS
 */

// ============ Interface (Inlined for Remix) ============

interface ITriVaultCore {
    function recordInteraction(address user, bytes32 actionType) external;
    function isRegistered(address user) external view returns (bool);
}

// ============ Main Contract ============

contract SealVault {
    // ============ Constants ============
    
    uint256 public constant SEAL_FEE = 0.00001 ether;
    uint8 public constant TOTAL_SEALS = 5;
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    
    bytes32 public constant SEAL_STABILITY = keccak256("STABILITY");
    bytes32 public constant SEAL_DIAMOND = keccak256("DIAMOND");
    bytes32 public constant SEAL_BRIDGE = keccak256("BRIDGE");
    bytes32 public constant SEAL_GUARDIAN = keccak256("GUARDIAN");
    bytes32 public constant SEAL_LEGEND = keccak256("LEGEND");
    
    bytes32 public constant ACTION_SEAL_COLLECTED = keccak256("SEAL_COLLECTED");
    
    struct SealInfo {
        string name;
        string description;
        string emoji;
        bool active;
        uint256 totalCollected;
    }
    
    mapping(uint8 => SealInfo) public sealInfo;
    mapping(address => mapping(uint8 => bool)) public userSeals;
    mapping(address => mapping(uint8 => uint256)) public sealCollectionTime;
    mapping(address => uint256) public userSealCount;
    
    uint256 public totalSealsCollected;
    uint256 public totalFeesCollected;
    
    // ============ Events ============
    
    event SealCollected(address indexed user, uint8 indexed sealType, string sealName, uint256 timestamp);
    event AllSealsCollected(address indexed user, uint256 timestamp);
    event SealInfoUpdated(uint8 indexed sealType, string name, string description);
    event FeesWithdrawn(address indexed to, uint256 amount);
    
    // ============ Errors ============
    
    error InvalidSealType();
    error SealAlreadyCollected();
    error InsufficientFee();
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
            description: "The legendary seal of mastery",
            emoji: unicode"🌟",
            active: true,
            totalCollected: 0
        });
    }
    
    // ============ Main Functions ============
    
    function collectSeal(uint8 sealType) external payable {
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        if (!sealInfo[sealType].active) revert SealNotActive();
        if (userSeals[msg.sender][sealType]) revert SealAlreadyCollected();
        if (msg.value < SEAL_FEE) revert InsufficientFee();
        
        userSeals[msg.sender][sealType] = true;
        sealCollectionTime[msg.sender][sealType] = block.timestamp;
        userSealCount[msg.sender]++;
        sealInfo[sealType].totalCollected++;
        totalSealsCollected++;
        totalFeesCollected += msg.value;
        
        emit SealCollected(msg.sender, sealType, sealInfo[sealType].name, block.timestamp);
        
        core.recordInteraction(msg.sender, ACTION_SEAL_COLLECTED);
        
        if (userSealCount[msg.sender] == TOTAL_SEALS) {
            emit AllSealsCollected(msg.sender, block.timestamp);
        }
        
        // Forward fees to core
        (bool success, ) = address(core).call{value: msg.value}("");
        require(success, "Fee forward failed");
    }
    
    function collectMultipleSeals(uint8[] calldata sealTypes) external payable {
        uint256 totalFee = SEAL_FEE * sealTypes.length;
        if (msg.value < totalFee) revert InsufficientFee();
        
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
        
        if (userSealCount[msg.sender] == TOTAL_SEALS) {
            emit AllSealsCollected(msg.sender, block.timestamp);
        }
        
        (bool success, ) = address(core).call{value: msg.value}("");
        require(success, "Fee forward failed");
    }
    
    // ============ View Functions ============
    
    function getUserSeals(address user) external view returns (bool[5] memory seals) {
        for (uint8 i = 1; i <= TOTAL_SEALS; i++) {
            seals[i - 1] = userSeals[user][i];
        }
    }
    
    function hasAllSeals(address user) external view returns (bool) {
        return userSealCount[user] == TOTAL_SEALS;
    }
    
    function getSealCount(address user) external view returns (uint256) {
        return userSealCount[user];
    }
    
    function getStats() external view returns (
        uint256 _totalSealsCollected,
        uint256 _totalFeesCollected,
        uint256[5] memory sealCounts
    ) {
        for (uint8 i = 1; i <= TOTAL_SEALS; i++) {
            sealCounts[i - 1] = sealInfo[i].totalCollected;
        }
        return (totalSealsCollected, totalFeesCollected, sealCounts);
    }
    
    function getAllSealInfo() external view returns (
        string[5] memory names,
        string[5] memory descriptions,
        string[5] memory emojis,
        bool[5] memory actives,
        uint256[5] memory counts
    ) {
        for (uint8 i = 1; i <= TOTAL_SEALS; i++) {
            names[i - 1] = sealInfo[i].name;
            descriptions[i - 1] = sealInfo[i].description;
            emojis[i - 1] = sealInfo[i].emoji;
            actives[i - 1] = sealInfo[i].active;
            counts[i - 1] = sealInfo[i].totalCollected;
        }
    }
    
    // ============ Admin Functions ============
    
    function updateSealInfo(
        uint8 sealType,
        string calldata name,
        string calldata description,
        string calldata emoji
    ) external onlyCreator {
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        
        sealInfo[sealType].name = name;
        sealInfo[sealType].description = description;
        sealInfo[sealType].emoji = emoji;
        
        emit SealInfoUpdated(sealType, name, description);
    }
    
    function setSealActive(uint8 sealType, bool active) external onlyCreator {
        if (sealType < 1 || sealType > TOTAL_SEALS) revert InvalidSealType();
        sealInfo[sealType].active = active;
    }
    
    function withdrawFees() external onlyCreator {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawFailed();
        
        (bool success, ) = creator.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit FeesWithdrawn(creator, balance);
    }
    
    receive() external payable {}
}
