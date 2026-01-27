'use client';

import { useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

interface UseShareReturn {
  share: (options: ShareOptions) => Promise<boolean>;
  shareToTwitter: (text: string, url: string) => void;
  shareToWarpcast: (text: string, url?: string) => void;
  copyToClipboard: (text: string) => Promise<boolean>;
  canNativeShare: boolean;
}

/**
 * Hook for social sharing functionality
 */
export function useShare(): UseShareReturn {
  const { success, error } = useToast();

  const canNativeShare = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!navigator.share;
  }, []);

  const share = useCallback(
    async (options: ShareOptions): Promise<boolean> => {
      if (navigator.share) {
        try {
          await navigator.share(options);
          return true;
        } catch (err) {
          // User cancelled or error
          if ((err as Error).name !== 'AbortError') {
            console.error('Share failed:', err);
          }
          return false;
        }
      }

      // Fallback to copy
      try {
        await navigator.clipboard.writeText(options.url);
        success('Link copied to clipboard!');
        return true;
      } catch {
        error('Failed to copy link');
        return false;
      }
    },
    [success, error]
  );

  const shareToTwitter = useCallback((text: string, url: string) => {
    const tweetUrl = new URL('https://twitter.com/intent/tweet');
    tweetUrl.searchParams.set('text', text);
    tweetUrl.searchParams.set('url', url);
    window.open(tweetUrl.toString(), '_blank', 'width=550,height=420');
  }, []);

  const shareToWarpcast = useCallback((text: string, url?: string) => {
    const castUrl = new URL('https://warpcast.com/~/compose');
    const fullText = url ? `${text}\n\n${url}` : text;
    castUrl.searchParams.set('text', fullText);
    window.open(castUrl.toString(), '_blank');
  }, []);

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        success('Copied to clipboard!');
        return true;
      } catch {
        error('Failed to copy');
        return false;
      }
    },
    [success, error]
  );

  return {
    share,
    shareToTwitter,
    shareToWarpcast,
    copyToClipboard,
    canNativeShare,
  };
}
