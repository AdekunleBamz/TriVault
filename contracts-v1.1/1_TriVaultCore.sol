// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TriVaultCore v1.1
 * @dev Central controller and registry for the TriVault ecosystem.
 *      Coordinates interactions between all 5 contracts and manages permissions.
 * 
 * REMIX DEPLOYMENT GUIDE:
 * ========================
 * Order: Deploy FIRST (Contract #1)
 * 
 * Constructor Arguments:
 *   _creator (address): Your wallet address
 * 
 * Example: "0xYourWalletAddress"
 * 
 * After deployment, save the address as TRIVAULT_CORE_ADDRESS
 */

// ============ Interfaces (Inlined for Remix) ============

interface IRewardsVault {
    function onInteraction(address user, bytes32 actionType) external;
}

interface IAchievementVault {
    function onUserRegistered(address user) external;
    function checkMilestone(address user, bytes32 actionType, uint256 count) external;
}

// ============ Main Contract ============

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
    
    function registerUser() external whenNotPaused {
        if (isRegistered[msg.sender]) revert AlreadyRegistered();
        
        isRegistered[msg.sender] = true;
        userRegistrationTime[msg.sender] = block.timestamp;
        totalUsersRegistered++;
        
        emit UserRegistered(msg.sender, block.timestamp);
        
        if (achievementVault != address(0)) {
            IAchievementVault(achievementVault).onUserRegistered(msg.sender);
        }
    }
    
    function recordInteraction(
        address user,
        bytes32 actionType
    ) external onlyAuthorized whenNotPaused {
        if (!isRegistered[user]) {
            isRegistered[user] = true;
            userRegistrationTime[user] = block.timestamp;
            totalUsersRegistered++;
            emit UserRegistered(user, block.timestamp);
        }
        
        userInteractionCount[user]++;
        totalInteractions++;
        
        emit InteractionRecorded(user, msg.sender, actionType, block.timestamp);
        
        if (rewardsVault != address(0)) {
            IRewardsVault(rewardsVault).onInteraction(user, actionType);
        }
        
        if (achievementVault != address(0)) {
            IAchievementVault(achievementVault).checkMilestone(user, actionType, userInteractionCount[user]);
        }
    }
    
    // ============ Fee Management ============
    
    function distributeFees() external payable {
        uint256 amount = msg.value;
        if (amount == 0) return;
        
        totalFeesCollected += amount;
        
        uint256 protocolAmount = (amount * protocolFeePercent) / 100;
        uint256 rewardsAmount = amount - protocolAmount;
        
        if (rewardsVault != address(0) && rewardsAmount > 0) {
            (bool success, ) = rewardsVault.call{value: rewardsAmount}("");
            if (!success) {
                rewardsAmount = 0;
            }
        }
        
        emit FeesDistributed(protocolAmount, rewardsAmount);
    }
    
    function setProtocolFeePercent(uint256 _percent) external onlyCreator {
        if (_percent > 100) revert InvalidPercentage();
        protocolFeePercent = _percent;
    }
    
    // ============ Contract Registry ============
    
    function setSealVault(address _sealVault) external onlyCreator {
        address old = sealVault;
        sealVault = _sealVault;
        authorizedContracts[_sealVault] = true;
        emit ContractUpdated("SealVault", old, _sealVault);
    }
    
    function setRewardsVault(address _rewardsVault) external onlyCreator {
        address old = rewardsVault;
        rewardsVault = _rewardsVault;
        authorizedContracts[_rewardsVault] = true;
        emit ContractUpdated("RewardsVault", old, _rewardsVault);
    }
    
    function setAchievementVault(address _achievementVault) external onlyCreator {
        address old = achievementVault;
        achievementVault = _achievementVault;
        authorizedContracts[_achievementVault] = true;
        emit ContractUpdated("AchievementVault", old, _achievementVault);
    }
    
    function setGovernanceVault(address _governanceVault) external onlyCreator {
        address old = governanceVault;
        governanceVault = _governanceVault;
        authorizedContracts[_governanceVault] = true;
        emit ContractUpdated("GovernanceVault", old, _governanceVault);
    }
    
    function setAuthorized(address _contract, bool _authorized) external onlyCreator {
        authorizedContracts[_contract] = _authorized;
        emit ContractAuthorized(_contract, _authorized);
    }
    
    // ============ View Functions ============
    
    function getContracts() external view returns (
        address _sealVault,
        address _rewardsVault,
        address _achievementVault,
        address _governanceVault
    ) {
        return (sealVault, rewardsVault, achievementVault, governanceVault);
    }
    
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
    
    function getStats() external view returns (
        uint256 users,
        uint256 interactions,
        uint256 fees
    ) {
        return (totalUsersRegistered, totalInteractions, totalFeesCollected);
    }
    
    // ============ Admin Functions ============
    
    function pause() external onlyCreator {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyCreator {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function emergencyWithdraw() external onlyCreator {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawFailed();
        
        (bool success, ) = creator.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit EmergencyWithdraw(creator, balance);
    }
    
    receive() external payable {}
}
