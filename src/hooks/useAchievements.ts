'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';
import {
  Achievement,
  ACHIEVEMENTS,
  getUnlockedAchievements,
  getNextAchievement,
} from '@/lib/achievements';

interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  newAchievements: Achievement[];
  nextAchievement: Achievement | null;
  progress: number;
  markAsViewed: (achievementIds: string[]) => void;
  checkAchievements: (sealCount: number) => Achievement[];
}

/**
 * Hook for managing user achievements
 */
export function useAchievements(sealCount: number = 0): UseAchievementsReturn {
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  // Load viewed achievements from storage on mount
  useEffect(() => {
    const stored = getStorageItem<string[]>(STORAGE_KEYS.VIEWED_ACHIEVEMENTS);
    if (stored) {
      setViewedIds(stored);
    }
  }, []);

  const unlockedAchievements = useMemo(() => {
    return getUnlockedAchievements(sealCount);
  }, [sealCount]);

  const lockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(
      (a) => !unlockedAchievements.find((u) => u.id === a.id)
    );
  }, [unlockedAchievements]);

  const newAchievements = useMemo(() => {
    return unlockedAchievements.filter((a) => !viewedIds.includes(a.id));
  }, [unlockedAchievements, viewedIds]);

  const nextAchievement = useMemo(() => {
    return getNextAchievement(sealCount);
  }, [sealCount]);

  const progress = useMemo(() => {
    return (unlockedAchievements.length / ACHIEVEMENTS.length) * 100;
  }, [unlockedAchievements]);

  const markAsViewed = useCallback((achievementIds: string[]) => {
    setViewedIds((prev) => {
      const updated = [...new Set([...prev, ...achievementIds])];
      setStorageItem(STORAGE_KEYS.VIEWED_ACHIEVEMENTS, updated);
      return updated;
    });
  }, []);

  const checkAchievements = useCallback((newSealCount: number): Achievement[] => {
    const current = getUnlockedAchievements(newSealCount);
    const previous = getUnlockedAchievements(sealCount);
    
    // Find newly unlocked achievements
    return current.filter(
      (a) => !previous.find((p) => p.id === a.id)
    );
  }, [sealCount]);

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    lockedAchievements,
    newAchievements,
    nextAchievement,
    progress,
    markAsViewed,
    checkAchievements,
  };
}
