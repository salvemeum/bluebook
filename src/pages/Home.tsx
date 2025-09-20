// src/pages/Home.tsx
import { useEffect, useState } from "react";

// Seksjoner (rekkefølge: Løyver → Dato/Tid → Turinfo → Kostnader → Vedlegg)
import DropdownLoyver from "../components/DropdownLoyver";
import DateTimeSection from "../components/DateTimeSection";
import TurinfoSection from "../components/TurinfoSection";
import KostnaderSection from "../components/KostnaderSection";
import VedleggSection from "../components/VedleggSection";
import PdfButtons from "../components/PdfButtons";

export default function Home() {
  // Alltid et array, aldri undefined
  const [loyver, setLoyver] = useState<
    { loyve: string; sjoforId: string; sjoforNavn: string }[]
  >([]);

  const [formData, setFormData] = useState<any>({});
  const [kostnader, setKostnader] = useState<any[]>([
    {
      kvittnr: "",
      loyve: "",
      turpris: "",
      venting: "",
      bom: "",
      ferge: "",
      ekstra: "",
      egenandel: "",
    },
  ]);
  const [vedlegg, setVedlegg] = useState<File[]>([]);
  const [dark, setDark] = useState(false);

  // Nullstill alle data
  const handleReset = () => {
    setFormData({});
    setLoyver([]);
    setKostnader([
      {
        kvittnr: "",
        loyve: "",
        turpris: "",
        venting: "",
        bom: "",
        ferge: "",
        ekstra: "",
        egenandel: "",
      },
    ]);
    setVedlegg([]);
  };

  // Bytt mellom dark/light theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // 🔑 Samle alle valgte løyver fra formData.turer[*].loyver
  const allLoyverFromTurer = Array.isArray(formData?.turer)
    ? formData.turer.flatMap((t: any) =>
        Array.isArray(t?.loyver) ? t.loyver : []
      )
    : [];

  const loyverForKostnader =
    allLoyverFromTurer.length > 0
      ? Array.from(
          new Map(
            allLoyverFromTurer
              .filter((l: any) => l && l.loyve)
              .map((l: any) => [String(l.loyve).trim(), l])
          ).values()
        )
      : loyver;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Digital Blåbok</h1>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Nullstill
          </button>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
          >
            Tema
          </button>
        </div>
      </div>

      <p className="text-red-600">Alle raude felt MÅ fyllast ut.</p>

      {/* Seksjoner */}
      <DropdownLoyver
        loyver={loyver}
        setLoyver={setLoyver}
        formData={formData}
        setFormData={setFormData}
      />
      <DateTimeSection formData={formData} setFormData={setFormData} />
      <TurinfoSection formData={formData} setFormData={setFormData} />
      <KostnaderSection
        kostnader={kostnader}
        setKostnader={setKostnader}
        formData={formData}
        // 👇 Nå får den riktig liste
        loyver={loyverForKostnader}
      />
      <VedleggSection
        vedlegg={vedlegg}
        setVedlegg={setVedlegg}
        formData={formData}
        setFormData={setFormData}
      />

      {/* PDF-knapper */}
      <PdfButtons
        loyver={loyver}
        formData={formData}
        kostnader={kostnader}
        vedlegg={vedlegg}
      />
    </div>
  );
}
