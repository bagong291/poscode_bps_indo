import type { Metadata } from "next";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MapPinned } from "lucide-react";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

type Params = { provinsi: string; kabupaten: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { provinsi, kabupaten } = await params;
  return {
    title: `Daftar Kode Pos Kabupaten ${kabupaten} — ${provinsi}`,
    description: `Daftar kecamatan dan kode pos di Kabupaten ${kabupaten}, Provinsi ${provinsi}.`,
    alternates: { canonical: `/provinsi/${provinsi}/kabupaten/${kabupaten}` },
  };
}

export default async function KabupatenPage({ params }: { params: Promise<Params> }) {
  const { provinsi, kabupaten } = await params;

  const kecamatanRows = await query<{ kecamatan: string }>(
    "SELECT DISTINCT kecamatan FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($2) ORDER BY kecamatan",
    [provinsi, kabupaten]
  );

  const kabupatenSaudara = await query<{ kabupaten: string }>(
    "SELECT DISTINCT kabupaten FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) AND replace(regexp_replace(lower(kabupaten), '[^a-z0-9 ]', '', 'g'), ' ', '-') <> lower($2) ORDER BY kabupaten",
    [provinsi, kabupaten]
  );

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: kecamatanRows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Kecamatan ${r.kecamatan}`,
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
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Kabupaten {kabupaten}</h1>
        <p className="mt-2 text-muted-foreground">{provinsi}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kecamatanRows.map((r) => (
          <Link 
            key={r.kecamatan} 
            href={`/provinsi/${provinsi}/kabupaten/${kabupaten}/kecamatan/${slugify(r.kecamatan)}`} 
            className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
              <MapPinned className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{r.kecamatan}</span>
          </Link>
        ))}
      </div>

      {kabupatenSaudara.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold">Kabupaten lain di {provinsi}</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kabupatenSaudara.slice(0, 12).map((k) => (
              <li key={k.kabupaten}>
                <Link 
                  href={`/provinsi/${provinsi}/kabupaten/${slugify(k.kabupaten)}`} 
                  className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                  <span className="text-sm font-medium">{k.kabupaten}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
    </section>
  );
}
