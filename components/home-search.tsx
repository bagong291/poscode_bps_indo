"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

export function HomeSearch() {
  const router = useRouter();
  const [kelurahan, setKelurahan] = useState("");
  const [kodepos, setKodepos] = useState("");

  const handleKelurahanSearch = () => {
    if (!kelurahan.trim()) return;
    router.push(`/cari?q=${encodeURIComponent(kelurahan.trim())}`);
  };

  const handleKodeposSearch = () => {
    const code = kodepos.trim();
    if (!code || code.length < 4) return;
    router.push(`/kodepos/${encodeURIComponent(code)}`);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4 text-primary" />
          Cari Kelurahan
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Contoh: Purwodadi, Jakarta, Bandung..."
            value={kelurahan}
            onChange={(e) => setKelurahan(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleKelurahanSearch()}
            className="h-11 border-2 transition-colors focus:border-primary"
          />
          <Button
            onClick={handleKelurahanSearch}
            size="lg"
            className="bg-primary px-6 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search className="mr-2 h-4 w-4" />
            Cari
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Atau</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          Cek Kode Pos
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Contoh: 23895"
            value={kodepos}
            onChange={(e) => setKodepos(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleKodeposSearch()}
            maxLength={5}
            className="h-11 border-2 transition-colors focus:border-primary"
          />
          <Button
            onClick={handleKodeposSearch}
            size="lg"
            variant="outline"
            className="border-2 px-6 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Lihat
          </Button>
        </div>
      </div>
    </div>
  );
}
