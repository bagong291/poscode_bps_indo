import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

  try {
    // Get total kelurahan count
    const countResult = await query<{ count: string }>(
      "SELECT COUNT(DISTINCT (provinsi, kabupaten, kecamatan, kelurahan)) as count FROM tbl_kodepos"
    );
    
    const totalKelurahan = parseInt(countResult[0]?.count || '0');
    const pageSize = 10000; // 10K per sitemap
    const totalPages = Math.ceil(totalKelurahan / pageSize);

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add kelurahan sitemaps (split into multiple files)
    for (let i = 0; i < totalPages; i++) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n`;
      xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return minimal sitemap if database error
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap/0.xml</loc>\n`;
    xml += '  </sitemap>\n';
    xml += '</sitemapindex>';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
