// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAchievementVault
 * @dev Interface for the AchievementVault contract
 */
interface IAchievementVault {
    function onUserRegistered(address user) external;
    function checkMilestone(address user, bytes32 actionType, uint256 count) external;
    function unlockAchievement(address user, bytes32 achievementId) external;
    function getUserAchievements(address user) external view returns (bytes32[] memory);
    function hasAchievement(address user, bytes32 achievementId) external view returns (bool);
    function getAchievementCount(address user) external view returns (uint256);
    function getTotalAchievementsUnlocked() external view returns (uint256);
}
