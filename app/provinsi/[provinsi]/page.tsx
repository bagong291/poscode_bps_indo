import type { Metadata } from "next";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";
// export const revalidate = 3600; // Revalidate every hour

type Params = { provinsi: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { provinsi } = await params;
  return {
    title: `Daftar Kabupaten di ${provinsi}`,
    description: `Jelajah kabupaten di Provinsi ${provinsi} untuk melihat kecamatan dan kode pos.`,
    alternates: { canonical: `/provinsi/${provinsi}` },
  };
}

export default async function ProvinsiPage({ params }: { params: Promise<Params> }) {
  const { provinsi } = await params;

  const kabupatenRows = await query<{ kabupaten: string }>(
    "SELECT DISTINCT kabupaten FROM tbl_kodepos WHERE replace(regexp_replace(lower(provinsi), '[^a-z0-9 ]', '', 'g'), ' ', '-') = lower($1) ORDER BY kabupaten",
    [provinsi]
  );

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: kabupatenRows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Kabupaten ${r.kabupaten}`,
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
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Kabupaten di {provinsi}</h1>
        <p className="mt-2 text-muted-foreground">Pilih kabupaten untuk melihat kecamatan dan kode pos.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kabupatenRows.map((r) => (
          <Link 
            key={r.kabupaten} 
            href={`/provinsi/${provinsi}/kabupaten/${slugify(r.kabupaten)}`} 
            className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{r.kabupaten}</span>
          </Link>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
    </section>
  );
}
