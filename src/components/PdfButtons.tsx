// src/components/PdfButtons.tsx
import React from "react";
import { generatePdfBlob } from "../utils/pdf"; // ✅ peker på pdf.tsx
import { btnPrimary } from "../utils/ui";

interface Props {
  formData?: any;
  kostnader?: any[];
  vedlegg?: File[];
  loyver?: { loyve: string; sjoforId: string; sjoforNavn: string }[]; // 👈 lagt til
}

export default function PdfButtons({ formData, kostnader, vedlegg, loyver }: Props) {
  // sikre at arrays aldri er undefined
  const safeKostnader = kostnader ?? [];
  const safeVedlegg = vedlegg ?? [];
  const safeLoyver = loyver ?? [];

  // obligatoriske felt i kostnader
  const kostnaderOk = safeKostnader.every((k, i) => {
    const kvittOk = (k.kvittnr ?? "").trim() !== "";
    const turprisOk = Number(k.turpris) > 0;
    return kvittOk && turprisOk;
  });

  const ready = kostnaderOk;

  const handleView = async () => {
    console.log("🚀 Data til PDF (handleView):", { formData, loyver: safeLoyver });
    const blob = await generatePdfBlob({
      formData,
      kostnader: safeKostnader,
      loyver: safeLoyver,
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleSave = async () => {
    console.log("🚀 Data til PDF (handleSave):", { formData, loyver: safeLoyver });
    const blob = await generatePdfBlob({
      formData,
      kostnader: safeKostnader,
      loyver: safeLoyver,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blaabok.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    console.log("🚀 Data til PDF (handlePrint):", { formData, loyver: safeLoyver });
    const blob = await generatePdfBlob({
      formData,
      kostnader: safeKostnader,
      loyver: safeLoyver,
    });
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.addEventListener("load", () => win.print());
    }
  };

  const handleSend = async () => {
    console.log("🚀 Data til PDF (handleSend):", { formData, loyver: safeLoyver });
    const blob = await generatePdfBlob({
      formData,
      kostnader: safeKostnader,
      loyver: safeLoyver,
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        type="button"
        className={`${btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handleView}
        disabled={!ready}
      >
        👁️ Vis PDF
      </button>

      <button
        type="button"
        className={`${btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handleSave}
        disabled={!ready}
      >
        💾 Lagre PDF
      </button>

      <button
        type="button"
        className={`${btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handlePrint}
        disabled={!ready}
      >
        🖨️ Skriv ut PDF
      </button>

      <button
        type="button"
        className={`${btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handleSend}
        disabled={!ready}
      >
        ✉️ Send PDF
      </button>
    </div>
  );
}
