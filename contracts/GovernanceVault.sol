// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ITriVaultCore.sol";
import "./interfaces/IRewardsVault.sol";

/**
 * @title GovernanceVault
 * @dev Manages community governance for the TriVault ecosystem.
 *      Users can create proposals and vote based on their points and staking.
 */
contract GovernanceVault {
    // ============ Constants ============
    
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 100; // Min points to create proposal
    uint256 public constant MIN_VOTE_THRESHOLD = 10;      // Min points to vote
    uint256 public constant DEFAULT_VOTING_PERIOD = 3 days;
    uint256 public constant MIN_VOTING_PERIOD = 1 days;
    uint256 public constant MAX_VOTING_PERIOD = 7 days;
    uint256 public constant PROPOSAL_FEE = 0.0001 ether;
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    IRewardsVault public rewardsVault;
    address public immutable creator;
    
    // Action types
    bytes32 public constant ACTION_VOTE = keccak256("VOTE");
    bytes32 public constant ACTION_PROPOSAL = keccak256("PROPOSAL");
    
    // Proposal struct
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
        ProposalType proposalType;
        bytes data; // Optional data for execution
    }
    
    enum ProposalType {
        General,       // Just for discussion
        Parameter,     // Change protocol parameters
        Feature,       // Request new feature
        Allocation     // Allocate funds
    }
    
    // Storage
    bytes32[] public proposalIds;
    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => mapping(address => bool)) public voteDirection; // true = for, false = against
    mapping(address => bytes32[]) public userProposals;
    mapping(address => uint256) public userVoteCount;
    
    uint256 public totalProposals;
    uint256 public totalVotes;
    uint256 public proposalNonce;
    
    // Active proposals tracking
    bytes32[] public activeProposalIds;
    
    // ============ Events ============
    
    event ProposalCreated(
        bytes32 indexed id,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(bytes32 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(bytes32 indexed id);
    event ProposalCancelled(bytes32 indexed id);
    event RewardsVaultUpdated(address indexed newRewardsVault);
    
    // ============ Errors ============
    
    error OnlyCreator();
    error InsufficientPoints();
    error InsufficientFee();
    error ProposalNotFound();
    error ProposalNotActive();
    error ProposalAlreadyExecuted();
    error ProposalAlreadyCancelled();
    error AlreadyVoted();
    error VotingPeriodEnded();
    error VotingPeriodNotEnded();
    error InvalidVotingPeriod();
    error OnlyProposer();
    error ProposalFailed();
    
    // ============ Modifiers ============
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _core, address _creator) {
        core = ITriVaultCore(_core);
        creator = _creator;
    }
    
    // ============ Main Functions ============
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string calldata title,
        string calldata description,
        uint256 duration
    ) external payable returns (bytes32) {
        return createProposalWithType(title, description, duration, ProposalType.General, "");
    }
    
    /**
     * @dev Create a proposal with specific type
     */
    function createProposalWithType(
        string calldata title,
        string calldata description,
        uint256 duration,
        ProposalType proposalType,
        bytes calldata data
    ) public payable returns (bytes32) {
        // Check fee
        if (msg.value < PROPOSAL_FEE) revert InsufficientFee();
        
        // Check voting power
        uint256 votingPower = getUserVotingPower(msg.sender);
        if (votingPower < MIN_PROPOSAL_THRESHOLD) revert InsufficientPoints();
        
        // Validate duration
        if (duration == 0) duration = DEFAULT_VOTING_PERIOD;
        if (duration < MIN_VOTING_PERIOD || duration > MAX_VOTING_PERIOD) revert InvalidVotingPeriod();
        
        // Generate proposal ID
        proposalNonce++;
        bytes32 proposalId = keccak256(abi.encodePacked(msg.sender, block.timestamp, proposalNonce));
        
        // Create proposal
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            executed: false,
            cancelled: false,
            proposalType: proposalType,
            data: data
        });
        
        proposalIds.push(proposalId);
        activeProposalIds.push(proposalId);
        userProposals[msg.sender].push(proposalId);
        totalProposals++;
        
        // Record interaction
        core.recordInteraction(msg.sender, ACTION_PROPOSAL);
        
        // Forward fee to core
        core.distributeFees{value: msg.value}();
        
        emit ProposalCreated(proposalId, msg.sender, title, block.timestamp, block.timestamp + duration);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(bytes32 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        
        // Validate
        if (proposal.id == bytes32(0)) revert ProposalNotFound();
        if (proposal.cancelled) revert ProposalAlreadyCancelled();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (block.timestamp > proposal.endTime) revert VotingPeriodEnded();
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();
        
        // Check voting power
        uint256 votingPower = getUserVotingPower(msg.sender);
        if (votingPower < MIN_VOTE_THRESHOLD) revert InsufficientPoints();
        
        // Record vote
        hasVoted[proposalId][msg.sender] = true;
        voteDirection[proposalId][msg.sender] = support;
        userVoteCount[msg.sender]++;
        totalVotes++;
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        // Record interaction
        core.recordInteraction(msg.sender, ACTION_VOTE);
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @dev Execute a passed proposal
     */
    function executeProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == bytes32(0)) revert ProposalNotFound();
        if (proposal.cancelled) revert ProposalAlreadyCancelled();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (block.timestamp <= proposal.endTime) revert VotingPeriodNotEnded();
        if (proposal.forVotes <= proposal.againstVotes) revert ProposalFailed();
        
        proposal.executed = true;
        _removeFromActive(proposalId);
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or creator)
     */
    function cancelProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == bytes32(0)) revert ProposalNotFound();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (msg.sender != proposal.proposer && msg.sender != creator) revert OnlyProposer();
        
        proposal.cancelled = true;
        _removeFromActive(proposalId);
        
        emit ProposalCancelled(proposalId);
    }
    
    // ============ Internal Functions ============
    
    function _removeFromActive(bytes32 proposalId) internal {
        for (uint256 i = 0; i < activeProposalIds.length; i++) {
            if (activeProposalIds[i] == proposalId) {
                activeProposalIds[i] = activeProposalIds[activeProposalIds.length - 1];
                activeProposalIds.pop();
                break;
            }
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get user voting power based on points and stake
     */
    function getUserVotingPower(address user) public view returns (uint256) {
        uint256 power = 0;
        
        // Get points from rewards vault
        if (address(rewardsVault) != address(0)) {
            power += rewardsVault.getUserPoints(user);
            
            // Stakers get bonus voting power
            uint256 staked = rewardsVault.getStakedAmount(user);
            if (staked > 0) {
                // 1 ETH staked = 1000 voting power
                power += (staked * 1000) / 1 ether;
            }
        }
        
        // Base power from interactions
        (, , uint256 interactionCount) = core.getUserInfo(user);
        power += interactionCount * 10;
        
        return power;
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(bytes32 proposalId) external view returns (Proposal memory) {
        if (proposals[proposalId].id == bytes32(0)) revert ProposalNotFound();
        return proposals[proposalId];
    }
    
    /**
     * @dev Check if user has voted on proposal
     */
    function hasUserVoted(bytes32 proposalId, address user) external view returns (bool) {
        return hasVoted[proposalId][user];
    }
    
    /**
     * @dev Get active proposal IDs
     */
    function getActiveProposals() external view returns (bytes32[] memory) {
        // Filter for truly active proposals
        uint256 count = 0;
        for (uint256 i = 0; i < activeProposalIds.length; i++) {
            bytes32 id = activeProposalIds[i];
            if (proposals[id].endTime > block.timestamp && !proposals[id].cancelled && !proposals[id].executed) {
                count++;
            }
        }
        
        bytes32[] memory active = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeProposalIds.length; i++) {
            bytes32 id = activeProposalIds[i];
            if (proposals[id].endTime > block.timestamp && !proposals[id].cancelled && !proposals[id].executed) {
                active[index] = id;
                index++;
            }
        }
        
        return active;
    }
    
    /**
     * @dev Get all proposals for a user
     */
    function getUserProposals(address user) external view returns (bytes32[] memory) {
        return userProposals[user];
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalProposals,
        uint256 _totalVotes,
        uint256 _activeCount
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < activeProposalIds.length; i++) {
            bytes32 id = activeProposalIds[i];
            if (proposals[id].endTime > block.timestamp && !proposals[id].cancelled && !proposals[id].executed) {
                activeCount++;
            }
        }
        return (totalProposals, totalVotes, activeCount);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set the rewards vault address
     */
    function setRewardsVault(address _rewardsVault) external onlyCreator {
        rewardsVault = IRewardsVault(_rewardsVault);
        emit RewardsVaultUpdated(_rewardsVault);
    }
    
    /**
     * @dev Withdraw any stuck funds
     */
    function withdrawFunds() external onlyCreator {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = creator.call{value: balance}("");
            require(success, "Withdraw failed");
        }
    }
    
    // ============ Receive ETH ============
    
    receive() external payable {}
}
