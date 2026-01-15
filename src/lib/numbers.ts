/**
 * Number and currency formatting utilities for TriVault
 */

import { formatEther, parseEther } from 'viem';

/**
 * Format ETH value with specified decimals
 */
export function formatETH(value: bigint, decimals: number = 6): string {
  const formatted = formatEther(value);
  const num = parseFloat(formatted);
  
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Format ETH with symbol
 */
export function formatETHWithSymbol(value: bigint, decimals: number = 6): string {
  return `${formatETH(value, decimals)} ETH`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });
  
  return formatter.format(value);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format percentage change with +/- sign
 */
export function formatPercentageChange(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format USD currency
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Parse ETH string to bigint
 */
export function parseETHValue(value: string): bigint {
  try {
    return parseEther(value);
  } catch {
    return BigInt(0);
  }
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format rank with medal emoji
 */
export function formatRankWithMedal(rank: number): string {
  const medals: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };
  
  return medals[rank] || `#${rank}`;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to nearest step
 */
export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Calculate gas estimate in ETH
 */
export function estimateGas(gasLimit: bigint, gasPrice: bigint): bigint {
  return gasLimit * gasPrice;
}

/**
 * Format gas price in Gwei
 */
export function formatGwei(value: bigint): string {
  const gwei = Number(value) / 1e9;
  return `${gwei.toFixed(2)} Gwei`;
}
