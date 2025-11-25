import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import { CopyButton } from "@/components/copy-button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

type Params = { provinsi: string; kabupaten: string; kecamatan: string; kelurahan: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { provinsi, kabupaten, kecamatan, kelurahan } = await params;
  return {
    title: `Kode Pos ${kelurahan}, ${kecamatan}, ${kabupaten} — ${provinsi}`,
    description: `Kode pos Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kabupaten ${kabupaten}, Provinsi ${provinsi}.`,
    alternates: { canonical: `/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}/kelurahan/${kelurahan}` },
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
          addressRegion: detail.kecamatan,
          addressCountry: "ID",
          postalCode: detail.kodepos,
        },
        isBasedOn: "https://sig.bps.go.id/bridging-kode/index",
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

          {placeJsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />
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
