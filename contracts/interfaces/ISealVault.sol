// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISealVault
 * @dev Interface for the SealVault contract
 */
interface ISealVault {
    function collectSeal(uint8 sealType) external payable;
    function getUserSeals(address user) external view returns (bool[5] memory);
    function hasAllSeals(address user) external view returns (bool);
    function getSealCount(address user) external view returns (uint256);
    function getTotalSealsCollected() external view returns (uint256);
}
