// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                  DEPLOY THIS FILE IN REMIX                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Contract: AchievementVault v1.2 (FIXED)                                  ║
 * ║                                                                           ║
 * ║  Constructor Arguments:                                                   ║
 * ║    _core:    0xd4c7d8CF7408B6d7165Ea668EdA277A9904262E0                   ║
 * ║    _creator: 0x7C98ab80D060cA57DD067712d0eD084A58f69c49                   ║
 * ║                                                                           ║
 * ║  After deployment:                                                        ║
 * ║    1. On TriVaultCore: setAchievementVault(NEW_ADDRESS)                   ║
 * ║    2. On TriVaultCore: setAuthorized(NEW_ADDRESS, true)                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// ============ Interface (Inlined for Remix) ============

interface ITriVaultCore {
    function recordInteraction(address user, bytes32 actionType) external;
    function isRegistered(address user) external view returns (bool);
    function userInteractionCount(address user) external view returns (uint256);
}

// ============ Main Contract ============

contract AchievementVault {
    // ============ Structs ============
    
    struct Achievement {
        bytes32 id;
        string name;
        string description;
        uint256 pointsRequired;
        uint256 sealsRequired;
        uint256 interactionsRequired;
        bool isActive;
        uint256 unlockedCount;
    }
    
    struct UserAchievementData {
        bool unlocked;
        uint256 unlockedAt;
        uint256 progress;
    }
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    
    bytes32[] public achievementIds;
    mapping(bytes32 => Achievement) public achievements;
    mapping(address => mapping(bytes32 => UserAchievementData)) public userAchievements;
    mapping(address => bytes32[]) public userUnlockedAchievements;
    mapping(address => uint256) public userTotalAchievements;
    
    uint256 public totalAchievements;
    uint256 public totalUnlocks;
    
    // Achievement IDs
    bytes32 public constant FIRST_SEAL = keccak256("FIRST_SEAL");
    bytes32 public constant ALL_SEALS = keccak256("ALL_SEALS");
    bytes32 public constant EARLY_ADOPTER = keccak256("EARLY_ADOPTER");
    bytes32 public constant DEDICATED = keccak256("DEDICATED");
    bytes32 public constant WHALE = keccak256("WHALE");
    bytes32 public constant SOCIAL = keccak256("SOCIAL");
    bytes32 public constant GOVERNOR = keccak256("GOVERNOR");
    
    // Action types for milestone checking
    bytes32 public constant ACTION_SEAL_COLLECTED = keccak256("SEAL_COLLECTED");
    bytes32 public constant ACTION_VOTE = keccak256("VOTE");
    bytes32 public constant ACTION_PROPOSAL = keccak256("PROPOSAL");
    
    // ============ Events ============
    
    event AchievementUnlocked(address indexed user, bytes32 indexed achievementId, uint256 timestamp);
    event AchievementCreated(bytes32 indexed achievementId, string name);
    event AchievementUpdated(bytes32 indexed achievementId);
    event ProgressUpdated(address indexed user, bytes32 indexed achievementId, uint256 progress);
    event UserRegisteredForAchievements(address indexed user);
    event MilestoneChecked(address indexed user, bytes32 actionType, uint256 count);
    
    // ============ Errors ============
    
    error OnlyAuthorized();
    error OnlyCreator();
    error AchievementNotFound();
    error AlreadyUnlocked();
    error RequirementsNotMet();
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        if (msg.sender != address(core) && msg.sender != creator) revert OnlyAuthorized();
        _;
    }
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _core, address _creator) {
        core = ITriVaultCore(_core);
        creator = _creator;
        _initializeDefaultAchievements();
    }
    
    function _initializeDefaultAchievements() internal {
        _createAchievement(FIRST_SEAL, "First Seal", "Collect your first seal", 0, 1, 0);
        _createAchievement(ALL_SEALS, "Seal Master", "Collect all 5 seals", 0, 5, 0);
        _createAchievement(EARLY_ADOPTER, "Early Adopter", "Join TriVault early", 0, 0, 1);
        _createAchievement(DEDICATED, "Dedicated", "Interact with TriVault 100 times", 0, 0, 100);
        _createAchievement(WHALE, "Whale", "Earn 10,000 points", 10000, 0, 0);
        _createAchievement(SOCIAL, "Social Butterfly", "Share TriVault with friends", 0, 0, 5);
        _createAchievement(GOVERNOR, "Governor", "Participate in governance", 0, 0, 1);
    }
    
    // ╔═══════════════════════════════════════════════════════════════════════╗
    // ║  CRITICAL: These two functions are called by TriVaultCore             ║
    // ╚═══════════════════════════════════════════════════════════════════════╝
    
    /**
     * @dev Called by TriVaultCore when a user registers
     */
    function onUserRegistered(address user) external onlyAuthorized {
        emit UserRegisteredForAchievements(user);
        
        // Award Early Adopter achievement to new users
        if (!userAchievements[user][EARLY_ADOPTER].unlocked) {
            _unlockAchievement(user, EARLY_ADOPTER);
        }
    }
    
    /**
     * @dev Called by TriVaultCore after each interaction
     */
    function checkMilestone(address user, bytes32 actionType, uint256 count) external onlyAuthorized {
        emit MilestoneChecked(user, actionType, count);
        
        // Check DEDICATED achievement (100 interactions)
        if (count >= 100 && !userAchievements[user][DEDICATED].unlocked) {
            _unlockAchievement(user, DEDICATED);
        }
        
        // Check GOVERNOR achievement (any governance action)
        if ((actionType == ACTION_VOTE || actionType == ACTION_PROPOSAL) && 
            !userAchievements[user][GOVERNOR].unlocked) {
            _unlockAchievement(user, GOVERNOR);
        }
        
        // Update progress for DEDICATED
        if (!userAchievements[user][DEDICATED].unlocked) {
            uint256 progress = (count * 100) / 100;
            if (progress > 100) progress = 100;
            userAchievements[user][DEDICATED].progress = progress;
        }
    }
    
    // ============ Seal-based Achievement Check ============
    
    function checkSealAchievements(address user, uint256 sealCount) external onlyAuthorized {
        if (sealCount >= 1 && !userAchievements[user][FIRST_SEAL].unlocked) {
            _unlockAchievement(user, FIRST_SEAL);
        }
        
        if (sealCount >= 5 && !userAchievements[user][ALL_SEALS].unlocked) {
            _unlockAchievement(user, ALL_SEALS);
        }
        
        if (!userAchievements[user][ALL_SEALS].unlocked) {
            userAchievements[user][ALL_SEALS].progress = (sealCount * 100) / 5;
        }
    }
    
    // ============ Achievement Management ============
    
    function _createAchievement(
        bytes32 id,
        string memory name,
        string memory description,
        uint256 pointsRequired,
        uint256 sealsRequired,
        uint256 interactionsRequired
    ) internal {
        achievements[id] = Achievement({
            id: id,
            name: name,
            description: description,
            pointsRequired: pointsRequired,
            sealsRequired: sealsRequired,
            interactionsRequired: interactionsRequired,
            isActive: true,
            unlockedCount: 0
        });
        
        achievementIds.push(id);
        totalAchievements++;
        
        emit AchievementCreated(id, name);
    }
    
    function createAchievement(
        bytes32 id,
        string memory name,
        string memory description,
        uint256 pointsRequired,
        uint256 sealsRequired,
        uint256 interactionsRequired
    ) external onlyCreator {
        _createAchievement(id, name, description, pointsRequired, sealsRequired, interactionsRequired);
    }
    
    function updateAchievement(
        bytes32 id,
        string memory name,
        string memory description,
        uint256 pointsRequired,
        uint256 sealsRequired,
        uint256 interactionsRequired,
        bool isActive
    ) external onlyCreator {
        if (achievements[id].id == bytes32(0)) revert AchievementNotFound();
        
        Achievement storage achievement = achievements[id];
        achievement.name = name;
        achievement.description = description;
        achievement.pointsRequired = pointsRequired;
        achievement.sealsRequired = sealsRequired;
        achievement.interactionsRequired = interactionsRequired;
        achievement.isActive = isActive;
        
        emit AchievementUpdated(id);
    }
    
    function _unlockAchievement(address user, bytes32 achievementId) internal {
        if (userAchievements[user][achievementId].unlocked) return;
        
        userAchievements[user][achievementId] = UserAchievementData({
            unlocked: true,
            unlockedAt: block.timestamp,
            progress: 100
        });
        
        userUnlockedAchievements[user].push(achievementId);
        userTotalAchievements[user]++;
        achievements[achievementId].unlockedCount++;
        totalUnlocks++;
        
        emit AchievementUnlocked(user, achievementId, block.timestamp);
    }
    
    function manualUnlock(address user, bytes32 achievementId) external onlyCreator {
        if (achievements[achievementId].id == bytes32(0)) revert AchievementNotFound();
        _unlockAchievement(user, achievementId);
    }
    
    // ============ View Functions ============
    
    function getUserAchievements(address user) external view returns (
        bytes32[] memory unlockedIds,
        uint256[] memory unlockedAt,
        uint256 totalUnlockedCount
    ) {
        bytes32[] storage unlocked = userUnlockedAchievements[user];
        unlockedIds = new bytes32[](unlocked.length);
        unlockedAt = new uint256[](unlocked.length);
        
        for (uint256 i = 0; i < unlocked.length; i++) {
            unlockedIds[i] = unlocked[i];
            unlockedAt[i] = userAchievements[user][unlocked[i]].unlockedAt;
        }
        
        return (unlockedIds, unlockedAt, userTotalAchievements[user]);
    }
    
    function getAchievementDetails(bytes32 achievementId) external view returns (
        string memory name,
        string memory description,
        uint256 pointsRequired,
        uint256 sealsRequired,
        uint256 interactionsRequired,
        bool isActive,
        uint256 unlockedCount
    ) {
        Achievement storage a = achievements[achievementId];
        return (
            a.name,
            a.description,
            a.pointsRequired,
            a.sealsRequired,
            a.interactionsRequired,
            a.isActive,
            a.unlockedCount
        );
    }
    
    function getAllAchievements() external view returns (
        bytes32[] memory ids,
        string[] memory names,
        bool[] memory active
    ) {
        ids = new bytes32[](achievementIds.length);
        names = new string[](achievementIds.length);
        active = new bool[](achievementIds.length);
        
        for (uint256 i = 0; i < achievementIds.length; i++) {
            ids[i] = achievementIds[i];
            names[i] = achievements[achievementIds[i]].name;
            active[i] = achievements[achievementIds[i]].isActive;
        }
    }
    
    function getUserAchievementProgress(address user, bytes32 achievementId) external view returns (
        bool unlocked,
        uint256 progress,
        uint256 unlockedAt
    ) {
        UserAchievementData storage data = userAchievements[user][achievementId];
        return (data.unlocked, data.progress, data.unlockedAt);
    }
    
    function getStats() external view returns (
        uint256 _totalAchievements,
        uint256 _totalUnlocks
    ) {
        return (totalAchievements, totalUnlocks);
    }
    
    function hasAchievement(address user, bytes32 achievementId) external view returns (bool) {
        return userAchievements[user][achievementId].unlocked;
    }
}
