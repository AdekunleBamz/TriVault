import { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tri-vault.vercel.app'
const APP_NAME = 'TriVault'

interface SEOConfig {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
}

/**
 * Generate metadata for a page with proper SEO tags
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png',
  noIndex = false,
}: SEOConfig): Metadata {
  const fullTitle = title === APP_NAME ? title : `${title} | ${APP_NAME}`
  const url = `${APP_URL}${path}`
  const imageUrl = image.startsWith('http') ? image : `${APP_URL}${image}`

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  }
}

/**
 * Common page metadata configurations
 */
export const pageMetadata = {
  home: generatePageMetadata({
    title: 'TriVault | Collect Seals on Base',
    description: 'Collect 3 unique vault seals on Base blockchain. Complete the challenge and earn your seals!',
    path: '/',
  }),
  
  leaderboard: generatePageMetadata({
    title: 'Leaderboard',
    description: 'See the top seal collectors on TriVault. Compete to climb the ranks!',
    path: '/leaderboard',
  }),
  
  stats: generatePageMetadata({
    title: 'Statistics',
    description: 'Real-time statistics and analytics for TriVault seal collection.',
    path: '/stats',
  }),
  
  profile: generatePageMetadata({
    title: 'Profile',
    description: 'View your seal collection progress and achievements.',
    path: '/profile',
  }),
  
  about: generatePageMetadata({
    title: 'About',
    description: 'Learn about TriVault, how it works, and the team behind it.',
    path: '/about',
  }),
  
  faq: generatePageMetadata({
    title: 'FAQ',
    description: 'Frequently asked questions about TriVault seal collection.',
    path: '/faq',
  }),
}
