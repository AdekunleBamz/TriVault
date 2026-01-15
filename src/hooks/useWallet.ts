'use client';

import { useCallback, useState } from 'react';
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: `0x${string}` | undefined;
  balance: bigint | undefined;
  chainId: number | undefined;
  isCorrectChain: boolean;
}

interface UseWalletReturn extends WalletState {
  switchToBase: () => Promise<void>;
  isSwitching: boolean;
  error: Error | null;
}

/**
 * Hook for wallet connection and chain management
 */
export function useWallet(): UseWalletReturn {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: balanceData } = useBalance({ address });
  const [error, setError] = useState<Error | null>(null);

  const isCorrectChain = chainId === base.id;

  const switchToBase = useCallback(async () => {
    try {
      setError(null);
      switchChain({ chainId: base.id });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch chain'));
    }
  }, [switchChain]);

  return {
    isConnected,
    isConnecting,
    address,
    balance: balanceData?.value,
    chainId,
    isCorrectChain,
    switchToBase,
    isSwitching,
    error,
  };
}
