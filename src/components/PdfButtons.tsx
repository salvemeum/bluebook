// src/components/PdfButtons.tsx
import React from "react";
import { generatePdfBlob } from "../utils/pdf";
import { btnPrimary } from "../utils/ui";

interface VedleggItem {
  file: File;
  preview?: string; // base64-bilde for DOCX/XLSX (fra VedleggSection)
}

interface Props {
  formData?: any;
  kostnader?: any[];
  loyver?: { loyve: string; sjoforId: string; sjoforNavn: string }[];
  vedlegg?: VedleggItem[];
}

// Felles funksjon for filnavn
const makeFilename = (
  loyver: { loyve: string; sjoforId: string; sjoforNavn: string }[]
) => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const datoStr = `${dd}-${mm}-${yyyy}`;

  if (loyver.length === 0) return `${datoStr}-uten-loyve.pdf`;

  // Samle alle løyvenummer, men kun ett navn
  const loyveNums = loyver.map((l) => l.loyve).join("_");
  const navn = loyver[0].sjoforNavn.replace(/\s+/g, "_");

  return `${datoStr}-${loyveNums}-${navn}.pdf`;
};

export default function PdfButtons({
  formData,
  kostnader,
  loyver,
  vedlegg,
}: Props) {
  const safeKostnader = Array.isArray(kostnader) ? kostnader : [];
  const safeLoyver = Array.isArray(loyver) ? loyver : [];
  const safeVedlegg = Array.isArray(vedlegg) ? vedlegg : [];

  const kostnaderOk = safeKostnader.every((k) => {
    const kvittOk = String(k?.kvittnr ?? "").trim() !== "";
    const turprisOk = Number(k?.turpris) > 0;
    return kvittOk && turprisOk;
  });

  const ready = kostnaderOk;

  const handleView = async () => {
    try {
      console.log("🚀 Data til PDF (handleView):", {
        formData,
        loyver: safeLoyver,
        kostnader: safeKostnader,
        vedlegg: safeVedlegg,
      });
      const bytes = await generatePdfBlob(
        formData,
        safeKostnader,
        safeLoyver,
        safeVedlegg
      );
      const blob = new Blob([bytes], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const filename = makeFilename(safeLoyver);
      const newWindow = window.open(url, "_blank");
      if (newWindow && newWindow.document) {
        newWindow.document.title = filename;
      }
    } catch (err) {
      console.error("Feil ved generering av PDF (visning):", err);
    }
  };

  const handleSave = async () => {
    try {
      console.log("💾 Data til PDF (handleSave):", {
        formData,
        loyver: safeLoyver,
        kostnader: safeKostnader,
        vedlegg: safeVedlegg,
      });
      const bytes = await generatePdfBlob(
        formData,
        safeKostnader,
        safeLoyver,
        safeVedlegg
      );
      const blob = new Blob([bytes], { type: "application/pdf" });

      const filename = makeFilename(safeLoyver);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Feil ved generering av PDF (lagre):", err);
    }
  };

  const handlePrint = async () => {
    try {
      console.log("🖨️ Data til PDF (handlePrint):", {
        formData,
        loyver: safeLoyver,
        kostnader: safeKostnader,
        vedlegg: safeVedlegg,
      });
      const bytes = await generatePdfBlob(
        formData,
        safeKostnader,
        safeLoyver,
        safeVedlegg
      );
      const blob = new Blob([bytes], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const filename = makeFilename(safeLoyver);
      const win = window.open(url);
      if (win && win.document) {
        win.document.title = filename;
        win.addEventListener("load", () => win.print());
      }
    } catch (err) {
      console.error("Feil ved generering av PDF (skriv ut):", err);
    }
  };

  const handleSend = async () => {
    try {
      console.log("✉️ Data til PDF (handleSend):", {
        formData,
        loyver: safeLoyver,
        kostnader: safeKostnader,
        vedlegg: safeVedlegg,
      });
      const bytes = await generatePdfBlob(
        formData,
        safeKostnader,
        safeLoyver,
        safeVedlegg
      );
      const blob = new Blob([bytes], { type: "application/pdf" });
      const filename = makeFilename(safeLoyver);

      const formDataObj = new FormData();
      formDataObj.append("file", blob, filename);

      const response = await fetch("/send.php", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error("Feil ved sending");
      }

      alert("Epost sendt OK!");
    } catch (err) {
      console.error("Feil ved generering av PDF (send):", err);
      alert("Kunne ikke sende PDF.");
    }
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
