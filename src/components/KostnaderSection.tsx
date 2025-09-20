// src/components/KostnaderSection.tsx
import React, { useEffect } from "react";

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
  loyver: LoyveInfo[];
}

export default function KostnaderSection({
  kostnader,
  setKostnader,
  loyver,
}: Props) {
  const patch = (idx: number, changes: Partial<KostRad>) => {
    const updated = [...kostnader];
    updated[idx] = { ...updated[idx], ...changes };
    setKostnader(updated);
  };

  const addRow = () => {
    const only = loyver.length === 1 ? loyver[0] : undefined;
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
        loyve: only?.loyve ?? "",
        sjoforId: only?.sjoforId ?? "",
        sjoforNavn: only?.sjoforNavn ?? "",
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

  // Hvis kun ett løyve valgt globalt → sett det automatisk på alle rader
  useEffect(() => {
    if (loyver.length === 1) {
      const only = loyver[0];
      const updated = kostnader.map((k) => ({
        ...k,
        loyve: only.loyve,
        sjoforId: only.sjoforId,
        sjoforNavn: only.sjoforNavn,
      }));
      setKostnader(updated);
    }
  }, [loyver]);

  const manyLoyver = loyver.length > 1;

  // Helper
  const toNumber = (v: any) => {
    const n = Number(String(v ?? "").replace(",", "."));
    return isFinite(n) ? n : 0;
  };

  // Summer per rad
  const calcTotals = (k: KostRad) => {
    const turpris = toNumber(k.turpris);
    const venting = toNumber(k.venting);
    const ekstra = toNumber(k.ekstra);
    const bom = toNumber(k.bom);
    const ferge = toNumber(k.ferge);
    const total = turpris + venting + ekstra + bom + ferge;
    const mva = total - total / 1.12;
    return { total, mva };
  };

  // Summer alle
  const sums = kostnader.reduce(
    (acc, k) => {
      const { total, mva } = calcTotals(k);
      acc.total += total;
      acc.mva += mva;
      return acc;
    },
    { total: 0, mva: 0 }
  );

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

      {kostnader.map((k, idx) => {
        const { total, mva } = calcTotals(k);

        return (
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
              {/* Løyve-dropdown hvis flere enn 1 valgt globalt (obligatorisk) */}
              {manyLoyver && (
                <label className="flex flex-col">
                  <span className="mb-1">Løyve:</span>
                  <select
                    className={`bb-select w-[12ch] ${!k.loyve ? "bb-input--error" : ""}`}
                    aria-invalid={!k.loyve}
                    value={k.loyve ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const info = loyver.find((l) => l.loyve === val);
                      patch(idx, {
                        loyve: info?.loyve ?? val,
                        sjoforId: info?.sjoforId ?? "",
                        sjoforNavn: info?.sjoforNavn ?? "",
                      });
                    }}
                  >
                    <option value="">-- Velg --</option>
                    {loyver.map((l) => (
                      <option key={l.loyve} value={l.loyve}>
                        {l.loyve}
                      </option>
                    ))}
                  </select>
                  {!k.loyve && (
                    <p className="mt-1 text-sm text-red-600">
                      Du må velge løyve for denne turen.
                    </p>
                  )}
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

            {/* Summer for denne turen */}
            <div className="mt-3 border-t pt-2 text-sm">
              <div className="flex justify-between font-bold">
                <span>Totalpris</span>
                <span>{total.toFixed(2)} NOK</span>
              </div>
              <div className="flex justify-between">
                <span>Herav MVA 12%</span>
                <span>{mva.toFixed(2)} NOK</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Summering alle turer */}
      {kostnader.length > 0 && (
        <div className="bb-card mt-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-bold">
              <span>Sum totalpriser</span>
              <span>{sums.total.toFixed(2)} NOK</span>
            </div>
            <div className="flex justify-between">
              <span>Herav MVA 12%</span>
              <span>{sums.mva.toFixed(2)} NOK</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
