// src/components/KostnaderSection.tsx
import React from "react";

interface KostRad {
  kvittnr?: string;
  turpris?: string | number;
  venting?: string | number;
  bom?: string | number;
  ferge?: string | number;
  ekstra?: string | number;
  egenandel?: string | number;
  loyve?: string;
  sjoforId?: string;
  sjoforNavn?: string;
}

interface LoyveInfo {
  loyve: string;
  sjoforId: string;
  sjoforNavn: string;
}

interface Props {
  kostnader: KostRad[];
  setKostnader: (k: KostRad[]) => void;
  formData: any;
}

export default function KostnaderSection({
  kostnader,
  setKostnader,
  formData,
}: Props) {
  const patch = (idx: number, changes: Partial<KostRad>) => {
    const updated = [...kostnader];
    updated[idx] = { ...updated[idx], ...changes };
    setKostnader(updated);
  };

  const addRow = () => {
    setKostnader([
      ...kostnader,
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
  };

  const removeRow = (idx: number) => {
    const updated = [...kostnader];
    updated.splice(idx, 1);
    setKostnader(updated);
  };

  const removeAll = () => {
    setKostnader([]);
  };

  // 👇 Hent alle løyver direkte fra formData
  const allLoyver = Array.isArray(formData?.turer)
    ? formData.turer.flatMap((t: any) =>
        Array.isArray(t?.loyver) ? t.loyver : []
      )
    : [];

  const manyLoyver = allLoyver.length > 1;

  // Summer og MVA
  const toNumber = (v: any) => {
    const n = Number(String(v ?? "").replace(",", "."));
    return isFinite(n) ? n : 0;
  };
  const sums = kostnader.reduce(
    (acc, k) => {
      const turpris = toNumber(k.turpris);
      const venting = toNumber(k.venting);
      const ekstra = toNumber(k.ekstra);
      const bom = toNumber(k.bom);
      const ferge = toNumber(k.ferge);
      const egenandel = toNumber(k.egenandel);

      const taxable = turpris + venting + ekstra;
      const nonTaxable = bom + ferge;
      const mva = Math.round(taxable * 0.12);

      acc.taxable += taxable;
      acc.nonTaxable += nonTaxable;
      acc.mva += mva;
      acc.egenandel += egenandel;
      return acc;
    },
    { taxable: 0, nonTaxable: 0, mva: 0, egenandel: 0 }
  );
  const sumEksMva = sums.taxable + sums.nonTaxable;
  const totalInklMva = sumEksMva + sums.mva;

  return (
    <section className="bb-section">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">Kostnader</h2>
        <div className="flex gap-2">
          <button type="button" className="bb-btn" onClick={addRow}>
            ➕ Legg til tur
          </button>
          {kostnader.length > 0 && (
            <button type="button" className="bb-btn" onClick={removeAll}>
              🗑️ Fjern alle
            </button>
          )}
        </div>
      </div>

      {kostnader.map((k, idx) => (
        <div key={idx} className="bb-card mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Tur {idx + 1}</span>
            <button
              type="button"
              className="text-red-600 text-sm"
              onClick={() => removeRow(idx)}
            >
              Slett
            </button>
          </div>

          <div className="flex flex-col space-y-3">
            {/* Løyve (dropdown hvis >1) */}
            {manyLoyver && (
              <label className="flex flex-col">
                <span className="mb-1">Løyve:</span>
                <select
                  className="bb-select w-[12ch]"
                  value={k.loyve ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const info = allLoyver.find((l: any) => l.loyve === val);
                    patch(idx, {
                      loyve: info?.loyve ?? val,
                      sjoforId: info?.sjoforId ?? "",
                      sjoforNavn: info?.sjoforNavn ?? "",
                    });
                  }}
                >
                  <option value="">-- Velg --</option>
                  {allLoyver.map((l: LoyveInfo) => (
                    <option key={l.loyve} value={l.loyve}>
                      {l.loyve}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Kvitteringsnummer (obligatorisk) */}
            <label className="flex flex-col">
              <span className="mb-1">Kvitteringsnummer:</span>
              <input
                type="text"
                className={`bb-input w-[16ch] ${!k.kvittnr ? "bb-input--error" : ""}`}
                value={k.kvittnr || ""}
                onChange={(e) => patch(idx, { kvittnr: e.target.value })}
              />
            </label>

            {/* Turpris (obligatorisk) */}
            <label className="flex flex-col">
              <span className="mb-1">Turpris:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className={`bb-input w-[12ch] ${!k.turpris ? "bb-input--error" : ""}`}
                  value={k.turpris || ""}
                  onChange={(e) => patch(idx, { turpris: e.target.value })}
                />
                <span>NOK</span>
              </div>
            </label>

            {/* Venting */}
            <label className="flex flex-col">
              <span className="mb-1">Venting:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="bb-input w-[12ch]"
                  value={k.venting || ""}
                  onChange={(e) => patch(idx, { venting: e.target.value })}
                />
                <span>NOK</span>
              </div>
            </label>

            {/* Bompenger */}
            <label className="flex flex-col">
              <span className="mb-1">Bompenger:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="bb-input w-[12ch]"
                  value={k.bom || ""}
                  onChange={(e) => patch(idx, { bom: e.target.value })}
                />
                <span>NOK</span>
              </div>
            </label>

            {/* Fergepeng */}
            <label className="flex flex-col">
              <span className="mb-1">Fergepeng:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="bb-input w-[12ch]"
                  value={k.ferge || ""}
                  onChange={(e) => patch(idx, { ferge: e.target.value })}
                />
                <span>NOK</span>
              </div>
            </label>

            {/* Ekstra */}
            <label className="flex flex-col">
              <span className="mb-1">Ekstra:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="bb-input w-[12ch]"
                  value={k.ekstra || ""}
                  onChange={(e) => patch(idx, { ekstra: e.target.value })}
                />
                <span>NOK</span>
              </div>
            </label>

            {/* Eigenandel */}
            <label className="flex flex-col">
              <span className="mb-1">Eigenandel:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="bb-input w-[12ch]"
                  value={k.egenandel || ""}
                  onChange={(e) => patch(idx, { egenandel: e.target.value })}
                />
                <span>NOK</span>
              </div>
            </label>
          </div>
        </div>
      ))}

      {/* Summer og MVA */}
      {kostnader.length > 0 && (
        <div className="bb-card mt-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Sum eks. mva</span>
              <span>{sumEksMva} NOK</span>
            </div>
            <div className="flex justify-between">
              <span>MVA 12%</span>
              <span>{sums.mva} NOK</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total inkl. mva</span>
              <span>{totalInklMva} NOK</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
