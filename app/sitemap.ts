import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kodepos.online';
  
  // Static date for stable lastmod (avoiding frequent changes)
  const staticDate = new Date('2024-01-01');
  
  // Main sitemap index pointing to chunked sitemaps
  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: staticDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/provinsi`,
      lastModified: staticDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Add 8 sitemap chunks (for ~70k kelurahan, 10k each)
  for (let i = 0; i < 8; i++) {
    sitemaps.push({
      url: `${baseUrl}/sitemap-${i}.xml`,
      lastModified: staticDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return sitemaps;
}
