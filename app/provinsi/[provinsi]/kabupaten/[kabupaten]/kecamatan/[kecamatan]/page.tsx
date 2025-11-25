import type { Metadata } from "next";
import { query } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";
// export const revalidate = 3600; // Revalidate every hour

type Params = { provinsi: string; kabupaten: string; kecamatan: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { provinsi, kabupaten, kecamatan } = await params;
  return {
    title: `Daftar Kode Pos Kecamatan ${kecamatan}, ${kabupaten} — ${provinsi}`,
    description: `Daftar kelurahan dan kode pos di Kecamatan ${kecamatan}, Kabupaten ${kabupaten}, Provinsi ${provinsi}.`,
    alternates: { canonical: `/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}` },
  };
}

export default async function KecamatanPage({ params }: { params: Promise<Params> }) {
  const { provinsi, kabupaten, kecamatan } = await params;

  const kelurahanRows = await query<{ kelurahan: string; kodepos: string }>(
    "SELECT DISTINCT kelurahan, kodepos FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($2) AND replace(regexp_replace(lower(kecamatan), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($3) ORDER BY kelurahan",
    [provinsi, kabupaten, kecamatan]
  );

  const kecamatanSaudara = await query<{ kecamatan: string }>(
    "SELECT DISTINCT kecamatan FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($2) AND replace(regexp_replace(lower(kecamatan), '[^a-z0-9 ]', '', 'g'), ' ', '-') <> lower($3) ORDER BY kecamatan",
    [provinsi, kabupaten, kecamatan]
  );

  // Get unique postal codes count
  const uniqueKodepos = [...new Set(kelurahanRows.map(r => r.kodepos))];
  const totalKelurahan = kelurahanRows.length;

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: kelurahanRows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Kelurahan ${r.kelurahan} — Kode Pos ${r.kodepos}`,
    })),
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
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
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Kecamatan {kecamatan}</h1>
        <p className="mt-2 text-muted-foreground">{kabupaten}, {provinsi}</p>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:from-orange-950/20 dark:to-amber-950/10">
          <div className="text-sm font-medium text-muted-foreground">Total Kelurahan</div>
          <div className="mt-2 text-3xl font-bold text-primary">{totalKelurahan}</div>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:from-blue-950/20 dark:to-cyan-950/10">
          <div className="text-sm font-medium text-muted-foreground">Kode Pos Unik</div>
          <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{uniqueKodepos.length}</div>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:from-purple-950/20 dark:to-pink-950/10">
          <div className="text-sm font-medium text-muted-foreground">Kecamatan Lain</div>
          <div className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">{kecamatanSaudara.length}</div>
        </div>
      </div>

      {/* Kelurahan List */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Daftar Kelurahan</h2>
          <Badge variant="outline">{totalKelurahan} kelurahan</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {kelurahanRows.map((r, index) => (
            <Link
              key={`${r.kelurahan}-${r.kodepos}`}
              href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${kecamatan}/kelurahan/${slugify(r.kelurahan)}`}
              className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary transition-colors group-hover:bg-primary/20">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">Kelurahan {r.kelurahan}</div>
                    <div className="text-xs text-muted-foreground">Klik untuk detail lengkap</div>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">{r.kodepos}</Badge>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </Link>
          ))}
        </div>
      </div>

      {kecamatanSaudara.length > 0 && (
        <div className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Kecamatan Lain di {kabupaten}</h2>
            <Badge variant="outline">{kecamatanSaudara.length} kecamatan</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {kecamatanSaudara.slice(0, 12).map((k) => (
              <Link 
                key={k.kecamatan}
                href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${slugify(k.kecamatan)}`} 
                className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 transition-all hover:border-primary hover:shadow-md"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50 transition-all group-hover:scale-150"></div>
                <span className="text-sm font-medium">{k.kecamatan}</span>
              </Link>
            ))}
          </div>
          {kecamatanSaudara.length > 12 && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Dan {kecamatanSaudara.length - 12} kecamatan lainnya
            </p>
          )}
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
    </section>
  );
}
