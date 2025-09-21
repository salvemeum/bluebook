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
    fetch(`${import.meta.env.BASE_URL}ruter.txt`)
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

  const isEmpty = (v?: string) => (v?.trim() ?? "") === "";

  return (
    <section className="bb-section">
      <h2 className="font-bold mb-2">Turinformasjon</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 1) Bookingnr */}
        <label className="flex flex-col min-w-0">
          <span className="mb-1">Bookingnr:</span>
          <input
            type="text"
            maxLength={11}
            value={formData.bookingnr || ""}
            onChange={(e) => setField("bookingnr", e.target.value)}
            className="bb-input w-[11ch]"
          />
        </label>

        <div className="hidden md:block" />

        {/* 2) Rute.nr + Kunde */}
        <label className="flex flex-col min-w-0">
          <span className="mb-1">Rute.nr:</span>
          <input
            type="text"
            maxLength={8}
            value={formData.rute || ""}
            onChange={(e) => handleRuteChange(e.target.value)}
            className="bb-input w-[8ch]"
          />
        </label>

        <label className="flex flex-col min-w-0">
          <span className="mb-1">Kunde:</span>
          <input
            type="text"
            maxLength={40}
            value={formData.kunde || ""}
            onChange={(e) => handleKundeChange(e.target.value)}
            onBlur={(e) => setField("kunde", toTitleCase(e.target.value))}
            className={`bb-input w-full ${isEmpty(formData.kunde) ? "bb-input--error" : ""}`}
          />
        </label>

        {/* 3) For + Ved */}
        <label className="flex flex-col min-w-0">
          <span className="mb-1">For:</span>
          <input
            type="text"
            maxLength={40}
            value={formData.for || ""}
            onChange={(e) => setField("for", e.target.value)}
            className="bb-input w-full"
          />
        </label>

        <label className="flex flex-col min-w-0">
          <span className="mb-1">Ved:</span>
          <input
            type="text"
            maxLength={40}
            value={formData.ved || ""}
            onChange={(e) => setField("ved", e.target.value)}
            className="bb-input w-full"
          />
        </label>

        {/* 4) Frå + Til */}
        <label className="flex flex-col min-w-0">
          <span className="mb-1">Frå:</span>
          <input
            type="text"
            maxLength={40}
            value={formData.fra || ""}
            onChange={(e) => setField("fra", e.target.value)}
            className={`bb-input w-full ${isEmpty(formData.fra) ? "bb-input--error" : ""}`}
          />
        </label>

        <label className="flex flex-col min-w-0">
          <span className="mb-1">Til:</span>
          <input
            type="text"
            maxLength={40}
            value={formData.til || ""}
            onChange={(e) => setField("til", e.target.value)}
            className={`bb-input w-full ${isEmpty(formData.til) ? "bb-input--error" : ""}`}
          />
        </label>

        {/* 5) Referanse */}
        <label className="flex flex-col min-w-0">
          <span className="mb-1">Referanse:</span>
          <input
            type="text"
            maxLength={24}
            value={formData.referanse || ""}
            onChange={(e) => setField("referanse", e.target.value)}
            className="bb-input w-[24ch]"
          />
        </label>

        <div className="hidden md:block" />

        {/* 6) Merknad */}
        <label className="flex flex-col md:col-span-2 min-w-0">
          <span className="mb-1">Merknad:</span>
          <textarea
            rows={3}
            value={formData.merknad || ""}
            onChange={(e) => setField("merknad", e.target.value)}
            className="bb-textarea resize-y w-full"
          />
        </label>
      </div>
    </section>
  );
}
