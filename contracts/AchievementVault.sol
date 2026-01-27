// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ITriVaultCore.sol";

/**
 * @title AchievementVault
 * @dev Manages achievements and milestones for the TriVault ecosystem.
 *      Tracks user progress and unlocks achievements based on actions.
 */
contract AchievementVault {
    // ============ Constants ============
    
    uint256 public constant MAX_ACHIEVEMENTS = 50;
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    
    // Action types for milestone checking
    bytes32 public constant ACTION_SEAL_COLLECTED = keccak256("SEAL_COLLECTED");
    bytes32 public constant ACTION_ACHIEVEMENT = keccak256("ACHIEVEMENT");
    
    // Achievement definitions
    struct Achievement {
        bytes32 id;
        string name;
        string description;
        string emoji;
        bytes32 triggerAction;  // Which action triggers this
        uint256 threshold;       // How many actions needed
        uint256 pointsReward;   // Points awarded
        bool active;
        uint256 totalUnlocked;  // How many users have this
    }
    
    // Storage
    bytes32[] public achievementIds;
    mapping(bytes32 => Achievement) public achievements;
    mapping(address => mapping(bytes32 => bool)) public userAchievements;
    mapping(address => mapping(bytes32 => uint256)) public achievementUnlockTime;
    mapping(address => bytes32[]) public userAchievementList;
    mapping(address => uint256) public userAchievementCount;
    
    uint256 public totalAchievementsUnlocked;
    
    // ============ Events ============
    
    event AchievementCreated(bytes32 indexed id, string name);
    event AchievementUnlocked(address indexed user, bytes32 indexed achievementId, string name, uint256 timestamp);
    event AchievementUpdated(bytes32 indexed id, string name);
    
    // ============ Errors ============
    
    error OnlyAuthorized();
    error OnlyCreator();
    error AchievementNotFound();
    error AchievementAlreadyUnlocked();
    error AchievementNotActive();
    error MaxAchievementsReached();
    error AchievementExists();
    
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
        
        // Initialize default achievements
        _createAchievement(
            keccak256("FIRST_SEAL"),
            "First Seal",
            "Collect your first seal",
            unicode"🎯",
            ACTION_SEAL_COLLECTED,
            1,
            100
        );
        
        _createAchievement(
            keccak256("SEAL_COLLECTOR"),
            "Seal Collector",
            "Collect 3 seals",
            unicode"📦",
            ACTION_SEAL_COLLECTED,
            3,
            300
        );
        
        _createAchievement(
            keccak256("SEAL_MASTER"),
            "Seal Master",
            "Collect all 5 seals",
            unicode"👑",
            ACTION_SEAL_COLLECTED,
            5,
            500
        );
        
        _createAchievement(
            keccak256("EARLY_ADOPTER"),
            "Early Adopter",
            "Be among the first 100 users",
            unicode"🌟",
            bytes32(0), // Special trigger
            0,
            200
        );
        
        _createAchievement(
            keccak256("POWER_USER"),
            "Power User",
            "Complete 10 interactions",
            unicode"⚡",
            bytes32(0),
            10,
            150
        );
        
        _createAchievement(
            keccak256("VETERAN"),
            "Veteran",
            "Complete 50 interactions",
            unicode"🎖️",
            bytes32(0),
            50,
            400
        );
        
        _createAchievement(
            keccak256("LEGEND"),
            "Legend",
            "Complete 100 interactions",
            unicode"🏆",
            bytes32(0),
            100,
            1000
        );
    }
    
    // ============ Internal Functions ============
    
    function _createAchievement(
        bytes32 id,
        string memory name,
        string memory description,
        string memory emoji,
        bytes32 triggerAction,
        uint256 threshold,
        uint256 pointsReward
    ) internal {
        if (achievementIds.length >= MAX_ACHIEVEMENTS) revert MaxAchievementsReached();
        if (achievements[id].id != bytes32(0)) revert AchievementExists();
        
        achievements[id] = Achievement({
            id: id,
            name: name,
            description: description,
            emoji: emoji,
            triggerAction: triggerAction,
            threshold: threshold,
            pointsReward: pointsReward,
            active: true,
            totalUnlocked: 0
        });
        
        achievementIds.push(id);
        emit AchievementCreated(id, name);
    }
    
    function _unlockAchievement(address user, bytes32 achievementId) internal {
        Achievement storage achievement = achievements[achievementId];
        
        if (achievement.id == bytes32(0)) revert AchievementNotFound();
        if (!achievement.active) revert AchievementNotActive();
        if (userAchievements[user][achievementId]) return; // Already unlocked, silently skip
        
        userAchievements[user][achievementId] = true;
        achievementUnlockTime[user][achievementId] = block.timestamp;
        userAchievementList[user].push(achievementId);
        userAchievementCount[user]++;
        achievement.totalUnlocked++;
        totalAchievementsUnlocked++;
        
        emit AchievementUnlocked(user, achievementId, achievement.name, block.timestamp);
    }
    
    // ============ Core Callbacks ============
    
    /**
     * @dev Called when a new user registers
     */
    function onUserRegistered(address user) external onlyAuthorized {
        // Check for early adopter achievement
        (uint256 totalUsers, , ) = core.getStats();
        if (totalUsers <= 100) {
            _unlockAchievement(user, keccak256("EARLY_ADOPTER"));
        }
    }
    
    /**
     * @dev Check if a milestone achievement should be unlocked
     */
    function checkMilestone(address user, bytes32 actionType, uint256 count) external onlyAuthorized {
        // Check action-specific achievements
        for (uint256 i = 0; i < achievementIds.length; i++) {
            bytes32 id = achievementIds[i];
            Achievement storage achievement = achievements[id];
            
            if (!achievement.active) continue;
            if (userAchievements[user][id]) continue;
            
            // Check if action matches and threshold is met
            if (achievement.triggerAction == actionType && count >= achievement.threshold) {
                _unlockAchievement(user, id);
            }
            
            // Check interaction count milestones (triggerAction == 0)
            if (achievement.triggerAction == bytes32(0) && achievement.threshold > 0 && count >= achievement.threshold) {
                _unlockAchievement(user, id);
            }
        }
    }
    
    /**
     * @dev Manually unlock an achievement for a user
     */
    function unlockAchievement(address user, bytes32 achievementId) external onlyAuthorized {
        _unlockAchievement(user, achievementId);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get all achievement IDs for a user
     */
    function getUserAchievements(address user) external view returns (bytes32[] memory) {
        return userAchievementList[user];
    }
    
    /**
     * @dev Get detailed achievement info for a user
     */
    function getUserAchievementsDetailed(address user) external view returns (
        bytes32[] memory ids,
        string[] memory names,
        uint256[] memory unlockTimes
    ) {
        uint256 count = userAchievementList[user].length;
        ids = new bytes32[](count);
        names = new string[](count);
        unlockTimes = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            bytes32 id = userAchievementList[user][i];
            ids[i] = id;
            names[i] = achievements[id].name;
            unlockTimes[i] = achievementUnlockTime[user][id];
        }
    }
    
    /**
     * @dev Check if user has specific achievement
     */
    function hasAchievement(address user, bytes32 achievementId) external view returns (bool) {
        return userAchievements[user][achievementId];
    }
    
    /**
     * @dev Get achievement count for a user
     */
    function getAchievementCount(address user) external view returns (uint256) {
        return userAchievementCount[user];
    }
    
    /**
     * @dev Get total achievements unlocked across all users
     */
    function getTotalAchievementsUnlocked() external view returns (uint256) {
        return totalAchievementsUnlocked;
    }
    
    /**
     * @dev Get all achievement definitions
     */
    function getAllAchievements() external view returns (Achievement[] memory) {
        Achievement[] memory allAchievements = new Achievement[](achievementIds.length);
        for (uint256 i = 0; i < achievementIds.length; i++) {
            allAchievements[i] = achievements[achievementIds[i]];
        }
        return allAchievements;
    }
    
    /**
     * @dev Get achievement by ID
     */
    function getAchievement(bytes32 id) external view returns (Achievement memory) {
        if (achievements[id].id == bytes32(0)) revert AchievementNotFound();
        return achievements[id];
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (
        uint256 totalAchievements,
        uint256 _totalUnlocked
    ) {
        return (achievementIds.length, totalAchievementsUnlocked);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Create a new achievement
     */
    function createAchievement(
        bytes32 id,
        string calldata name,
        string calldata description,
        string calldata emoji,
        bytes32 triggerAction,
        uint256 threshold,
        uint256 pointsReward
    ) external onlyCreator {
        _createAchievement(id, name, description, emoji, triggerAction, threshold, pointsReward);
    }
    
    /**
     * @dev Update an existing achievement
     */
    function updateAchievement(
        bytes32 id,
        string calldata name,
        string calldata description,
        string calldata emoji,
        uint256 pointsReward
    ) external onlyCreator {
        if (achievements[id].id == bytes32(0)) revert AchievementNotFound();
        
        Achievement storage achievement = achievements[id];
        achievement.name = name;
        achievement.description = description;
        achievement.emoji = emoji;
        achievement.pointsReward = pointsReward;
        
        emit AchievementUpdated(id, name);
    }
    
    /**
     * @dev Toggle achievement active status
     */
    function setAchievementActive(bytes32 id, bool active) external onlyCreator {
        if (achievements[id].id == bytes32(0)) revert AchievementNotFound();
        achievements[id].active = active;
    }
}
