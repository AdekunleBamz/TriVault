/**
 * JSON-LD structured data for SEO
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tri-vault.vercel.app'

interface WebsiteJsonLd {
  name: string
  description: string
  url: string
}

interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * Generate WebSite JSON-LD schema
 */
export function generateWebsiteJsonLd({ name, description, url }: WebsiteJsonLd): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return JSON.stringify(jsonLd)
}

/**
 * Generate WebApplication JSON-LD schema for TriVault
 */
export function generateAppJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TriVault',
    description: 'Collect 3 unique vault seals on Base blockchain',
    url: APP_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0.00001',
      priceCurrency: 'ETH',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  }
  return JSON.stringify(jsonLd)
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${APP_URL}${item.url}`,
    })),
  }
  return JSON.stringify(jsonLd)
}

/**
 * Generate FAQ JSON-LD schema
 */
export function generateFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
  return JSON.stringify(jsonLd)
}

/**
 * Component to render JSON-LD script tag
 */
export function JsonLd({ data }: { data: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  )
}
