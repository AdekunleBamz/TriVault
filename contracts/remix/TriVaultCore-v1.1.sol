// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============ Interfaces (Inline for Remix) ============

interface ISealVault {
    function collectSeal(uint8 sealType) external payable;
    function getUserSeals(address user) external view returns (bool[5] memory);
    function hasAllSeals(address user) external view returns (bool);
    function getSealCount(address user) external view returns (uint256);
    function getTotalSealsCollected() external view returns (uint256);
}

interface IRewardsVault {
    function onInteraction(address user, bytes32 actionType) external;
    function claimRewards() external;
    function getClaimableRewards(address user) external view returns (uint256);
    function getUserPoints(address user) external view returns (uint256);
    function stake() external payable;
    function unstake(uint256 amount) external;
    function getStakedAmount(address user) external view returns (uint256);
}

interface IAchievementVault {
    function onUserRegistered(address user) external;
    function checkMilestone(address user, bytes32 actionType, uint256 count) external;
    function unlockAchievement(address user, bytes32 achievementId) external;
    function getUserAchievements(address user) external view returns (bytes32[] memory);
    function hasAchievement(address user, bytes32 achievementId) external view returns (bool);
    function getAchievementCount(address user) external view returns (uint256);
    function getTotalAchievementsUnlocked() external view returns (uint256);
}

interface IGovernanceVault {
    struct Proposal {
        bytes32 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool cancelled;
    }
    
    function createProposal(string calldata title, string calldata description, uint256 duration) external returns (bytes32);
    function vote(bytes32 proposalId, bool support) external;
    function executeProposal(bytes32 proposalId) external;
    function cancelProposal(bytes32 proposalId) external;
    function getProposal(bytes32 proposalId) external view returns (Proposal memory);
    function getUserVotingPower(address user) external view returns (uint256);
    function hasVoted(bytes32 proposalId, address user) external view returns (bool);
    function getActiveProposals() external view returns (bytes32[] memory);
}

// ============ Main Contract ============

/**
 * @title TriVaultCore v1.1
 * @dev Central controller and registry for the TriVault ecosystem.
 *      Coordinates interactions between all 5 contracts and manages permissions.
 */
