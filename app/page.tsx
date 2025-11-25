import { HomeSearch } from "@/components/home-search";
import Link from "next/link";
import { MapPin, Search as SearchIcon, List, Package } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 via-amber-50 to-background dark:from-orange-950/20 dark:via-amber-950/10 dark:to-background"></div>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400">
                <Package className="h-3 w-3" /> Data BPS Indonesia
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Cari Kode Pos <span className="text-primary">Indonesia</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Temukan kode pos kelurahan dengan cepat, jelajahi kecamatan, kabupaten, dan provinsi. Data selaras dengan sumber resmi BPS.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/provinsi" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <MapPin className="h-4 w-4" /> Jelajahi Provinsi
                </Link>
                <Link href="/kodepos/23895" className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  <List className="h-4 w-4" /> Contoh Kode Pos
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <SearchIcon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold">Pencarian Cepat</span>
              </div>
              <HomeSearch />
              <p className="mt-4 text-xs text-muted-foreground">
                Coba cari: "purwodadi", "jakarta", atau nama kelurahan lainnya
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold">Fitur Pencarian</h2>
        <p className="mt-2 text-center text-muted-foreground">Akses data kode pos dengan berbagai cara</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/provinsi" className="group block rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
            <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Jelajah Provinsi</h3>
            <p className="mt-2 text-sm text-muted-foreground">Lihat daftar kabupaten di tiap provinsi Indonesia.</p>
          </Link>
          <Link href="/cari?q=purwodadi" className="group block rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
            <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
              <SearchIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Pencarian Kelurahan</h3>
            <p className="mt-2 text-sm text-muted-foreground">Cari berdasarkan nama kelurahan atau kecamatan.</p>
          </Link>
          <Link href="/kodepos/23895" className="group block rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
            <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
              <List className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Cari via Kode Pos</h3>
            <p className="mt-2 text-sm text-muted-foreground">Lihat semua kelurahan dengan kode pos tertentu.</p>
          </Link>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto w-full max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Data bersumber dari{" "}
            <a href="https://sig.bps.go.id/bridging-kode/index" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              Badan Pusat Statistik Indonesia
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
