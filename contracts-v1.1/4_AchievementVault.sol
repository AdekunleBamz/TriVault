// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AchievementVault v1.1
 * @dev Manages achievements, badges, and milestones for the TriVault ecosystem.
 * 
 * REMIX DEPLOYMENT GUIDE:
 * ========================
 * Order: Deploy FOURTH (Contract #4)
 * 
 * Constructor Arguments:
 *   _core (address):    TriVaultCore address from Contract #1
 *   _creator (address): Your wallet address
 * 
 * Example: "0xTriVaultCoreAddress", "0xYourWalletAddress"
 * 
 * After deployment, save the address as ACHIEVEMENT_VAULT_ADDRESS
 */

// ============ Interface (Inlined for Remix) ============

interface ITriVaultCore {
    function recordInteraction(address user, bytes32 actionType) external;
    function isRegistered(address user) external view returns (bool);
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
    
    bytes32 public constant FIRST_SEAL = keccak256("FIRST_SEAL");
    bytes32 public constant ALL_SEALS = keccak256("ALL_SEALS");
    bytes32 public constant EARLY_ADOPTER = keccak256("EARLY_ADOPTER");
    bytes32 public constant DEDICATED = keccak256("DEDICATED");
    bytes32 public constant WHALE = keccak256("WHALE");
    bytes32 public constant SOCIAL = keccak256("SOCIAL");
    bytes32 public constant GOVERNOR = keccak256("GOVERNOR");
    
    // ============ Events ============
    
    event AchievementUnlocked(address indexed user, bytes32 indexed achievementId, uint256 timestamp);
    event AchievementCreated(bytes32 indexed achievementId, string name);
    event AchievementUpdated(bytes32 indexed achievementId);
    event ProgressUpdated(address indexed user, bytes32 indexed achievementId, uint256 progress);
    
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
        _createAchievement(EARLY_ADOPTER, "Early Adopter", "Join TriVault in the first month", 0, 0, 1);
        _createAchievement(DEDICATED, "Dedicated", "Interact with TriVault 100 times", 0, 0, 100);
        _createAchievement(WHALE, "Whale", "Earn 10,000 points", 10000, 0, 0);
        _createAchievement(SOCIAL, "Social Butterfly", "Share TriVault with friends", 0, 0, 5);
        _createAchievement(GOVERNOR, "Governor", "Participate in governance", 0, 0, 1);
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
    
    // ============ Core Callback ============
    
    function checkAndUnlockAchievements(
        address user,
        uint256 totalSeals,
        uint256 totalPoints,
        uint256 totalInteractions
    ) external onlyAuthorized returns (bytes32[] memory) {
        bytes32[] memory newlyUnlocked = new bytes32[](achievementIds.length);
        uint256 unlockedCount = 0;
        
        for (uint256 i = 0; i < achievementIds.length; i++) {
            bytes32 achievementId = achievementIds[i];
            Achievement storage achievement = achievements[achievementId];
            
            if (!achievement.isActive) continue;
            if (userAchievements[user][achievementId].unlocked) continue;
            
            bool meetsRequirements = true;
            
            if (achievement.sealsRequired > 0 && totalSeals < achievement.sealsRequired) {
                meetsRequirements = false;
            }
            if (achievement.pointsRequired > 0 && totalPoints < achievement.pointsRequired) {
                meetsRequirements = false;
            }
            if (achievement.interactionsRequired > 0 && totalInteractions < achievement.interactionsRequired) {
                meetsRequirements = false;
            }
            
            if (meetsRequirements) {
                _unlockAchievement(user, achievementId);
                newlyUnlocked[unlockedCount] = achievementId;
                unlockedCount++;
            } else {
                uint256 progress = _calculateProgress(achievement, totalSeals, totalPoints, totalInteractions);
                if (progress != userAchievements[user][achievementId].progress) {
                    userAchievements[user][achievementId].progress = progress;
                    emit ProgressUpdated(user, achievementId, progress);
                }
            }
        }
        
        bytes32[] memory result = new bytes32[](unlockedCount);
        for (uint256 i = 0; i < unlockedCount; i++) {
            result[i] = newlyUnlocked[i];
        }
        
        return result;
    }
    
    function _unlockAchievement(address user, bytes32 achievementId) internal {
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
    
    function _calculateProgress(
        Achievement memory achievement,
        uint256 totalSeals,
        uint256 totalPoints,
        uint256 totalInteractions
    ) internal pure returns (uint256) {
        uint256 progressSum = 0;
        uint256 requirements = 0;
        
        if (achievement.sealsRequired > 0) {
            progressSum += (totalSeals * 100) / achievement.sealsRequired;
            requirements++;
        }
        if (achievement.pointsRequired > 0) {
            progressSum += (totalPoints * 100) / achievement.pointsRequired;
            requirements++;
        }
        if (achievement.interactionsRequired > 0) {
            progressSum += (totalInteractions * 100) / achievement.interactionsRequired;
            requirements++;
        }
        
        if (requirements == 0) return 0;
        
        uint256 avgProgress = progressSum / requirements;
        return avgProgress > 100 ? 100 : avgProgress;
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
}
