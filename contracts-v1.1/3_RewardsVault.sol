// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RewardsVault v1.1
 * @dev Manages rewards, points, and staking for the TriVault ecosystem.
 * 
 * REMIX DEPLOYMENT GUIDE:
 * ========================
 * Order: Deploy THIRD (Contract #3)
 * 
 * Constructor Arguments:
 *   _core (address):    TriVaultCore address from Contract #1
 *   _creator (address): Your wallet address
 * 
 * Example: "0xTriVaultCoreAddress", "0xYourWalletAddress"
 * 
 * After deployment, save the address as REWARDS_VAULT_ADDRESS
 */

// ============ Interface (Inlined for Remix) ============

interface ITriVaultCore {
    function recordInteraction(address user, bytes32 actionType) external;
    function isRegistered(address user) external view returns (bool);
}

// ============ Main Contract ============

contract RewardsVault {
    // ============ Constants ============
    
    uint256 public constant POINTS_PER_INTERACTION = 10;
    uint256 public constant POINTS_PER_SEAL = 100;
    uint256 public constant POINTS_PER_ACHIEVEMENT = 50;
    uint256 public constant MIN_STAKE_AMOUNT = 0.0001 ether;
    uint256 public constant STAKE_BONUS_MULTIPLIER = 2;
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    
    bytes32 public constant ACTION_SEAL_COLLECTED = keccak256("SEAL_COLLECTED");
    bytes32 public constant ACTION_ACHIEVEMENT = keccak256("ACHIEVEMENT");
    bytes32 public constant ACTION_VOTE = keccak256("VOTE");
    bytes32 public constant ACTION_PROPOSAL = keccak256("PROPOSAL");
    
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public lifetimePoints;
    mapping(address => uint256) public claimedRewards;
    
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakeStartTime;
    mapping(address => uint256) public lastRewardClaim;
    
    uint256 public totalStaked;
    uint256 public totalPointsDistributed;
    uint256 public rewardsPool;
    
    address[] public topUsers;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;
    
    uint256 public currentSeason;
    mapping(uint256 => mapping(address => uint256)) public seasonPoints;
    mapping(uint256 => uint256) public seasonStartTime;
    mapping(uint256 => uint256) public seasonEndTime;
    
    // ============ Events ============
    
    event PointsEarned(address indexed user, uint256 points, bytes32 actionType);
    event RewardsClaimed(address indexed user, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event SeasonStarted(uint256 indexed season, uint256 startTime);
    event SeasonEnded(uint256 indexed season, uint256 endTime);
    event RewardsPoolFunded(uint256 amount);
    
    // ============ Errors ============
    
    error OnlyAuthorized();
    error OnlyCreator();
    error StakeAmountTooLow();
    error InsufficientStake();
    error NoRewardsToClaim();
    error WithdrawFailed();
    
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
        currentSeason = 1;
        seasonStartTime[1] = block.timestamp;
    }
    
    // ============ Core Callback ============
    
    function onInteraction(address user, bytes32 actionType) external onlyAuthorized {
        uint256 points = calculatePoints(user, actionType);
        
        if (points > 0) {
            userPoints[user] += points;
            lifetimePoints[user] += points;
            totalPointsDistributed += points;
            
            if (seasonEndTime[currentSeason] == 0 || block.timestamp <= seasonEndTime[currentSeason]) {
                seasonPoints[currentSeason][user] += points;
            }
            
            emit PointsEarned(user, points, actionType);
            _updateLeaderboard(user);
        }
    }
    
    function calculatePoints(address user, bytes32 actionType) public view returns (uint256) {
        uint256 basePoints;
        
        if (actionType == ACTION_SEAL_COLLECTED) {
            basePoints = POINTS_PER_SEAL;
        } else if (actionType == ACTION_ACHIEVEMENT) {
            basePoints = POINTS_PER_ACHIEVEMENT;
        } else if (actionType == ACTION_VOTE || actionType == ACTION_PROPOSAL) {
            basePoints = POINTS_PER_INTERACTION * 2;
        } else {
            basePoints = POINTS_PER_INTERACTION;
        }
        
        if (stakedAmount[user] > 0) {
            basePoints = basePoints * STAKE_BONUS_MULTIPLIER;
        }
        
        return basePoints;
    }
    
    // ============ Staking Functions ============
    
    function stake() external payable {
        if (msg.value < MIN_STAKE_AMOUNT) revert StakeAmountTooLow();
        
        if (stakedAmount[msg.sender] == 0) {
            stakeStartTime[msg.sender] = block.timestamp;
        }
        
        stakedAmount[msg.sender] += msg.value;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }
    
    function unstake(uint256 amount) external {
        if (stakedAmount[msg.sender] < amount) revert InsufficientStake();
        
        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        
        if (stakedAmount[msg.sender] == 0) {
            stakeStartTime[msg.sender] = 0;
        }
        
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert WithdrawFailed();
        
        emit Unstaked(msg.sender, amount);
    }
    
    // ============ Rewards Functions ============
    
    function claimRewards() external {
        uint256 claimable = calculateClaimableRewards(msg.sender);
        if (claimable == 0) revert NoRewardsToClaim();
        
        if (claimable > rewardsPool) {
            claimable = rewardsPool;
        }
        
        claimedRewards[msg.sender] += claimable;
        rewardsPool -= claimable;
        lastRewardClaim[msg.sender] = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: claimable}("");
        if (!success) revert WithdrawFailed();
        
        emit RewardsClaimed(msg.sender, claimable);
    }
    
    function calculateClaimableRewards(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0 || rewardsPool == 0) return 0;
        
        uint256 stakeDuration = block.timestamp - lastRewardClaim[user];
        if (lastRewardClaim[user] == 0) {
            stakeDuration = block.timestamp - stakeStartTime[user];
        }
        
        uint256 userShare = (stakedAmount[user] * 1e18) / totalStaked;
        uint256 dailyRate = (rewardsPool * 1) / 100;
        uint256 reward = (dailyRate * stakeDuration * userShare) / (1 days * 1e18);
        
        return reward;
    }
    
    // ============ View Functions ============
    
    function getUserRewardStats(address user) external view returns (
        uint256 points,
        uint256 lifetime,
        uint256 staked,
        uint256 claimed,
        uint256 claimable
    ) {
        return (
            userPoints[user],
            lifetimePoints[user],
            stakedAmount[user],
            claimedRewards[user],
            calculateClaimableRewards(user)
        );
    }
    
    function getStats() external view returns (
        uint256 _totalStaked,
        uint256 _rewardsPool,
        uint256 _totalPointsDistributed,
        uint256 _currentSeason
    ) {
        return (totalStaked, rewardsPool, totalPointsDistributed, currentSeason);
    }
    
    function getTopUsers(uint256 count) external view returns (
        address[] memory users,
        uint256[] memory points
    ) {
        uint256 length = count < topUsers.length ? count : topUsers.length;
        users = new address[](length);
        points = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            users[i] = topUsers[i];
            points[i] = lifetimePoints[topUsers[i]];
        }
    }
    
    // ============ Internal Functions ============
    
    function _updateLeaderboard(address user) internal {
        bool found = false;
        uint256 userIndex = 0;
        
        for (uint256 i = 0; i < topUsers.length; i++) {
            if (topUsers[i] == user) {
                found = true;
                userIndex = i;
                break;
            }
        }
        
        if (!found && topUsers.length < MAX_LEADERBOARD_SIZE) {
            topUsers.push(user);
            userIndex = topUsers.length - 1;
            found = true;
        }
        
        if (found) {
            while (userIndex > 0 && lifetimePoints[topUsers[userIndex]] > lifetimePoints[topUsers[userIndex - 1]]) {
                address temp = topUsers[userIndex - 1];
                topUsers[userIndex - 1] = topUsers[userIndex];
                topUsers[userIndex] = temp;
                userIndex--;
            }
        }
    }
    
    // ============ Admin Functions ============
    
    function startNewSeason() external onlyCreator {
        seasonEndTime[currentSeason] = block.timestamp;
        emit SeasonEnded(currentSeason, block.timestamp);
        
        currentSeason++;
        seasonStartTime[currentSeason] = block.timestamp;
        emit SeasonStarted(currentSeason, block.timestamp);
    }
    
    function fundRewardsPool() external payable {
        rewardsPool += msg.value;
        emit RewardsPoolFunded(msg.value);
    }
    
    function emergencyWithdraw() external onlyCreator {
        uint256 balance = address(this).balance - totalStaked;
        if (balance > 0) {
            (bool success, ) = creator.call{value: balance}("");
            if (!success) revert WithdrawFailed();
        }
    }
    
    receive() external payable {
        rewardsPool += msg.value;
        emit RewardsPoolFunded(msg.value);
    }
}
