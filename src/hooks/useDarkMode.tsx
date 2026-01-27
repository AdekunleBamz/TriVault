'use client';

import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ColorMode = 'light' | 'dark' | 'system';

export interface DarkModeConfig {
  defaultMode?: ColorMode;
  storageKey?: string;
  attribute?: 'class' | 'data-theme' | 'data-mode';
  onChange?: (isDark: boolean, mode: ColorMode) => void;
}

export interface DarkModeState {
  mode: ColorMode;
  isDark: boolean;
  isSystem: boolean;
  systemPreference: 'light' | 'dark';
}

export interface DarkModeActions {
  setMode: (mode: ColorMode) => void;
  toggle: () => void;
  setLight: () => void;
  setDark: () => void;
  setSystem: () => void;
}

export type UseDarkModeReturn = DarkModeState & DarkModeActions;

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'trivault-color-mode';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

// ============================================================================
// Utilities
// ============================================================================

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function getStoredMode(key: string): ColorMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

function setStoredMode(key: string, mode: ColorMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, mode);
  } catch {
    // Storage not available
  }
}

function applyMode(
  isDark: boolean,
  attribute: 'class' | 'data-theme' | 'data-mode'
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  switch (attribute) {
    case 'class':
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      break;
    case 'data-theme':
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      break;
    case 'data-mode':
      root.setAttribute('data-mode', isDark ? 'dark' : 'light');
      break;
  }
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook for managing dark mode with system preference support
 */
export function useDarkMode(config: DarkModeConfig = {}): UseDarkModeReturn {
  const {
    defaultMode = 'system',
    storageKey = STORAGE_KEY,
    attribute = 'class',
    onChange,
  } = config;

  const [mode, setModeState] = useState<ColorMode>(() => {
    const stored = getStoredMode(storageKey);
    return stored ?? defaultMode;
  });

  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(
    getSystemPreference
  );

  // Calculate if dark mode is active
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemPreference === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemPreference]);

  const isSystem = mode === 'system';

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(MEDIA_QUERY);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply mode to DOM and storage
  useEffect(() => {
    applyMode(isDark, attribute);
    setStoredMode(storageKey, mode);
    onChange?.(isDark, mode);
  }, [isDark, mode, attribute, storageKey, onChange]);

  // Actions
  const setMode = useCallback((newMode: ColorMode) => {
    setModeState(newMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState((current) => {
      if (current === 'system') {
        return systemPreference === 'dark' ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemPreference]);

  const setLight = useCallback(() => setModeState('light'), []);
  const setDark = useCallback(() => setModeState('dark'), []);
  const setSystem = useCallback(() => setModeState('system'), []);

  return {
    mode,
    isDark,
    isSystem,
    systemPreference,
    setMode,
    toggle,
    setLight,
    setDark,
    setSystem,
  };
}

// ============================================================================
// Context-based Dark Mode
// ============================================================================

const DarkModeContext = createContext<UseDarkModeReturn | null>(null);

export interface DarkModeProviderProps extends DarkModeConfig {
  children: ReactNode;
}

/**
 * Provider for dark mode context
 */
export function DarkModeProvider({
  children,
  ...config
}: DarkModeProviderProps) {
  const darkMode = useDarkMode(config);

  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
}

/**
 * Hook to access dark mode from context
 */
export function useDarkModeContext(): UseDarkModeReturn {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkModeContext must be used within DarkModeProvider');
  }
  return context;
}

// ============================================================================
// SSR-Safe Initialization Script
// ============================================================================

/**
 * Script to prevent flash of wrong theme on page load
 * Include this in your HTML head
 */
export function getDarkModeScript(
  storageKey: string = STORAGE_KEY,
  attribute: 'class' | 'data-theme' | 'data-mode' = 'class',
  defaultMode: ColorMode = 'system'
): string {
  return `
    (function() {
      try {
        var stored = localStorage.getItem('${storageKey}');
        var mode = stored || '${defaultMode}';
        var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var root = document.documentElement;
        ${
          attribute === 'class'
            ? `root.classList.remove('light', 'dark'); root.classList.add(isDark ? 'dark' : 'light');`
            : `root.setAttribute('${attribute}', isDark ? 'dark' : 'light');`
        }
      } catch (e) {}
    })();
  `.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// Theme Toggle Component
// ============================================================================

export interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Ready-to-use theme toggle button
 */
export function ThemeToggleButton({
  className = '',
  showLabel = false,
  size = 'md',
}: ThemeToggleButtonProps) {
  const { isDark, toggle, mode } = useDarkMode();

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${sizeClasses[size]} ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {showLabel && (
        <span className="ml-2 capitalize">
          {mode === 'system' ? 'Auto' : mode}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default useDarkMode;
