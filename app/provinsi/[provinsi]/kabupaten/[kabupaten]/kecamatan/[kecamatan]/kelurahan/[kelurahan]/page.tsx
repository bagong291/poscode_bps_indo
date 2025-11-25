import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import { CopyButton } from "@/components/copy-button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";
// export const revalidate = 3600; // Revalidate every hour

type Params = { provinsi: string; kabupaten: string; kecamatan: string; kelurahan: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { provinsi, kabupaten, kecamatan, kelurahan } = await params;
  
  const rows = await query<{ kelurahan: string; kecamatan: string; kabupaten: string; provinsi: string; kodepos: string }>(
    "SELECT kelurahan, kecamatan, kabupaten, provinsi, kodepos FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($2) AND replace(regexp_replace(lower(kecamatan), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($3) AND replace(regexp_replace(lower(kelurahan), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($4) LIMIT 1",
    [provinsi, kabupaten, kecamatan, kelurahan]
  );
  
  const detail = rows[0];
  const title = detail ? `Kode Pos ${detail.kelurahan} ${detail.kodepos} - ${detail.kecamatan}, ${detail.kabupaten}, ${detail.provinsi}` : `Kode Pos ${kelurahan}`;
  const description = detail ? `Kode pos ${detail.kodepos} untuk Kelurahan ${detail.kelurahan}, Kecamatan ${detail.kecamatan}, Kabupaten ${detail.kabupaten}, Provinsi ${detail.provinsi}. Data resmi dari BPS Indonesia.` : `Cari kode pos untuk ${kelurahan}, Indonesia.`;
  const url = `/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}/kelurahan/${kelurahan}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kodepos.online';
  
  return {
    title,
    description,
    keywords: detail ? `kode pos ${detail.kelurahan}, kode pos ${detail.kecamatan}, kode pos ${detail.kabupaten}, ${detail.kodepos}, postal code indonesia` : undefined,
    alternates: { 
      canonical: url 
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${url}`,
      siteName: 'Kode Pos Indonesia',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function KelurahanPage({ params }: { params: Promise<Params> }) {
  const { provinsi, kabupaten, kecamatan, kelurahan } = await params;

  const rows = await query<{ kelurahan: string; kecamatan: string; kabupaten: string; provinsi: string; kodepos: string }>(
    "SELECT kelurahan, kecamatan, kabupaten, provinsi, kodepos FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($2) AND replace(regexp_replace(lower(kecamatan), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($3) AND replace(regexp_replace(lower(kelurahan), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($4) LIMIT 1",
    [provinsi, kabupaten, kecamatan, kelurahan]
  );

  const detail = rows[0];

  const kelurahanLain = await query<{ kelurahan: string; kodepos: string }>(
    "SELECT DISTINCT kelurahan, kodepos FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($2) AND replace(regexp_replace(lower(kecamatan), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($3) AND replace(regexp_replace(lower(kelurahan), '[^a-z0-9 ]', '', 'g'), ' ', '-') <> lower($4) ORDER BY kelurahan LIMIT 24",
    [provinsi, kabupaten, kecamatan, kelurahan]
  );

  const berbagiKodepos = detail
    ? await query<{ kelurahan: string; kecamatan: string; kabupaten: string; provinsi: string }>(
        "SELECT kelurahan, kecamatan, kabupaten, provinsi FROM tbl_kodepos WHERE kodepos = $1 ORDER BY provinsi, kabupaten, kecamatan, kelurahan LIMIT 24",
        [detail.kodepos]
      )
    : [];

  const placeJsonLd = detail
    ? {
        "@context": "https://schema.org",
        "@type": "Place",
        name: `${detail.kelurahan}, ${detail.kecamatan}, ${detail.kabupaten}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: detail.kelurahan,
          addressRegion: detail.provinsi,
          addressCountry: "ID",
          postalCode: detail.kodepos,
        },
        geo: {
          "@type": "GeoCoordinates",
          addressCountry: "ID"
        },
        isBasedOn: "https://sig.bps.go.id/bridging-kode/index",
      }
    : undefined;

  const breadcrumbJsonLd = detail
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: process.env.NEXT_PUBLIC_BASE_URL || "https://kodepos.online",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Provinsi",
            item: `${process.env.NEXT_PUBLIC_BASE_URL || "https://kodepos.online"}/provinsi`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: detail.provinsi,
            item: `${process.env.NEXT_PUBLIC_BASE_URL || "https://kodepos.online"}/provinsi/${provinsi}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: detail.kabupaten,
            item: `${process.env.NEXT_PUBLIC_BASE_URL || "https://kodepos.online"}/provinsi/${provinsi}/kabupaten/${kabupaten}`,
          },
          {
            "@type": "ListItem",
            position: 5,
            name: detail.kecamatan,
            item: `${process.env.NEXT_PUBLIC_BASE_URL || "https://kodepos.online"}/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}`,
          },
          {
            "@type": "ListItem",
            position: 6,
            name: detail.kelurahan,
            item: `${process.env.NEXT_PUBLIC_BASE_URL || "https://kodepos.online"}/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}/kelurahan/${kelurahan}`,
          },
        ],
      }
    : undefined;

  const faqJsonLd = detail
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Berapa kode pos ${detail.kelurahan}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Kode pos Kelurahan ${detail.kelurahan}, Kecamatan ${detail.kecamatan}, Kabupaten ${detail.kabupaten}, Provinsi ${detail.provinsi} adalah ${detail.kodepos}.`,
            },
          },
          {
            "@type": "Question",
            name: `Dimana letak Kelurahan ${detail.kelurahan}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Kelurahan ${detail.kelurahan} terletak di Kecamatan ${detail.kecamatan}, Kabupaten ${detail.kabupaten}, Provinsi ${detail.provinsi}, Indonesia.`,
            },
          },
          {
            "@type": "Question",
            name: "Apa itu kode pos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Kode pos adalah serangkaian angka yang ditambahkan pada alamat surat untuk mempermudah proses penyortiran dan pengiriman surat oleh kantor pos.",
            },
          },
        ],
      }
    : undefined;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      {detail ? (
        <>
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/provinsi">Provinsi</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/provinsi/${provinsi}`}>{provinsi}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/provinsi/${provinsi}/kabupaten/${kabupaten}`}>Kabupaten {kabupaten}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}`}>Kecamatan {kecamatan}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}/kelurahan/${kelurahan}`}>Kelurahan {kelurahan}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <h1 className="mt-6 text-3xl font-bold">
            Kode Pos {detail.kelurahan}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {detail.kecamatan}, {detail.kabupaten} — {detail.provinsi}
          </p>
          <div className="mt-6 rounded-xl border bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:from-orange-950/20 dark:to-amber-950/10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Kelurahan {detail.kelurahan} berada di Kecamatan {detail.kecamatan}, Kabupaten {detail.kabupaten}, Provinsi {detail.provinsi}.
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Kelurahan</dt>
                    <dd className="mt-1 font-semibold">{detail.kelurahan}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Kecamatan</dt>
                    <dd className="mt-1 font-semibold">{detail.kecamatan}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Kabupaten</dt>
                    <dd className="mt-1 font-semibold">{detail.kabupaten}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Provinsi</dt>
                    <dd className="mt-1 font-semibold">{detail.provinsi}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Kode Pos</span>
                  <Badge className="bg-primary px-4 py-2 text-lg font-bold text-primary-foreground hover:bg-primary/90">{detail.kodepos}</Badge>
                </div>
                <CopyButton text={detail.kodepos} />
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}`} className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium transition-all hover:border-primary hover:shadow-md">
              Kelurahan lain di {detail.kecamatan}
            </Link>
            <Link href={`/kodepos/${detail.kodepos}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Lihat kode pos {detail.kodepos}
            </Link>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-bold">Kelurahan lain di Kecamatan {detail.kecamatan}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {kelurahanLain.map((k) => (
                <li key={k.kelurahan}>
                  <Link
                    href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}/kelurahan/${slugify(k.kelurahan)}`}
                    className="group flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
                  >
                    <span className="font-medium">Kelurahan {k.kelurahan}</span>
                    <Badge variant="outline" className="text-xs">{k.kodepos}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {berbagiKodepos.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold">Kelurahan dengan Kode Pos {detail.kodepos}</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {berbagiKodepos.map((b) => (
                  <li key={`${b.kelurahan}-${b.kecamatan}-${b.kabupaten}-${b.provinsi}`}>
                    <Link
                      href={`/provinsi/${slugify(b.provinsi)}/kabupaten/${slugify(b.kabupaten)}/kecamatan/${slugify(b.kecamatan)}/kelurahan/${slugify(b.kelurahan)}`}
                      className="block rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="font-medium">{b.kelurahan}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{b.kecamatan}, {b.kabupaten}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl font-bold">Pertanyaan yang Sering Diajukan</h2>
            <div className="mt-4 space-y-4">
              <details className="group rounded-lg border bg-card">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
                  <span>Berapa kode pos {detail.kelurahan}?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  Kode pos Kelurahan {detail.kelurahan}, Kecamatan {detail.kecamatan}, Kabupaten {detail.kabupaten}, Provinsi {detail.provinsi} adalah <strong className="text-primary">{detail.kodepos}</strong>.
                </div>
              </details>
              
              <details className="group rounded-lg border bg-card">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
                  <span>Dimana letak Kelurahan {detail.kelurahan}?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  Kelurahan {detail.kelurahan} terletak di Kecamatan {detail.kecamatan}, Kabupaten {detail.kabupaten}, Provinsi {detail.provinsi}, Indonesia.
                </div>
              </details>
              
              <details className="group rounded-lg border bg-card">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
                  <span>Apa itu kode pos?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  Kode pos adalah serangkaian angka yang ditambahkan pada alamat surat untuk mempermudah proses penyortiran dan pengiriman surat oleh kantor pos.
                </div>
              </details>
              
              <details className="group rounded-lg border bg-card">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
                  <span>Bagaimana cara menggunakan kode pos?</span>
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  Kode pos ditulis di bagian akhir alamat, biasanya setelah nama kelurahan/desa dan kecamatan. Contoh: Kelurahan {detail.kelurahan}, Kec. {detail.kecamatan}, Kab. {detail.kabupaten}, {detail.provinsi} {detail.kodepos}.
                </div>
              </details>
            </div>
          </div>

          {placeJsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />
          )}
          {breadcrumbJsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
          )}
          {faqJsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Data tidak ditemukan</h1>
          <p className="mt-2 text-muted-foreground">Periksa ejaan nama kelurahan/kecamatan/kabupaten atau jelajahi dari halaman kecamatan.</p>
        </>
      )}
    </section>
  );
}
