// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GovernanceVault v1.1
 * @dev Manages proposals, voting, and governance for the TriVault ecosystem.
 * 
 * REMIX DEPLOYMENT GUIDE:
 * ========================
 * Order: Deploy FIFTH (Contract #5 - LAST)
 * 
 * Constructor Arguments:
 *   _core (address):    TriVaultCore address from Contract #1
 *   _creator (address): Your wallet address
 * 
 * Example: "0xTriVaultCoreAddress", "0xYourWalletAddress"
 * 
 * After deployment, save the address as GOVERNANCE_VAULT_ADDRESS
 * 
 * POST-DEPLOYMENT SETUP (on GovernanceVault):
 *   Call: setRewardsVault(REWARDS_VAULT_ADDRESS)
 */

// ============ Interfaces (Inlined for Remix) ============

interface ITriVaultCore {
    function recordInteraction(address user, bytes32 actionType) external;
    function isRegistered(address user) external view returns (bool);
}

interface IRewardsVault {
    function userPoints(address user) external view returns (uint256);
    function stakedAmount(address user) external view returns (uint256);
}

// ============ Main Contract ============

contract GovernanceVault {
    // ============ Enums & Structs ============
    
    enum ProposalState { Pending, Active, Passed, Rejected, Executed, Cancelled }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 createdAt;
        uint256 votingEnds;
        uint256 forVotes;
        uint256 againstVotes;
        ProposalState state;
        bytes32 actionType;
        bytes actionData;
        bool executed;
    }
    
    struct Vote {
        bool hasVoted;
        bool support;
        uint256 weight;
        uint256 votedAt;
    }
    
    // ============ Constants ============
    
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 100;
    uint256 public constant QUORUM_PERCENTAGE = 10;
    uint256 public constant EXECUTION_DELAY = 1 days;
    
    // ============ State Variables ============
    
    ITriVaultCore public immutable core;
    address public immutable creator;
    IRewardsVault public rewardsVault;
    
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256[]) public userProposals;
    mapping(address => uint256[]) public userVotes;
    
    uint256 public totalVotesCast;
    uint256 public totalProposalsCreated;
    
    bytes32 public constant ACTION_GENERAL = keccak256("GENERAL");
    bytes32 public constant ACTION_PARAMETER_CHANGE = keccak256("PARAMETER_CHANGE");
    bytes32 public constant ACTION_TREASURY = keccak256("TREASURY");
    bytes32 public constant ACTION_EMERGENCY = keccak256("EMERGENCY");
    
    // ============ Events ============
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalStateChanged(uint256 indexed proposalId, ProposalState newState);
    event ProposalExecuted(uint256 indexed proposalId);
    event RewardsVaultSet(address indexed rewardsVault);
    
    // ============ Errors ============
    
    error OnlyAuthorized();
    error OnlyCreator();
    error NotRegistered();
    error InsufficientVotingPower();
    error ProposalNotFound();
    error ProposalNotActive();
    error AlreadyVoted();
    error VotingNotEnded();
    error ProposalNotPassed();
    error AlreadyExecuted();
    error ExecutionDelayNotMet();
    error RewardsVaultNotSet();
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        if (msg.sender != address(core) && msg.sender != creator) revert OnlyAuthorized();
        _;
    }
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    modifier onlyRegistered() {
        if (!core.isRegistered(msg.sender)) revert NotRegistered();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _core, address _creator) {
        core = ITriVaultCore(_core);
        creator = _creator;
    }
    
    // ============ Setup ============
    
    function setRewardsVault(address _rewardsVault) external onlyCreator {
        rewardsVault = IRewardsVault(_rewardsVault);
        emit RewardsVaultSet(_rewardsVault);
    }
    
    // ============ Proposal Functions ============
    
    function createProposal(
        string calldata title,
        string calldata description,
        bytes32 actionType,
        bytes calldata actionData
    ) external onlyRegistered returns (uint256) {
        uint256 votingPower = getVotingPower(msg.sender);
        if (votingPower < MIN_PROPOSAL_THRESHOLD) revert InsufficientVotingPower();
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            createdAt: block.timestamp,
            votingEnds: block.timestamp + VOTING_PERIOD,
            forVotes: 0,
            againstVotes: 0,
            state: ProposalState.Active,
            actionType: actionType,
            actionData: actionData,
            executed: false
        });
        
        userProposals[msg.sender].push(proposalId);
        totalProposalsCreated++;
        
        emit ProposalCreated(proposalId, msg.sender, title);
        emit ProposalStateChanged(proposalId, ProposalState.Active);
        
        core.recordInteraction(msg.sender, keccak256("PROPOSAL"));
        
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external onlyRegistered {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (proposal.state != ProposalState.Active) revert ProposalNotActive();
        if (block.timestamp > proposal.votingEnds) revert ProposalNotActive();
        if (votes[proposalId][msg.sender].hasVoted) revert AlreadyVoted();
        
        uint256 weight = getVotingPower(msg.sender);
        
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            support: support,
            weight: weight,
            votedAt: block.timestamp
        });
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        userVotes[msg.sender].push(proposalId);
        totalVotesCast++;
        
        emit VoteCast(proposalId, msg.sender, support, weight);
        
        core.recordInteraction(msg.sender, keccak256("VOTE"));
    }
    
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (proposal.state != ProposalState.Active) revert ProposalNotActive();
        if (block.timestamp <= proposal.votingEnds) revert VotingNotEnded();
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        
        if (proposal.forVotes > proposal.againstVotes && totalVotes >= getQuorumVotes()) {
            proposal.state = ProposalState.Passed;
        } else {
            proposal.state = ProposalState.Rejected;
        }
        
        emit ProposalStateChanged(proposalId, proposal.state);
    }
    
    function executeProposal(uint256 proposalId) external onlyCreator {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (proposal.state != ProposalState.Passed) revert ProposalNotPassed();
        if (proposal.executed) revert AlreadyExecuted();
        if (block.timestamp < proposal.votingEnds + EXECUTION_DELAY) revert ExecutionDelayNotMet();
        
        proposal.executed = true;
        proposal.state = ProposalState.Executed;
        
        emit ProposalExecuted(proposalId);
        emit ProposalStateChanged(proposalId, ProposalState.Executed);
    }
    
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.id == 0) revert ProposalNotFound();
        if (msg.sender != proposal.proposer && msg.sender != creator) revert OnlyAuthorized();
        if (proposal.state == ProposalState.Executed) revert AlreadyExecuted();
        
        proposal.state = ProposalState.Cancelled;
        
        emit ProposalStateChanged(proposalId, ProposalState.Cancelled);
    }
    
    // ============ Voting Power ============
    
    function getVotingPower(address user) public view returns (uint256) {
        if (address(rewardsVault) == address(0)) {
            return core.isRegistered(user) ? 1 : 0;
        }
        
        uint256 points = rewardsVault.userPoints(user);
        uint256 staked = rewardsVault.stakedAmount(user);
        
        uint256 power = 1;
        power += points / 100;
        power += staked / 0.01 ether;
        
        return power;
    }
    
    function getQuorumVotes() public view returns (uint256) {
        return (totalVotesCast * QUORUM_PERCENTAGE) / 100;
    }
    
    // ============ View Functions ============
    
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory title,
        string memory description,
        uint256 createdAt,
        uint256 votingEnds,
        uint256 forVotes,
        uint256 againstVotes,
        ProposalState state,
        bool executed
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.title,
            p.description,
            p.createdAt,
            p.votingEnds,
            p.forVotes,
            p.againstVotes,
            p.state,
            p.executed
        );
    }
    
    function getUserVote(uint256 proposalId, address user) external view returns (
        bool hasVoted,
        bool support,
        uint256 weight,
        uint256 votedAt
    ) {
        Vote storage v = votes[proposalId][user];
        return (v.hasVoted, v.support, v.weight, v.votedAt);
    }
    
    function getUserProposals(address user) external view returns (uint256[] memory) {
        return userProposals[user];
    }
    
    function getUserVotes(address user) external view returns (uint256[] memory) {
        return userVotes[user];
    }
    
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].state == ProposalState.Active && block.timestamp <= proposals[i].votingEnds) {
                activeCount++;
            }
        }
        
        uint256[] memory activeProposals = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].state == ProposalState.Active && block.timestamp <= proposals[i].votingEnds) {
                activeProposals[index] = i;
                index++;
            }
        }
        
        return activeProposals;
    }
    
    function getStats() external view returns (
        uint256 _proposalCount,
        uint256 _totalVotesCast,
        uint256 _totalProposalsCreated
    ) {
        return (proposalCount, totalVotesCast, totalProposalsCreated);
    }
}
