'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { type Address, type Log } from 'viem';
import { usePublicClient } from 'wagmi';

interface UseContractEventOptions {
  address: Address;
  abi: readonly unknown[];
  eventName: string;
  onLog?: (log: Log) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

/**
 * Hook to listen to contract events in real-time
 */
export function useContractEvent({
  address,
  abi,
  eventName,
  onLog,
  onError,
  enabled = true,
}: UseContractEventOptions) {
  const publicClient = usePublicClient();
  const onLogRef = useRef(onLog);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onLogRef.current = onLog;
    onErrorRef.current = onError;
  }, [onLog, onError]);

  useEffect(() => {
    if (!enabled || !publicClient) return;

    let unwatch: (() => void) | undefined;

    try {
      unwatch = publicClient.watchContractEvent({
        address,
        abi,
        eventName,
        onLogs: (logs) => {
          logs.forEach((log) => {
            onLogRef.current?.(log);
          });
        },
        onError: (error) => {
          onErrorRef.current?.(error);
        },
      });
    } catch (error) {
      onErrorRef.current?.(error as Error);
    }

    return () => {
      unwatch?.();
    };
  }, [address, abi, eventName, enabled, publicClient]);
}

interface EventLog {
  log: Log;
  timestamp: number;
}

/**
 * Hook to collect and store recent contract events
 */
export function useContractEventHistory({
  address,
  abi,
  eventName,
  maxLogs = 50,
  enabled = true,
}: Omit<UseContractEventOptions, 'onLog' | 'onError'> & {
  maxLogs?: number;
}) {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const handleLog = useCallback(
    (log: Log) => {
      setLogs((prevLogs) => {
        const newLog: EventLog = {
          log,
          timestamp: Date.now(),
        };
        const updated = [newLog, ...prevLogs];
        // Keep only the most recent logs
        return updated.slice(0, maxLogs);
      });
    },
    [maxLogs]
  );

  const handleError = useCallback((err: Error) => {
    setError(err);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
  }, []);

  useContractEvent({
    address,
    abi,
    eventName,
    onLog: handleLog,
    onError: handleError,
    enabled,
  });

  return {
    logs,
    error,
    clearLogs,
    latestLog: logs[0] ?? null,
    logCount: logs.length,
  };
}

/**
 * Hook to watch for block changes
 */
export function useBlockWatcher(
  onBlock?: (blockNumber: bigint) => void,
  enabled: boolean = true
) {
  const publicClient = usePublicClient();
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);
  const onBlockRef = useRef(onBlock);

  useEffect(() => {
    onBlockRef.current = onBlock;
  }, [onBlock]);

  useEffect(() => {
    if (!enabled || !publicClient) return;

    const unwatch = publicClient.watchBlockNumber({
      onBlockNumber: (blockNumber) => {
        setLatestBlock(blockNumber);
        onBlockRef.current?.(blockNumber);
      },
    });

    return () => {
      unwatch();
    };
  }, [enabled, publicClient]);

  return latestBlock;
}

export default useContractEvent;
