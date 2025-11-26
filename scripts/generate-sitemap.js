const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:password@localhost:5432/bps',
});

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateSitemaps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kodepos.online';
  const staticDate = '2025-11-26';
  const publicDir = path.join(__dirname, '../public');

  console.log('🚀 Generating sitemaps...');

  try {
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Get all data
    console.log('📊 Fetching provinsi...');
    const provinsiRows = await pool.query(
      "SELECT DISTINCT provinsi FROM tbl_kodepos ORDER BY provinsi"
    );

    console.log('📊 Fetching kabupaten...');
    const kabupatenRows = await pool.query(
      "SELECT DISTINCT provinsi, kabupaten FROM tbl_kodepos ORDER BY provinsi, kabupaten"
    );

    console.log('📊 Fetching kecamatan...');
    const kecamatanRows = await pool.query(
      "SELECT DISTINCT provinsi, kabupaten, kecamatan FROM tbl_kodepos ORDER BY provinsi, kabupaten, kecamatan"
    );

    console.log('📊 Fetching kelurahan...');
    const kelurahanRows = await pool.query(
      "SELECT DISTINCT provinsi, kabupaten, kecamatan, kelurahan FROM tbl_kodepos ORDER BY provinsi, kabupaten, kecamatan, kelurahan"
    );

    const totalKelurahan = kelurahanRows.rows.length;
    const pageSize = 10000;
    const totalChunks = Math.ceil(totalKelurahan / pageSize);

    console.log(`📄 Total kelurahan: ${totalKelurahan}`);
    console.log(`📄 Creating ${totalChunks} sitemap chunks...`);

    // Generate sitemap-0.xml (with all static pages + first 10k kelurahan)
    console.log('✍️  Generating sitemap-0.xml...');
    let urls = [];

    // Homepage
    urls.push(`  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

    // Provinsi list
    urls.push(`  <url>
    <loc>${baseUrl}/provinsi</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);

    // Provinsi pages
    provinsiRows.rows.forEach(p => {
      urls.push(`  <url>
    <loc>${baseUrl}/provinsi/${slugify(p.provinsi)}</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    });

    // Kabupaten pages
    kabupatenRows.rows.forEach(k => {
      urls.push(`  <url>
    <loc>${baseUrl}/provinsi/${slugify(k.provinsi)}/kabupaten/${slugify(k.kabupaten)}</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });

    // Kecamatan pages
    kecamatanRows.rows.forEach(kec => {
      urls.push(`  <url>
    <loc>${baseUrl}/provinsi/${slugify(kec.provinsi)}/kabupaten/${slugify(kec.kabupaten)}/kecamatan/${slugify(kec.kecamatan)}</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // First 10k kelurahan
    kelurahanRows.rows.slice(0, pageSize).forEach(kel => {
      urls.push(`  <url>
    <loc>${baseUrl}/provinsi/${slugify(kel.provinsi)}/kabupaten/${slugify(kel.kabupaten)}/kecamatan/${slugify(kel.kecamatan)}/kelurahan/${slugify(kel.kelurahan)}</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);
    });

    const sitemap0 = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap-0.xml'), sitemap0);
    console.log(`✅ sitemap-0.xml created (${urls.length} URLs)`);

    // Generate sitemap-1.xml to sitemap-N.xml (remaining kelurahan)
    for (let i = 1; i < totalChunks; i++) {
      console.log(`✍️  Generating sitemap-${i}.xml...`);
      const offset = i * pageSize;
      const chunk = kelurahanRows.rows.slice(offset, offset + pageSize);
      
      const chunkUrls = chunk.map(kel => `  <url>
    <loc>${baseUrl}/provinsi/${slugify(kel.provinsi)}/kabupaten/${slugify(kel.kabupaten)}/kecamatan/${slugify(kel.kecamatan)}/kelurahan/${slugify(kel.kelurahan)}</loc>
    <lastmod>${staticDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);

      const sitemapChunk = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunkUrls.join('\n')}
</urlset>`;

      fs.writeFileSync(path.join(publicDir, `sitemap-${i}.xml`), sitemapChunk);
      console.log(`✅ sitemap-${i}.xml created (${chunkUrls.length} URLs)`);
    }

    // Generate main sitemap.xml (sitemap index)
    console.log('✍️  Generating sitemap.xml (index)...');
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalChunks }, (_, i) => `  <sitemap>
    <loc>${baseUrl}/sitemap-${i}.xml</loc>
    <lastmod>${staticDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
    console.log(`✅ sitemap.xml created (${totalChunks} sitemaps)`);

    console.log('\n🎉 All sitemaps generated successfully!');
    console.log(`📊 Total URLs: ~${urls.length + (totalChunks - 1) * pageSize}`);

  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

generateSitemaps();
