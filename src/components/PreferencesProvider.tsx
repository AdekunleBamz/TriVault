'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  sounds: boolean;
  compactView: boolean;
  language: string;
  currency: string;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  notifications: true,
  sounds: true,
  compactView: false,
  language: 'en',
  currency: 'USD',
};

interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from storage on mount
  useEffect(() => {
    const stored = getStorageItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    if (stored) {
      setPreferences({ ...defaultPreferences, ...stored });
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to storage when they change
  useEffect(() => {
    if (isLoaded) {
      setStorageItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
    }
  }, [preferences, isLoaded]);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  return (
    <PreferencesContext.Provider
      value={{ preferences, updatePreference, resetPreferences }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

// Hook for individual preference
export function usePreference<K extends keyof UserPreferences>(
  key: K
): [UserPreferences[K], (value: UserPreferences[K]) => void] {
  const { preferences, updatePreference } = usePreferences();
  
  const setValue = useCallback(
    (value: UserPreferences[K]) => updatePreference(key, value),
    [key, updatePreference]
  );
  
  return [preferences[key], setValue];
}
