// src/pages/Home.tsx
import { useState } from "react";
import DropdownLoyver from "../components/DropdownLoyver";
import TurinfoSection from "../components/TurinfoSection";
import KostnaderSection from "../components/KostnaderSection";
import VedleggSection from "../components/VedleggSection";
import PdfButtons from "../components/PdfButtons";

export default function Home() {
  const [loyver, setLoyver] = useState<
    { loyve: string; sjoforId: string; sjoforNavn: string }[]
  >([]);

  const [formData, setFormData] = useState<any>({});

  // Start med én tur i kostnader
  const [kostnader, setKostnader] = useState<any[]>([
    {
      kvittnr: "",
      turpris: "",
      venting: "",
      bom: "",
      ferge: "",
      ekstra: "",
      egenandel: "",
      loyve: "",
      sjoforId: "",
      sjoforNavn: "",
    },
  ]);

  const [vedlegg, setVedlegg] = useState<File[]>([]);

  // Hvis formData.loyver finnes, bruk den – ellers loyver fra state
  const loyverForKostnader =
    Array.isArray(formData?.loyver) && formData.loyver.length > 0
      ? formData.loyver
      : loyver;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Digital Blåbok</h1>
      <p className="text-center text-sm text-red-600">
        Alle raude felt MÅ fyllast ut.
      </p>

      <DropdownLoyver
        loyver={loyver}
        setLoyver={setLoyver}
        formData={formData}
        setFormData={setFormData}
      />

      <TurinfoSection formData={formData} setFormData={setFormData} />

      <KostnaderSection
        kostnader={kostnader}
        setKostnader={setKostnader}
        loyver={loyverForKostnader}
      />

      <VedleggSection vedlegg={vedlegg} setVedlegg={setVedlegg} />

      <PdfButtons
        loyver={loyver}
        kostnader={kostnader}
        formData={formData}
        vedlegg={vedlegg}
      />
    </div>
  );
}
