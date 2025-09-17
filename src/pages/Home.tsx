import { useState } from "react";
import SectionCard from "../components/SectionCard";
import ThemeToggle from "../components/ThemeToggle";

type Form = {
  dato: string;
  kunde: string;
  fra: string;
  til: string;
  referanse: string;
  merknad: string;
};

const LS_KEY = "ny_skjema_v0";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function titleCase(str: string) {
  return str.toLowerCase().replace(/\b\p{L}/gu, (m) => m.toUpperCase());
}

export default function Home() {
  const [form, setForm] = useState<Form>({
    dato: todayISO(),
    kunde: "",
    fra: "",
    til: "",
    referanse: "",
    merknad: "",
  });

  function set<K extends keyof Form>(key: K, val: Form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }
  const onBlurTrim =
    (key: keyof Form, formatter?: (s: string) => string) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value.trim();
      set(key, formatter ? formatter(v) : v);
    };

  function reset() {
    setForm({ dato: todayISO(), kunde: "", fra: "", til: "", referanse: "", merknad: "" });
  }
  function saveDraft() { localStorage.setItem(LS_KEY, JSON.stringify(form)); alert("Utkast lagret lokalt."); }
  function loadDraft() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return alert("Ingen lagret utkast.");
    try { setForm(JSON.parse(raw) as Form); } catch { alert("Kunne ikke lese utkast."); }
  }
  function clearDraft() { localStorage.removeItem(LS_KEY); alert("Lokalt utkast slettet."); }
  function validate() {
    if (!form.dato) return alert("Sett dato.");
    if (!form.kunde.trim()) return alert("Kunde mangler.");
    alert("OK – grunnskjema er gyldig.");
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 border dark:bg-gray-800 dark:border-gray-700">
      {/* Header med tittel/undertittel og tema-knapp til høyre */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Digital Blåbok</h1>
          <p className="text-sm mt-1">
            <span className="text-red-600 font-medium">Alle raude felt MÅ fyllast ut.</span>
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Seksjon: Grunninfo */}
      <SectionCard title="Grunninfo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dato</label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              value={form.dato}
              onChange={(e) => set("dato", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Kunde</label>
            <input
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              placeholder="Navn på kunde"
              value={form.kunde}
              onChange={(e) => set("kunde", e.target.value)}
              onBlur={onBlurTrim("kunde", titleCase)}
              maxLength={40}
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Maks 40 tegn. Formateres til «Tittel-Case» på blur.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frå</label>
            <input
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              placeholder="Start"
              value={form.fra}
              onChange={(e) => set("fra", e.target.value)}
              onBlur={onBlurTrim("fra")}
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Til</label>
            <input
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              placeholder="Slutt"
              value={form.til}
              onChange={(e) => set("til", e.target.value)}
              onBlur={onBlurTrim("til")}
              maxLength={40}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Referanse</label>
            <input
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              placeholder="Valgfritt (10 tegn)"
              value={form.referanse}
              onChange={(e) => set("referanse", e.target.value)}
              onBlur={onBlurTrim("referanse")}
              maxLength={10}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Merknad</label>
            <textarea
              rows={3}
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700"
              placeholder="Fritekst"
              value={form.merknad}
              onChange={(e) => set("merknad", e.target.value)}
              onBlur={onBlurTrim("merknad")}
            />
          </div>
        </div>
      </SectionCard>

      {/* Knapper nederst */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={reset} className="px-4 py-2 rounded bg-white border dark:bg-gray-900 dark:border-gray-700">
          Nullstill
        </button>
        <button type="button" onClick={saveDraft} className="px-4 py-2 rounded bg-blue-600 text-white">
          Lagre utkast
        </button>
        <button type="button" onClick={loadDraft} className="px-4 py-2 rounded bg-green-600 text-white">
          Last utkast
        </button>
        <button type="button" onClick={clearDraft} className="px-4 py-2 rounded bg-red-600 text-white">
          Tøm utkast
        </button>
        <button type="button" onClick={validate} className="px-4 py-2 rounded bg-black text-white">
          Valider
        </button>
      </div>
    </div>
  );
}
