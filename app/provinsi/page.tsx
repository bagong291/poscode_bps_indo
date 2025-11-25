import type { Metadata } from "next";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MapPin } from "lucide-react";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Daftar Provinsi Indonesia",
  description: "Jelajah provinsi untuk melihat daftar kabupaten dan kode pos.",
  alternates: { canonical: "/provinsi" },
};

export default async function ProvinsiIndexPage() {
  const provinsiRows = await query<{ provinsi: string }>(
    "SELECT DISTINCT provinsi FROM tbl_kodepos ORDER BY provinsi",
    []
  );

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
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Daftar Provinsi Indonesia</h1>
        <p className="mt-2 text-muted-foreground">Pilih provinsi untuk melihat kabupaten dan kode pos.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {provinsiRows.map((p) => (
          <Link 
            key={p.provinsi} 
            href={`/provinsi/${slugify(p.provinsi)}`} 
            className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{p.provinsi}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
