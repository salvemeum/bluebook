// src/pages/Home.tsx
import { useState, useEffect } from "react";
import DropdownLoyver from "../components/DropdownLoyver";
import TurinfoSection from "../components/TurinfoSection";
import KostnaderSection from "../components/KostnaderSection";
import VedleggSection from "../components/VedleggSection";
import PdfButtons from "../components/PdfButtons";

function today() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function Home() {
  const [loyver, setLoyver] = useState<
    { loyve: string; sjoforId: string; sjoforNavn: string }[]
  >([]);

  const [formData, setFormData] = useState<any>({});

  // Start med én tur i kostnader, inkluder dato
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
      dato: today(),
      starttid: "",
      slutttid: "",
    },
  ]);

  const [vedlegg, setVedlegg] = useState<File[]>([]);

  const loyverForKostnader =
    Array.isArray(formData?.loyver) && formData.loyver.length > 0
      ? formData.loyver
      : loyver;

  // Nullstill = refresher hele siden
  const handleReset = () => {
    window.location.reload();
  };

  // Tema state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Når siden lastes → hent lagret tema eller bruk systemets
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initialTheme = systemPrefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }
  }, []);

  // Bytte tema manuelt
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // 🔧 Hent inn tekstfiler via import.meta.env.BASE_URL
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}ruter.txt`)
      .then((res) => res.text())
      .then((data) => console.log("Ruter.txt:", data))
      .catch((err) => console.error("Feil ruter.txt:", err));

    fetch(`${import.meta.env.BASE_URL}biler.txt`)
      .then((res) => res.text())
      .then((data) => console.log("Biler.txt:", data))
      .catch((err) => console.error("Feil biler.txt:", err));

    fetch(`${import.meta.env.BASE_URL}sjoff.txt`)
      .then((res) => res.text())
      .then((data) => console.log("Sjoff.txt:", data))
      .catch((err) => console.error("Feil sjoff.txt:", err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Toppseksjon med overskrift og knapper */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Digital Blåbok</h1>
          <p className="text-sm text-red-600">
            Alle raude felt MÅ fyllast ut.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg shadow-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            🔄 Nullstill
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg shadow-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            {theme === "dark" ? "☀️ Lys modus" : "🌙 Mørk modus"}
          </button>
        </div>
      </div>

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
