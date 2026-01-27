// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ITriVaultCore.sol";

/**
 * @title RewardsVault
 * @dev Manages rewards, points, and staking for the TriVault ecosystem.
 *      Users earn points from interactions and can stake ETH for additional rewards.
 */
contract RewardsVault {
    // ============ Constants ============
    
    uint256 public constant POINTS_PER_INTERACTION = 10;
    uint256 public constant POINTS_PER_SEAL = 100;
    uint256 public constant POINTS_PER_ACHIEVEMENT = 50;
    uint256 public constant MIN_STAKE_AMOUNT = 0.0001 ether;
    uint256 public constant STAKE_BONUS_MULTIPLIER = 2; // 2x points for stakers
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    
    // Action types
    bytes32 public constant ACTION_SEAL_COLLECTED = keccak256("SEAL_COLLECTED");
    bytes32 public constant ACTION_ACHIEVEMENT = keccak256("ACHIEVEMENT");
    bytes32 public constant ACTION_VOTE = keccak256("VOTE");
    bytes32 public constant ACTION_PROPOSAL = keccak256("PROPOSAL");
    
    // Points and rewards
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public lifetimePoints;
    mapping(address => uint256) public claimedRewards;
    
    // Staking
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakeStartTime;
    mapping(address => uint256) public lastRewardClaim;
    
    uint256 public totalStaked;
    uint256 public totalPointsDistributed;
    uint256 public rewardsPool;
    
    // Leaderboard tracking
    address[] public topUsers;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;
    
    // Seasons
    uint256 public currentSeason;
    mapping(uint256 => mapping(address => uint256)) public seasonPoints;
    mapping(uint256 => uint256) public seasonStartTime;
    mapping(uint256 => uint256) public seasonEndTime;
    
    // ============ Events ============
    
    event PointsEarned(address indexed user, uint256 points, bytes32 actionType);
    event RewardsClaimed(address indexed user, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsPoolFunded(uint256 amount);
    event SeasonStarted(uint256 indexed season, uint256 startTime);
    event SeasonEnded(uint256 indexed season, uint256 endTime);
    
    // ============ Errors ============
    
    error OnlyAuthorized();
    error OnlyCreator();
    error InsufficientBalance();
    error InsufficientStake();
    error NoRewardsToClaim();
    error StakeAmountTooLow();
    error WithdrawFailed();
    error SeasonNotActive();
    
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
    
    /**
     * @dev Called by core when an interaction occurs
     */
    function onInteraction(address user, bytes32 actionType) external onlyAuthorized {
        uint256 points = calculatePoints(user, actionType);
        
        if (points > 0) {
            userPoints[user] += points;
            lifetimePoints[user] += points;
            totalPointsDistributed += points;
            
            // Add to current season
            if (seasonEndTime[currentSeason] == 0 || block.timestamp <= seasonEndTime[currentSeason]) {
                seasonPoints[currentSeason][user] += points;
            }
            
            emit PointsEarned(user, points, actionType);
            
            // Update leaderboard
            _updateLeaderboard(user);
        }
    }
    
    /**
     * @dev Calculate points based on action type and user status
     */
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
        
        // Apply staking bonus
        if (stakedAmount[user] > 0) {
            basePoints = basePoints * STAKE_BONUS_MULTIPLIER;
        }
        
        return basePoints;
    }
    
    // ============ Staking Functions ============
    
    /**
     * @dev Stake ETH to earn bonus points
     */
    function stake() external payable {
        if (msg.value < MIN_STAKE_AMOUNT) revert StakeAmountTooLow();
        
        if (stakedAmount[msg.sender] == 0) {
            stakeStartTime[msg.sender] = block.timestamp;
        }
        
        stakedAmount[msg.sender] += msg.value;
        totalStaked += msg.value;
        lastRewardClaim[msg.sender] = block.timestamp;
        
        // Record interaction
        core.recordInteraction(msg.sender, keccak256("STAKE"));
        
        emit Staked(msg.sender, msg.value);
    }
    
    /**
     * @dev Unstake ETH
     */
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
    
    /**
     * @dev Get staked amount for a user
     */
    function getStakedAmount(address user) external view returns (uint256) {
        return stakedAmount[user];
    }
    
    // ============ Rewards Functions ============
    
    /**
     * @dev Claim available rewards
     */
    function claimRewards() external {
        uint256 claimable = getClaimableRewards(msg.sender);
        if (claimable == 0) revert NoRewardsToClaim();
        if (rewardsPool < claimable) revert InsufficientBalance();
        
        rewardsPool -= claimable;
        claimedRewards[msg.sender] += claimable;
        userPoints[msg.sender] = 0; // Reset points after claim
        lastRewardClaim[msg.sender] = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: claimable}("");
        if (!success) revert WithdrawFailed();
        
        emit RewardsClaimed(msg.sender, claimable);
    }
    
    /**
     * @dev Get claimable rewards for a user
     */
    function getClaimableRewards(address user) public view returns (uint256) {
        if (userPoints[user] == 0 || totalPointsDistributed == 0 || rewardsPool == 0) {
            return 0;
        }
        
        // Calculate share of rewards pool based on points
        // Using a simple formula: (userPoints / totalPoints) * rewardsPool * 0.1
        // Limiting to 10% of pool per claim to ensure sustainability
        uint256 maxClaimable = rewardsPool / 10;
        uint256 pointShare = (userPoints[user] * rewardsPool) / totalPointsDistributed;
        
        return pointShare > maxClaimable ? maxClaimable : pointShare;
    }
    
    /**
     * @dev Get user points
     */
    function getUserPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }
    
    // ============ Season Functions ============
    
    /**
     * @dev Start a new season
     */
    function startNewSeason() external onlyCreator {
        // End current season
        seasonEndTime[currentSeason] = block.timestamp;
        emit SeasonEnded(currentSeason, block.timestamp);
        
        // Start new season
        currentSeason++;
        seasonStartTime[currentSeason] = block.timestamp;
        emit SeasonStarted(currentSeason, block.timestamp);
    }
    
    /**
     * @dev Get season points for a user
     */
    function getSeasonPoints(uint256 season, address user) external view returns (uint256) {
        return seasonPoints[season][user];
    }
    
    // ============ Leaderboard Functions ============
    
    function _updateLeaderboard(address user) internal {
        // Check if user is already on leaderboard
        bool found = false;
        for (uint256 i = 0; i < topUsers.length; i++) {
            if (topUsers[i] == user) {
                found = true;
                break;
            }
        }
        
        // Add if not found and has enough points
        if (!found && topUsers.length < MAX_LEADERBOARD_SIZE) {
            topUsers.push(user);
        }
        
        // Sort leaderboard (bubble sort for simplicity)
        for (uint256 i = 0; i < topUsers.length; i++) {
            for (uint256 j = i + 1; j < topUsers.length; j++) {
                if (lifetimePoints[topUsers[j]] > lifetimePoints[topUsers[i]]) {
                    address temp = topUsers[i];
                    topUsers[i] = topUsers[j];
                    topUsers[j] = temp;
                }
            }
        }
        
        // Trim to max size
        while (topUsers.length > MAX_LEADERBOARD_SIZE) {
            topUsers.pop();
        }
    }
    
    /**
     * @dev Get top users
     */
    function getTopUsers(uint256 count) external view returns (address[] memory, uint256[] memory) {
        uint256 actualCount = count > topUsers.length ? topUsers.length : count;
        address[] memory users = new address[](actualCount);
        uint256[] memory points = new uint256[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            users[i] = topUsers[i];
            points[i] = lifetimePoints[topUsers[i]];
        }
        
        return (users, points);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get user reward stats
     */
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
            getClaimableRewards(user)
        );
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalStaked,
        uint256 _rewardsPool,
        uint256 _totalPointsDistributed,
        uint256 _currentSeason
    ) {
        return (totalStaked, rewardsPool, totalPointsDistributed, currentSeason);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Add to rewards pool
     */
    function fundRewardsPool() external payable {
        rewardsPool += msg.value;
        emit RewardsPoolFunded(msg.value);
    }
    
    /**
     * @dev Award bonus points to a user
     */
    function awardBonusPoints(address user, uint256 points) external onlyCreator {
        userPoints[user] += points;
        lifetimePoints[user] += points;
        totalPointsDistributed += points;
        
        if (seasonEndTime[currentSeason] == 0 || block.timestamp <= seasonEndTime[currentSeason]) {
            seasonPoints[currentSeason][user] += points;
        }
        
        emit PointsEarned(user, points, keccak256("BONUS"));
        _updateLeaderboard(user);
    }
    
    /**
     * @dev Withdraw any excess funds
     */
    function withdrawExcess(uint256 amount) external onlyCreator {
        uint256 excess = address(this).balance - totalStaked - rewardsPool;
        if (amount > excess) revert InsufficientBalance();
        
        (bool success, ) = creator.call{value: amount}("");
        if (!success) revert WithdrawFailed();
    }
    
    // ============ Receive ETH ============
    
    receive() external payable {
        rewardsPool += msg.value;
        emit RewardsPoolFunded(msg.value);
    }
}
