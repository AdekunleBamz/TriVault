'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to update document title
 * @param title - The title to set
 * @param restoreOnUnmount - Whether to restore the previous title on unmount
 */
export function useDocumentTitle(
  title: string,
  restoreOnUnmount: boolean = false
) {
  const previousTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Store the previous title
    if (previousTitleRef.current === null) {
      previousTitleRef.current = document.title;
    }

    // Set the new title
    document.title = title;

    return () => {
      if (restoreOnUnmount && previousTitleRef.current !== null) {
        document.title = previousTitleRef.current;
      }
    };
  }, [title, restoreOnUnmount]);
}

/**
 * Hook to update document title with a template
 * @param title - The page-specific title
 * @param template - The template string (use %s for title placeholder)
 */
export function useDocumentTitleTemplate(
  title: string | null,
  template: string = '%s | TriVault'
) {
  const formattedTitle = title ? template.replace('%s', title) : 'TriVault';
  useDocumentTitle(formattedTitle);
}

/**
 * Hook to track notifications in document title
 */
export function useDocumentTitleNotification(
  baseTitle: string,
  notificationCount: number
) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (notificationCount > 0) {
      document.title = `(${notificationCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [baseTitle, notificationCount]);
}

/**
 * Hook to show a different title when window is not focused
 */
export function useDocumentTitleFocused(
  focusedTitle: string,
  blurredTitle: string
) {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const handleFocus = () => {
      document.title = focusedTitle;
    };

    const handleBlur = () => {
      document.title = blurredTitle;
    };

    // Set initial title
    if (document.hasFocus()) {
      document.title = focusedTitle;
    } else {
      document.title = blurredTitle;
    }

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [focusedTitle, blurredTitle]);
}

/**
 * Hook to update favicon
 */
export function useFavicon(href: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const link: HTMLLinkElement =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link');
    
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = href;
    
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [href]);
}

/**
 * Hook to update meta description
 */
export function useMetaDescription(description: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let meta: HTMLMetaElement | null = document.querySelector(
      'meta[name="description"]'
    );

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    meta.content = description;
  }, [description]);
}

export default useDocumentTitle;
