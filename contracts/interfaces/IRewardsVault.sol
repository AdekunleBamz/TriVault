// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRewardsVault
 * @dev Interface for the RewardsVault contract
 */
interface IRewardsVault {
    function onInteraction(address user, bytes32 actionType) external;
    function claimRewards() external;
    function getClaimableRewards(address user) external view returns (uint256);
    function getUserPoints(address user) external view returns (uint256);
    function stake() external payable;
    function unstake(uint256 amount) external;
    function getStakedAmount(address user) external view returns (uint256);
}