contract TriVaultCore {
    // ============ State Variables ============
    
    address public immutable creator;
    
    // Contract registry
    address public sealVault;
    address public rewardsVault;
    address public achievementVault;
    address public governanceVault;
    
    // Fee configuration
    uint256 public constant BASE_FEE = 0.00001 ether;
    uint256 public protocolFeePercent = 10; // 10% of fees go to protocol
    
    // Protocol stats
    uint256 public totalUsersRegistered;
    uint256 public totalInteractions;
    uint256 public totalFeesCollected;
    
    // User registry
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) public userInteractionCount;
    mapping(address => uint256) public userRegistrationTime;
    
    // Authorized contracts that can call privileged functions
    mapping(address => bool) public authorizedContracts;
    
    // Paused state
    bool public paused;
    
    // ============ Events ============
    
    event UserRegistered(address indexed user, uint256 timestamp);
    event InteractionRecorded(address indexed user, address indexed vault, bytes32 actionType, uint256 timestamp);
    event ContractUpdated(string indexed contractName, address indexed oldAddress, address indexed newAddress);
    event ContractAuthorized(address indexed contractAddress, bool authorized);
    event FeesDistributed(uint256 protocolAmount, uint256 rewardsAmount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    // ============ Errors ============
    
    error OnlyCreator();
    error OnlyAuthorized();
    error AlreadyRegistered();
    error NotRegistered();
    error ZeroAddress();
    error ContractPaused();
    error WithdrawFailed();
    error InvalidPercentage();
    
    // ============ Modifiers ============
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    modifier onlyAuthorized() {
        if (!authorizedContracts[msg.sender] && msg.sender != creator) revert OnlyAuthorized();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _creator) {
        if (_creator == address(0)) revert ZeroAddress();
        creator = _creator;
        authorizedContracts[_creator] = true;
    }
    
    // ============ User Management ============
    
    /**
     * @dev Register a new user in the ecosystem
     */
    function registerUser() external whenNotPaused {
        if (isRegistered[msg.sender]) revert AlreadyRegistered();
        
        isRegistered[msg.sender] = true;
        userRegistrationTime[msg.sender] = block.timestamp;
        totalUsersRegistered++;
        
        emit UserRegistered(msg.sender, block.timestamp);
        
        // Notify achievement vault of new user
        if (achievementVault != address(0)) {
            IAchievementVault(achievementVault).onUserRegistered(msg.sender);
        }
    }
    
    /**
     * @dev Record an interaction from any vault
     */
    function recordInteraction(
        address user,
        bytes32 actionType
    ) external onlyAuthorized whenNotPaused {
        if (!isRegistered[user]) {
            // Auto-register user on first interaction
            isRegistered[user] = true;
            userRegistrationTime[user] = block.timestamp;
            totalUsersRegistered++;
            emit UserRegistered(user, block.timestamp);
        }
        
        userInteractionCount[user]++;
        totalInteractions++;
        
        emit InteractionRecorded(user, msg.sender, actionType, block.timestamp);
        
        // Notify rewards vault to potentially award points
        if (rewardsVault != address(0)) {
            IRewardsVault(rewardsVault).onInteraction(user, actionType);
        }
        
        // Check for achievement milestones
        if (achievementVault != address(0)) {
            IAchievementVault(achievementVault).checkMilestone(user, actionType, userInteractionCount[user]);
        }
    }
    
    // ============ Fee Management ============
    
    /**
     * @dev Distribute collected fees between protocol and rewards pool
     */
    function distributeFees() external payable {
        uint256 amount = msg.value;
        if (amount == 0) return;
        
        totalFeesCollected += amount;
        
        uint256 protocolAmount = (amount * protocolFeePercent) / 100;
        uint256 rewardsAmount = amount - protocolAmount;
        
        // Send rewards portion to rewards vault if configured
        if (rewardsVault != address(0) && rewardsAmount > 0) {
            (bool success, ) = rewardsVault.call{value: rewardsAmount}("");
            if (!success) {
                // If transfer fails, keep in this contract
                rewardsAmount = 0;
            }
        }
        
        emit FeesDistributed(protocolAmount, rewardsAmount);
    }
    
    /**
     * @dev Set protocol fee percentage (0-100)
     */
    function setProtocolFeePercent(uint256 _percent) external onlyCreator {
        if (_percent > 100) revert InvalidPercentage();
        protocolFeePercent = _percent;
    }
    
    // ============ Contract Registry ============
    
    /**
     * @dev Set the SealVault contract address
     */
    function setSealVault(address _sealVault) external onlyCreator {
        address old = sealVault;
        sealVault = _sealVault;
        authorizedContracts[_sealVault] = true;
        emit ContractUpdated("SealVault", old, _sealVault);
    }
    
    /**
     * @dev Set the RewardsVault contract address
     */
    function setRewardsVault(address _rewardsVault) external onlyCreator {
        address old = rewardsVault;
        rewardsVault = _rewardsVault;
        authorizedContracts[_rewardsVault] = true;
        emit ContractUpdated("RewardsVault", old, _rewardsVault);
    }
    
    /**
     * @dev Set the AchievementVault contract address
     */
    function setAchievementVault(address _achievementVault) external onlyCreator {
        address old = achievementVault;
        achievementVault = _achievementVault;
        authorizedContracts[_achievementVault] = true;
        emit ContractUpdated("AchievementVault", old, _achievementVault);
    }
    
    /**
     * @dev Set the GovernanceVault contract address
     */
    function setGovernanceVault(address _governanceVault) external onlyCreator {
        address old = governanceVault;
        governanceVault = _governanceVault;
        authorizedContracts[_governanceVault] = true;
        emit ContractUpdated("GovernanceVault", old, _governanceVault);
    }
    
    /**
     * @dev Authorize or deauthorize a contract
     */
    function setAuthorized(address _contract, bool _authorized) external onlyCreator {
        authorizedContracts[_contract] = _authorized;
        emit ContractAuthorized(_contract, _authorized);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get all contract addresses
     */
    function getContracts() external view returns (
        address _sealVault,
        address _rewardsVault,
        address _achievementVault,
        address _governanceVault
    ) {
        return (sealVault, rewardsVault, achievementVault, governanceVault);
    }
    
    /**
     * @dev Get user info
     */
    function getUserInfo(address user) external view returns (
        bool registered,
        uint256 registrationTime,
        uint256 interactionCount
    ) {
        return (
            isRegistered[user],
            userRegistrationTime[user],
            userInteractionCount[user]
        );
    }
    
    /**
     * @dev Get protocol stats
     */
    function getStats() external view returns (
        uint256 users,
        uint256 interactions,
        uint256 fees
    ) {
        return (totalUsersRegistered, totalInteractions, totalFeesCollected);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Pause the protocol
     */
    function pause() external onlyCreator {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @dev Unpause the protocol
     */
    function unpause() external onlyCreator {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @dev Emergency withdraw all funds
     */
    function emergencyWithdraw() external onlyCreator {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawFailed();
        
        (bool success, ) = creator.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit EmergencyWithdraw(creator, balance);
    }
    
    // ============ Receive ETH ============
    
    receive() external payable {}
}
