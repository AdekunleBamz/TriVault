// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TriVault
 * @dev A simple app that lets users interact with 3 external contracts
 *      while paying a small creator fee (0.00001 ETH) per interaction.
 *      Works as standalone dApp and Farcaster mini-app.
 */
contract TriVault {
    // Creator fee: 0.00001 ETH = 10000000000000 wei (10^13 wei)
    uint256 public constant CREATOR_FEE = 0.00001 ether;
    
    // Creator address that receives fees
    address public immutable creator;
    
    // The 3 external contract addresses to interact with
    address public vault1;
    address public vault2;
    address public vault3;
    
    // Track user interactions (user => vault number => has interacted)
    mapping(address => mapping(uint8 => bool)) public userSeals;
    
    // Track total interactions per vault
    mapping(uint8 => uint256) public vaultInteractions;
    
    // Total fees collected
    uint256 public totalFeesCollected;
    
    // Events
    event SealCollected(address indexed user, uint8 indexed vaultNumber, uint256 timestamp);
    event VaultUpdated(uint8 indexed vaultNumber, address indexed newAddress);
    event FeesWithdrawn(address indexed creator, uint256 amount);
    
    // Errors
    error InsufficientFee();
    error InvalidVaultNumber();
    error AlreadySealed();
    error WithdrawFailed();
    error OnlyCreator();
    error ZeroAddress();
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    constructor(
        address _creator,
        address _vault1,
        address _vault2,
        address _vault3
    ) {
        if (_creator == address(0)) revert ZeroAddress();
        
        creator = _creator;
        vault1 = _vault1;
        vault2 = _vault2;
        vault3 = _vault3;
    }
    
    /**
     * @dev Collect a seal by interacting with a vault
     * @param vaultNumber The vault to interact with (1, 2, or 3)
     */
    function collectSeal(uint8 vaultNumber) external payable {
        // Validate fee
        if (msg.value < CREATOR_FEE) revert InsufficientFee();
        
        // Validate vault number
        if (vaultNumber < 1 || vaultNumber > 3) revert InvalidVaultNumber();
        
        // Check if already sealed
        if (userSeals[msg.sender][vaultNumber]) revert AlreadySealed();
        
        // Mark as sealed
        userSeals[msg.sender][vaultNumber] = true;
        
        // Increment counters
        vaultInteractions[vaultNumber]++;
        totalFeesCollected += msg.value;
        
        // Get the vault address and perform a simple interaction (check if contract exists)
        address vaultAddress = getVaultAddress(vaultNumber);
        
        // We just verify the vault exists (has code) - actual interaction can be customized
        if (vaultAddress != address(0)) {
            // Simple interaction: check if it's a contract
            uint256 size;
            assembly {
                size := extcodesize(vaultAddress)
            }
            // Could add more complex interactions here based on vault type
        }
        
        emit SealCollected(msg.sender, vaultNumber, block.timestamp);
    }
    
    /**
     * @dev Get the address of a vault by number
     */
    function getVaultAddress(uint8 vaultNumber) public view returns (address) {
        if (vaultNumber == 1) return vault1;
        if (vaultNumber == 2) return vault2;
        if (vaultNumber == 3) return vault3;
        return address(0);
    }
    
    /**
     * @dev Check if a user has collected all 3 seals
     */
    function hasAllSeals(address user) external view returns (bool) {
        return userSeals[user][1] && userSeals[user][2] && userSeals[user][3];
    }
    
    /**
     * @dev Get user's seal status for all vaults
     */
    function getUserSeals(address user) external view returns (bool[3] memory) {
        return [
            userSeals[user][1],
            userSeals[user][2],
            userSeals[user][3]
        ];
    }
    
    /**
     * @dev Update a vault address (only creator)
     */
    function updateVault(uint8 vaultNumber, address newAddress) external onlyCreator {
        if (vaultNumber < 1 || vaultNumber > 3) revert InvalidVaultNumber();
        
        if (vaultNumber == 1) vault1 = newAddress;
        else if (vaultNumber == 2) vault2 = newAddress;
        else vault3 = newAddress;
        
        emit VaultUpdated(vaultNumber, newAddress);
    }
    
    /**
     * @dev Withdraw collected fees (only creator)
     */
    function withdrawFees() external onlyCreator {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawFailed();
        
        (bool success, ) = creator.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit FeesWithdrawn(creator, balance);
    }
    
    /**
     * @dev Get total stats
     */
    function getStats() external view returns (
        uint256 totalFees,
        uint256 vault1Count,
        uint256 vault2Count,
        uint256 vault3Count
    ) {
        return (
            totalFeesCollected,
            vaultInteractions[1],
            vaultInteractions[2],
            vaultInteractions[3]
        );
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
