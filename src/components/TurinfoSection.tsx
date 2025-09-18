import { useEffect, useState } from "react";

interface Props {
  formData: { [k: string]: any };
  setFormData: (data: any) => void;
}

// ruter.txt: "<rutenr><mellomrom><kundenavn...>"
type Rute = { nr: string; kunde: string };

function toTitleCase(s: string) {
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/(\s+)/) // bevar eksakt mellomrom
    .map((tok) => (/\S/.test(tok) ? tok[0].toUpperCase() + tok.slice(1) : tok))
    .join("");
}

export default function TurinfoSection({ formData, setFormData }: Props) {
  const [ruter, setRuter] = useState<Rute[]>([]);

  useEffect(() => {
    fetch("/ruter.txt")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const parsed = lines.map((line) => {
          const [nr, ...rest] = line.split(/\s+/);
          return { nr, kunde: rest.join(" ").trim() };
        });
        setRuter(parsed);
      })
      .catch(() => setRuter([]));
  }, []);

  const setField = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  // Rute.nr -> Kunde (full match, uten å overskrive tastingen)
  const handleRuteChange = (val: string) => {
    const hit = ruter.find((r) => r.nr === val.trim());
    if (hit) {
      setFormData({
        ...formData,
        rute: val,
        kunde: hit.kunde,
      });
    } else {
      setFormData({
        ...formData,
        rute: val,
      });
    }
  };

  // Kunde -> Rute.nr (eksakt eller delvis match)
  const handleKundeChange = (val: string) => {
    const exact = ruter.find(
      (r) => r.kunde.toLowerCase() === val.trim().toLowerCase()
    );
    if (exact) {
      setFormData({
        ...formData,
        kunde: exact.kunde,
        rute: exact.nr,
      });
      return;
    }

    const partial = ruter.filter((r) =>
      r.kunde.toLowerCase().includes(val.trim().toLowerCase())
    );

    if (partial.length === 1) {
      setFormData({
        ...formData,
        kunde: partial[0].kunde,
        rute: partial[0].nr,
      });
    } else {
      setFormData({
        ...formData,
        kunde: val,
      });
    }
  };

  // Kun disse tre er obligatoriske
  const requiredClass = (v: string | undefined) =>
    (v?.trim() ?? "") === ""
      ? "border-2 border-primary"
      : "border border-gray-400 dark:border-gray-600";

  const normalClass = "border border-gray-400 dark:border-gray-600";

  return (
    <section className="p-4 border-2 border-black dark:border-white rounded-xl">
      <h2 className="font-bold mb-2">Turinformasjon</h2>

      <div className="space-y-3">
        {/* Bookingnr (valgfri) */}
        <div className="flex flex-wrap gap-6 items-end">
          <label className="flex flex-col">
            <span className="mb-1">Bookingnr:</span>
            <input
              type="text"
              maxLength={8}
              value={formData.bookingnr || ""}
              onChange={(e) => setField("bookingnr", e.target.value)}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[8ch] ${normalClass}`}
            />
          </label>
        </div>

        {/* Rute.nr (valgfri) + Kunde (OBLIGATORISK) */}
        <div className="flex flex-wrap gap-6 items-end">
          <label className="flex flex-col">
            <span className="mb-1">Rute.nr:</span>
            <input
              type="text"
              maxLength={8}
              value={formData.rute || ""}
              onChange={(e) => handleRuteChange(e.target.value)}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[8ch] ${normalClass}`}
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1">Kunde:</span>
            <input
              type="text"
              maxLength={40}
              value={formData.kunde || ""}
              onChange={(e) => handleKundeChange(e.target.value)}
              onBlur={(e) => setField("kunde", toTitleCase(e.target.value))}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[40ch] ${requiredClass(formData.kunde)}`}
            />
          </label>
        </div>

        {/* For (valgfri) + Ved (valgfri) — FLYTTET OPP */}
        <div className="flex flex-wrap gap-6 items-end">
          <label className="flex flex-col">
            <span className="mb-1">For:</span>
            <input
              type="text"
              maxLength={40}
              value={formData.for || ""}
              onChange={(e) => setField("for", e.target.value)}
              onBlur={(e) => setField("for", toTitleCase(e.target.value))}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[40ch] ${normalClass}`}
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1">Ved:</span>
            <input
              type="text"
              maxLength={40}
              value={formData.ved || ""}
              onChange={(e) => setField("ved", e.target.value)}
              onBlur={(e) => setField("ved", toTitleCase(e.target.value))}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[40ch] ${normalClass}`}
            />
          </label>
        </div>

        {/* Frå (OBLIGATORISK) + Til (OBLIGATORISK) — NEDENFOR */}
        <div className="flex flex-wrap gap-6 items-end">
          <label className="flex flex-col">
            <span className="mb-1">Frå:</span>
            <input
              type="text"
              maxLength={40}
              value={formData.fra || ""}
              onChange={(e) => setField("fra", e.target.value)}
              onBlur={(e) => setField("fra", toTitleCase(e.target.value))}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[40ch] ${requiredClass(formData.fra)}`}
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1">Til:</span>
            <input
              type="text"
              maxLength={40}
              value={formData.til || ""}
              onChange={(e) => setField("til", e.target.value)}
              onBlur={(e) => setField("til", toTitleCase(e.target.value))}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[40ch] ${requiredClass(formData.til)}`}
            />
          </label>
        </div>

        {/* Referanse (valgfri) + Merknad (valgfri) */}
        <div className="flex flex-wrap gap-6 items-start">
          <label className="flex flex-col">
            <span className="mb-1">Referanse:</span>
            <input
              type="text"
              maxLength={10}
              value={formData.referanse || ""}
              onChange={(e) => setField("referanse", e.target.value)}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[12ch] ${normalClass}`}
            />
          </label>

          <label className="flex flex-col flex-1 min-w-[300px]">
            <span className="mb-1">Merknad:</span>
            <textarea
              rows={3}
              value={formData.merknad || ""}
              onChange={(e) => setField("merknad", e.target.value)}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 ${normalClass} resize-y`}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
