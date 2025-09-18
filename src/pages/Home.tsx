import { useEffect, useState } from "react";
import DropdownLoyver from "../components/DropdownLoyver";
import DateTimeSection from "../components/DateTimeSection";
import TurinfoSection from "../components/TurinfoSection";
import KostnaderSection from "../components/KostnaderSection";
import VedleggSection from "../components/VedleggSection";
import PdfButtons from "../components/PdfButtons";

export default function Home() {
  // Dark mode med persist + system-preference fallback
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluebook:dark");
      if (saved !== null) return saved === "1";
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    }
    return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (darkMode) {
      html.classList.add("dark");
      body.classList.add("dark");
    } else {
      html.classList.remove("dark");
      body.classList.remove("dark");
    }
    localStorage.setItem("bluebook:dark", darkMode ? "1" : "0");
  }, [darkMode]);

  // Global form state
  const [formData, setFormData] = useState<any>({});

  // Kostnader – start med tomme strenger (så røde valideringsrammer funker)
  const [kostnader, setKostnader] = useState<any[]>([
    { turpris: "", venting: "", bom: "", ferge: "", ekstra: "", egenandel: "" },
  ]);

  const [vedlegg, setVedlegg] = useState<File[]>([]);

  // Tving re-mount av seksjoner for å nullstille ALT internt
  const [resetCounter, setResetCounter] = useState(0);

  const handleReset = () => {
    setFormData({});
    setKostnader([
      { turpris: "", venting: "", bom: "", ferge: "", ekstra: "", egenandel: "" },
    ]);
    setVedlegg([]);
    setResetCounter((n) => n + 1);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Digital Blåbok</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Alle raude felt MÅ fyllast ut
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 shadow"
            title="Nullstill alle felter"
          >
            Nullstill
          </button>
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 shadow"
            title="Bytt tema"
          >
            {darkMode ? "Lyst tema" : "Mørkt tema"}
          </button>
        </div>
      </header>

      {/* Seksjoner – keys sørger for full reset */}
      <DropdownLoyver
        key={`loyver-${resetCounter}`}
        formData={formData}
        setFormData={setFormData}
      />
      <DateTimeSection
        key={`dt-${resetCounter}`}
        formData={formData}
        setFormData={setFormData}
      />
      <TurinfoSection
        key={`tur-${resetCounter}`}
        formData={formData}
        setFormData={setFormData}
      />
      <KostnaderSection
        key={`kost-${resetCounter}`}
        kostnader={kostnader}
        setKostnader={setKostnader}
        formData={formData}
      />
      <VedleggSection
        key={`vedl-${resetCounter}`}
        vedlegg={vedlegg}
        setVedlegg={setVedlegg}
      />
      <PdfButtons />
    </div>
  );
}
