/**
 * Validation utilities for TriVault
 */

import { isAddress } from 'viem';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): ValidationResult {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (!address.startsWith('0x')) {
    return { isValid: false, error: 'Address must start with 0x' };
  }
  
  if (address.length !== 42) {
    return { isValid: false, error: 'Address must be 42 characters' };
  }
  
  if (!isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }
  
  return { isValid: true };
}

/**
 * Validate vault ID (0, 1, or 2)
 */
export function validateVaultId(vaultId: number): ValidationResult {
  if (typeof vaultId !== 'number') {
    return { isValid: false, error: 'Vault ID must be a number' };
  }
  
  if (!Number.isInteger(vaultId)) {
    return { isValid: false, error: 'Vault ID must be an integer' };
  }
  
  if (vaultId < 0 || vaultId > 2) {
    return { isValid: false, error: 'Vault ID must be 0, 1, or 2' };
  }
  
  return { isValid: true };
}

/**
 * Validate transaction hash
 */
export function validateTxHash(hash: string): ValidationResult {
  if (!hash) {
    return { isValid: false, error: 'Transaction hash is required' };
  }
  
  if (!hash.startsWith('0x')) {
    return { isValid: false, error: 'Transaction hash must start with 0x' };
  }
  
  if (hash.length !== 66) {
    return { isValid: false, error: 'Transaction hash must be 66 characters' };
  }
  
  const hexRegex = /^0x[a-fA-F0-9]{64}$/;
  if (!hexRegex.test(hash)) {
    return { isValid: false, error: 'Invalid transaction hash format' };
  }
  
  return { isValid: true };
}

/**
 * Validate ETH amount
 */
export function validateETHAmount(amount: string | number): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount exceeds maximum allowed' };
  }
  
  return { isValid: true };
}

/**
 * Validate username/display name
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 2) {
    return { isValid: false, error: 'Username must be at least 2 characters' };
  }
  
  if (username.length > 32) {
    return { isValid: false, error: 'Username must be 32 characters or less' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { isValid: true };
}

/**
 * Validate referral code
 */
export function validateReferralCode(code: string): ValidationResult {
  if (!code) {
    return { isValid: false, error: 'Referral code is required' };
  }
  
  if (code.length !== 8) {
    return { isValid: false, error: 'Referral code must be 8 characters' };
  }
  
  const codeRegex = /^[A-Z0-9]+$/;
  if (!codeRegex.test(code)) {
    return { isValid: false, error: 'Referral code must be uppercase letters and numbers only' };
  }
  
  return { isValid: true };
}

/**
 * Sanitize user input string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}
