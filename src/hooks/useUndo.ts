'use client';

import { useState, useCallback, useRef } from 'react';

interface UndoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoOptions {
  maxHistory?: number;
}

/**
 * Hook for undo/redo functionality
 */
export function useUndo<T>(
  initialState: T,
  options: UseUndoOptions = {}
): {
  state: T;
  set: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  reset: (newState?: T) => void;
  canUndo: boolean;
  canRedo: boolean;
  history: UndoState<T>;
} {
  const { maxHistory = 100 } = options;

  const [history, setHistory] = useState<UndoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((current) => {
        const resolvedState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(current.present)
            : newState;

        // Don't add to history if state hasn't changed
        if (Object.is(resolvedState, current.present)) {
          return current;
        }

        const newPast = [...current.past, current.present].slice(-maxHistory);

        return {
          past: newPast,
          present: resolvedState,
          future: [],
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback(
    (newState?: T) => {
      setHistory({
        past: [],
        present: newState ?? initialState,
        future: [],
      });
    },
    [initialState]
  );

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    history,
  };
}

/**
 * Hook for managing undo with keyboard shortcuts
 */
export function useUndoWithShortcuts<T>(
  initialState: T,
  options: UseUndoOptions = {}
) {
  const undoState = useUndo(initialState, options);
  const { undo, redo, canUndo, canRedo } = undoState;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }

      // Windows/Linux: Ctrl+Y for redo
      if (!isMac && e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    },
    [undo, redo, canUndo, canRedo]
  );

  return {
    ...undoState,
    handleKeyDown,
  };
}

/**
 * Hook for tracking state changes with timestamps
 */
export function useStateHistory<T>(
  initialState: T,
  options: { maxHistory?: number } = {}
): {
  state: T;
  set: (newState: T) => void;
  history: { state: T; timestamp: number }[];
  clearHistory: () => void;
  goToIndex: (index: number) => void;
} {
  const { maxHistory = 50 } = options;
  const [state, setState] = useState(initialState);
  const historyRef = useRef<{ state: T; timestamp: number }[]>([
    { state: initialState, timestamp: Date.now() },
  ]);

  const set = useCallback(
    (newState: T) => {
      setState(newState);
      historyRef.current = [
        ...historyRef.current.slice(-maxHistory + 1),
        { state: newState, timestamp: Date.now() },
      ];
    },
    [maxHistory]
  );

  const clearHistory = useCallback(() => {
    historyRef.current = [{ state, timestamp: Date.now() }];
  }, [state]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < historyRef.current.length) {
      setState(historyRef.current[index].state);
    }
  }, []);

  return {
    state,
    set,
    history: historyRef.current,
    clearHistory,
    goToIndex,
  };
}

/**
 * Create a checkpoint-based undo system
 */
export function useCheckpoints<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const checkpointsRef = useRef<Map<string, T>>(new Map());

  const createCheckpoint = useCallback(
    (name: string) => {
      checkpointsRef.current.set(name, state);
    },
    [state]
  );

  const restoreCheckpoint = useCallback((name: string) => {
    const checkpoint = checkpointsRef.current.get(name);
    if (checkpoint !== undefined) {
      setState(checkpoint);
      return true;
    }
    return false;
  }, []);

  const deleteCheckpoint = useCallback((name: string) => {
    return checkpointsRef.current.delete(name);
  }, []);

  const listCheckpoints = useCallback(() => {
    return Array.from(checkpointsRef.current.keys());
  }, []);

  return {
    state,
    setState,
    createCheckpoint,
    restoreCheckpoint,
    deleteCheckpoint,
    listCheckpoints,
  };
}

export default useUndo;
