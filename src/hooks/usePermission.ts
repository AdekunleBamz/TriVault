'use client';

import { useState, useEffect, useCallback } from 'react';

type BrowserPermissionName = 
  | 'geolocation'
  | 'notifications'
  | 'push'
  | 'midi'
  | 'camera'
  | 'microphone'
  | 'speaker-selection'
  | 'device-info'
  | 'background-fetch'
  | 'background-sync'
  | 'bluetooth'
  | 'persistent-storage'
  | 'ambient-light-sensor'
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'screen-wake-lock'
  | 'nfc'
  | 'display-capture';

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable';

interface UsePermissionReturn {
  state: PermissionState;
  isGranted: boolean;
  isDenied: boolean;
  isPrompt: boolean;
  isLoading: boolean;
  error: Error | null;
  request: () => Promise<PermissionState>;
}

/**
 * Hook for checking and requesting browser permissions
 */
export function usePermission(permissionName: BrowserPermissionName): UsePermissionReturn {
  const [state, setState] = useState<PermissionState>('prompt');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      setState('unavailable');
      setIsLoading(false);
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    const checkPermission = async () => {
      try {
        permissionStatus = await navigator.permissions.query({
          name: permissionName as globalThis.PermissionName,
        });
        
        setState(permissionStatus.state);
        
        const handleChange = () => {
          if (permissionStatus) {
            setState(permissionStatus.state);
          }
        };

        permissionStatus.addEventListener('change', handleChange);
        setIsLoading(false);

        return () => {
          permissionStatus?.removeEventListener('change', handleChange);
        };
      } catch (err) {
        // Some permissions might not be queryable
        setState('unavailable');
        setError(err instanceof Error ? err : new Error('Permission check failed'));
        setIsLoading(false);
      }
    };

    checkPermission();

    return () => {
      permissionStatus = null;
    };
  }, [permissionName]);

  const request = useCallback(async (): Promise<PermissionState> => {
    if (typeof navigator === 'undefined') {
      return 'unavailable';
    }

    try {
      switch (permissionName) {
        case 'notifications': {
          const result = await Notification.requestPermission();
          const newState = result === 'default' ? 'prompt' : result;
          setState(newState);
          return newState;
        }
        case 'geolocation': {
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => {
                setState('granted');
                resolve('granted');
              },
              (err) => {
                const newState = err.code === 1 ? 'denied' : 'prompt';
                setState(newState);
                resolve(newState);
              }
            );
          });
        }
        case 'camera':
        case 'microphone': {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: permissionName === 'camera',
              audio: permissionName === 'microphone',
            });
            stream.getTracks().forEach((track) => track.stop());
            setState('granted');
            return 'granted';
          } catch {
            setState('denied');
            return 'denied';
          }
        }
        case 'clipboard-read':
        case 'clipboard-write': {
          try {
            if (permissionName === 'clipboard-read') {
              await navigator.clipboard.readText();
            } else {
              await navigator.clipboard.writeText('');
            }
            setState('granted');
            return 'granted';
          } catch {
            setState('denied');
            return 'denied';
          }
        }
        default:
          return state;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Permission request failed'));
      return 'denied';
    }
  }, [permissionName, state]);

  return {
    state,
    isGranted: state === 'granted',
    isDenied: state === 'denied',
    isPrompt: state === 'prompt',
    isLoading,
    error,
    request,
  };
}

/**
 * Hook for geolocation permission and data
 */
export function useGeolocation(options: PositionOptions = {}) {
  const permission = usePermission('geolocation');
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geoError, setGeoError] = useState<GeolocationPositionError | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setGeoError(null);
      },
      (err) => {
        setGeoError(err);
      },
      options
    );
  }, [options]);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return undefined;

    setIsWatching(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        setGeoError(null);
      },
      (err) => {
        setGeoError(err);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(id);
      setIsWatching(false);
    };
  }, [options]);

  return {
    ...permission,
    position,
    error: geoError || permission.error,
    isWatching,
    getPosition,
    watchPosition,
    coordinates: position?.coords ?? null,
  };
}

/**
 * Hook for notification permission
 */
export function useNotificationPermission() {
  const permission = usePermission('notifications');

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission.isGranted && typeof Notification !== 'undefined') {
        return new Notification(title, options);
      }
      return null;
    },
    [permission.isGranted]
  );

  return {
    ...permission,
    sendNotification,
    isSupported: typeof Notification !== 'undefined',
  };
}

/**
 * Hook for screen wake lock
 */
export function useScreenWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      throw new Error('Wake Lock API not supported');
    }

    try {
      const sentinel = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
      setWakeLock(sentinel);
      setIsLocked(true);

      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        setWakeLock(null);
      });

      return sentinel;
    } catch (err) {
      setIsLocked(false);
      throw err;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsLocked(false);
    }
  }, [wakeLock]);

  return {
    isLocked,
    isSupported: 'wakeLock' in navigator,
    requestLock,
    releaseLock,
  };
}

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}

export default usePermission;
