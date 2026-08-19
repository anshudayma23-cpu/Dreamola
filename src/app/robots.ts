import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dreamola.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/journal', '/journal/*', '/account', '/api/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
