import type { Metadata } from "next";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


export const dynamic = "force-dynamic";
// export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ kodepos: string }> }): Promise<Metadata> {
  const { kodepos: code } = await params;
  return {
    title: `Kode Pos ${code}`,
    description: `Kelurahan yang menggunakan kode pos ${code} di Indonesia.`,
    alternates: { canonical: `/kodepos/${code}` },
  };
}

export default async function KodeposPage({ params }: { params: Promise<{ kodepos: string }> }) {
  const { kodepos: code } = await params;
  const rows = await query<{ kelurahan: string; kecamatan: string; kabupaten: string; provinsi: string; kodepos: string }>(
    "SELECT kelurahan, kecamatan, kabupaten, provinsi, kodepos FROM tbl_kodepos WHERE kodepos = $1 ORDER BY provinsi, kabupaten, kecamatan, kelurahan",
    [code]
  );

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/provinsi/${slugify(r.provinsi)}/kabupaten/${slugify(r.kabupaten)}/kecamatan/${slugify(r.kecamatan)}/kelurahan/${slugify(r.kelurahan)}`,
      name: `Kelurahan ${r.kelurahan}, ${r.kecamatan}, ${r.kabupaten} — ${r.provinsi}`,
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
              <BreadcrumbLink href="/kodepos">Kode Pos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/kodepos/${code}`}>{code}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Kode Pos {code}</h1>
        <p className="mt-2 text-muted-foreground">Kelurahan yang menggunakan kode pos ini di Indonesia.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <Link
            key={`${r.kelurahan}-${r.kecamatan}-${r.kabupaten}-${r.provinsi}`}
            href={`/provinsi/${slugify(r.provinsi)}/kabupaten/${slugify(r.kabupaten)}/kecamatan/${slugify(r.kecamatan)}/kelurahan/${slugify(r.kelurahan)}`}
            className="group flex items-start justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex-1">
              <div className="font-semibold">Kelurahan {r.kelurahan}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {r.kecamatan}, {r.kabupaten}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{r.provinsi}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">{r.kodepos}</Badge>
              <div onClick={(e) => e.preventDefault()}>
                <CopyButton text={r.kodepos} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
    </section>
  );
}
