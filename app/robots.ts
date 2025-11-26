import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [],
    },
    sitemap:[`${baseUrl}/sitemap.xml`,`${baseUrl}/sitemap-1.xml`,`${baseUrl}/sitemap-2.xml`,`${baseUrl}/sitemap-3.xml`,`${baseUrl}/sitemap-4.xml`,`${baseUrl}/sitemap-5.xml`],
  };
}
