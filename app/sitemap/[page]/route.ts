import { query } from '@/lib/db';
import { slugify } from '@/lib/slugify';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const pageNum = parseInt(page);
  const pageSize = 10000;
  const offset = pageNum * pageSize;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

  // Get kelurahan for this page
  const kelurahanRows = await query<{ provinsi: string; kabupaten: string; kecamatan: string; kelurahan: string }>(
    `SELECT DISTINCT provinsi, kabupaten, kecamatan, kelurahan 
     FROM tbl_kodepos 
     ORDER BY provinsi, kabupaten, kecamatan, kelurahan 
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  // Build XML
  const urls = kelurahanRows.map((kel) => {
    const url = `${baseUrl}/provinsi/${slugify(kel.provinsi)}/kabupaten/${slugify(kel.kabupaten)}/kecamatan/${slugify(kel.kecamatan)}/kelurahan/${slugify(kel.kelurahan)}`;
    return `  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }).join('\n');

  // Add static pages only on first sitemap
  let staticPages = '';
  if (pageNum === 0) {
    // Add homepage, provinsi list, and all provinsi/kabupaten/kecamatan pages
    const provinsiRows = await query<{ provinsi: string }>(
      "SELECT DISTINCT provinsi FROM tbl_kodepos ORDER BY provinsi"
    );

    const kabupatenRows = await query<{ provinsi: string; kabupaten: string }>(
      "SELECT DISTINCT provinsi, kabupaten FROM tbl_kodepos ORDER BY provinsi, kabupaten"
    );

    const kecamatanRows = await query<{ provinsi: string; kabupaten: string; kecamatan: string }>(
      "SELECT DISTINCT provinsi, kabupaten, kecamatan FROM tbl_kodepos ORDER BY provinsi, kabupaten, kecamatan"
    );

    const staticUrls = [
      { url: baseUrl, priority: 1.0, freq: 'daily' },
      { url: `${baseUrl}/provinsi`, priority: 0.7, freq: 'weekly' },
      ...provinsiRows.map(p => ({
        url: `${baseUrl}/provinsi/${slugify(p.provinsi)}`,
        priority: 0.5,
        freq: 'weekly'
      })),
      ...kabupatenRows.map(k => ({
        url: `${baseUrl}/provinsi/${slugify(k.provinsi)}/kabupaten/${slugify(k.kabupaten)}`,
        priority: 0.6,
        freq: 'weekly'
      })),
      ...kecamatanRows.map(kec => ({
        url: `${baseUrl}/provinsi/${slugify(kec.provinsi)}/kabupaten/${slugify(kec.kabupaten)}/kecamatan/${slugify(kec.kecamatan)}`,
        priority: 0.8,
        freq: 'monthly'
      }))
    ];

    staticPages = staticUrls.map(item => `  <url>
    <loc>${item.url}</loc>
    <changefreq>${item.freq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n') + '\n';
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages}${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache 24 hours
    },
  });
}
