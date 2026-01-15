// Analytics event types
type EventName =
  | 'page_view'
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'seal_collected'
  | 'all_seals_collected'
  | 'share_clicked'
  | 'leaderboard_viewed'
  | 'profile_viewed'
  | 'faq_viewed'
  | 'error_occurred'

interface EventProperties {
  page_view: { path: string; referrer?: string }
  wallet_connected: { address: string; connector: string }
  wallet_disconnected: { address: string }
  seal_collected: { vaultNumber: number; address: string; txHash: string }
  all_seals_collected: { address: string; timeToComplete?: number }
  share_clicked: { platform: 'twitter' | 'farcaster' | 'copy'; sealsCount: number }
  leaderboard_viewed: { filter: string }
  profile_viewed: { address: string; isOwn: boolean }
  faq_viewed: { questionId?: string }
  error_occurred: { code: string; message: string; context?: string }
}

class Analytics {
  private enabled: boolean = false

  constructor() {
    // Check if analytics is enabled via environment variable
    this.enabled = !!process.env.NEXT_PUBLIC_ANALYTICS_ID
  }

  /**
   * Track an event
   */
  track<E extends EventName>(event: E, properties: EventProperties[E]): void {
    if (!this.enabled) {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${event}:`, properties)
      }
      return
    }

    // Send to analytics provider
    // This would integrate with your analytics service (e.g., PostHog, Mixpanel, etc.)
    try {
      // Example: window.posthog?.capture(event, properties)
      console.log(`[Analytics] ${event}:`, properties)
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error)
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.enabled) return

    try {
      // Example: window.posthog?.identify(userId, traits)
      console.log(`[Analytics] Identify:`, { userId, traits })
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error)
    }
  }

  /**
   * Reset user identification (on disconnect)
   */
  reset(): void {
    if (!this.enabled) return

    try {
      // Example: window.posthog?.reset()
      console.log(`[Analytics] Reset`)
    } catch (error) {
      console.error('[Analytics] Failed to reset:', error)
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, referrer?: string): void {
    this.track('page_view', { path, referrer })
  }
}

// Singleton instance
export const analytics = new Analytics()

// React hook for analytics
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useAnalytics() {
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    analytics.pageView(pathname)
  }, [pathname])

  return analytics
}
