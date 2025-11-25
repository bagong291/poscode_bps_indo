import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const title = term
    ? `Kode Pos ${term} — Kelurahan & Kecamatan Terkait`
    : "Pencarian Kode Pos — Kelurahan & Kecamatan";
  const description = term
    ? `Hasil untuk "${term}": kelurahan dan kecamatan terkait dengan kode posnya.`
    : "Cari kelurahan atau kecamatan untuk melihat kode pos terkait.";
  return {
    title,
    description,
    alternates: { canonical: term ? `/cari?q=${encodeURIComponent(term)}` : "/cari" },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  let kelurahanRows: { kelurahan: string; kecamatan: string; kabupaten: string; provinsi: string; kodepos: string }[] = [];
  let kecamatanRows: { kecamatan: string; kabupaten: string; provinsi: string }[] = [];

  if (term) {
    kelurahanRows = await query(
      "SELECT kelurahan, kecamatan, kabupaten, provinsi, kodepos FROM tbl_kodepos WHERE lower(kelurahan) LIKE lower($1) || '%' ORDER BY provinsi, kabupaten, kecamatan, kelurahan LIMIT 50",
      [term]
    );

    kecamatanRows = await query(
      "SELECT DISTINCT kecamatan, kabupaten, provinsi FROM tbl_kodepos WHERE lower(kecamatan) LIKE lower($1) || '%' ORDER BY provinsi, kabupaten, kecamatan LIMIT 50",
      [term]
    );
  }

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      ...kelurahanRows.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `/provinsi/${slugify(r.provinsi)}/kabupaten/${slugify(r.kabupaten)}/kecamatan/${slugify(r.kecamatan)}/kelurahan/${slugify(r.kelurahan)}`,
        name: `Kelurahan ${r.kelurahan}, ${r.kecamatan}, ${r.kabupaten} — ${r.provinsi} (Kode Pos ${r.kodepos})`,
      })),
      ...kecamatanRows.map((r, i) => ({
        "@type": "ListItem",
        position: kelurahanRows.length + i + 1,
        url: `/provinsi/${slugify(r.provinsi)}/kabupaten/${slugify(r.kabupaten)}/kecamatan/${slugify(r.kecamatan)}`,
        name: `Kecamatan ${r.kecamatan}, ${r.kabupaten} — ${r.provinsi}`,
      })),
    ],
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cari">Pencarian</BreadcrumbLink>
            </BreadcrumbItem>
            {term && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/cari?q=${encodeURIComponent(term)}`}>{term}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          {term ? (
            <>Hasil Pencarian: {term}</>
          ) : (
            <>Pencarian Kode Pos</>
          )}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {term
            ? `Menampilkan kelurahan dan kecamatan yang cocok dengan "${term}".`
            : "Masukkan nama kelurahan atau kecamatan di kolom pencarian pada beranda."}
        </p>
      </div>

      {term && (
        <>
          <div className="mt-10">
            <h2 className="text-xl font-bold">Kelurahan</h2>
            {kelurahanRows.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Tidak ada kelurahan yang cocok.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {kelurahanRows.map((r) => (
                  <Link
                    key={`${r.kelurahan}-${r.kecamatan}-${r.kabupaten}-${r.provinsi}-${r.kodepos}`}
                    href={`/provinsi/${slugify(r.provinsi)}/kabupaten/${slugify(r.kabupaten)}/kecamatan/${slugify(r.kecamatan)}/kelurahan/${slugify(r.kelurahan)}`}
                    className="group flex items-start justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">Kelurahan {r.kelurahan}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{r.kecamatan}, {r.kabupaten}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{r.provinsi}</div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">{r.kodepos}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-bold">Kecamatan</h2>
            {kecamatanRows.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Tidak ada kecamatan yang cocok.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {kecamatanRows.map((r) => (
                  <Link
                    key={`${r.kecamatan}-${r.kabupaten}-${r.provinsi}`}
                    href={`/provinsi/${slugify(r.provinsi)}/kabupaten/${slugify(r.kabupaten)}/kecamatan/${slugify(r.kecamatan)}`}
                    className="block rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="font-semibold">Kecamatan {r.kecamatan}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{r.kabupaten}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{r.provinsi}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
    </section>
  );
}
