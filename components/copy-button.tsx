"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Kode pos berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error("Gagal menyalin kode pos");
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleCopy} 
      aria-label="Salin kode pos"
      className="transition-all hover:bg-primary/10 hover:text-primary"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" /> Tersalin!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" /> Salin
        </>
      )}
    </Button>
  );
}
