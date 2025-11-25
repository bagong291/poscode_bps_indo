import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { slugify } from '@/lib/slugify';

// This is now the sitemap index
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

  // Get total kelurahan count
  const countResult = await query<{ count: string }>(
    "SELECT COUNT(DISTINCT (provinsi, kabupaten, kecamatan, kelurahan)) as count FROM tbl_kodepos"
  );
  
  const totalKelurahan = parseInt(countResult[0]?.count || '0');
  const pageSize = 10000; // 10K per sitemap
  const totalPages = Math.ceil(totalKelurahan / pageSize);

  // Return sitemap index entries
  const sitemaps: MetadataRoute.Sitemap = [];

  // Add kelurahan sitemaps (split into multiple files)
  for (let i = 0; i < totalPages; i++) {
    sitemaps.push({
      url: `${baseUrl}/sitemap/${i}.xml`,
      changeFrequency: 'monthly',
    });
  }

  return sitemaps;
}
