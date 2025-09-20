// src/components/KostnaderSection.tsx
import React, { useEffect, forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import nb from "date-fns/locale/nb";
import { FaCalendarAlt } from "react-icons/fa";

registerLocale("nb", nb);

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
  dato?: string;
  starttid?: string;
  slutttid?: string;
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

// Custom input for DatePicker: tekstfelt + knapp
const DateInput = forwardRef<
  HTMLDivElement,
  {
    value?: string;
    onClick?: () => void;
    hasError?: boolean;
  }
>(({ value, onClick, hasError }, ref) => (
  <div ref={ref as any} className="flex items-center gap-1">
    <input
      className={`bb-input w-[12ch] ${hasError ? "bb-input--error" : ""}`}
      value={value || ""}
      readOnly
    />
    <button
      type="button"
      className="bb-btn px-2 flex items-center justify-center"
      onClick={onClick}
    >
      <FaCalendarAlt />
    </button>
  </div>
));

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

  const today = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
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
        dato: today(),
        starttid: "",
        slutttid: "",
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

  const toNumber = (v: any) => {
    const n = Number(String(v ?? "").replace(",", "."));
    return isFinite(n) ? n : 0;
  };

  const calcTotals = (k: KostRad) => {
    const turpris = toNumber(k.turpris);
    const venting = toNumber(k.venting);
    const ekstra = toNumber(k.ekstra);
    const bom = toNumber(k.bom);
    const ferge = toNumber(k.ferge);
    const egenandel = toNumber(k.egenandel);

    const total = turpris + venting + ekstra + bom + ferge - egenandel;
    const mva = total - total / 1.12;
    return { total, mva };
  };

  const sums = kostnader.reduce(
    (acc, k) => {
      const { total, mva } = calcTotals(k);
      acc.total += total;
      acc.mva += mva;
      return acc;
    },
    { total: 0, mva: 0 }
  );

  const parseDate = (str?: string): Date | null => {
    if (!str) return null;
    const [dd, mm, yyyy] = str.split("/");
    if (!dd || !mm || !yyyy) return null;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kostnader.map((k, idx) => {
          const { total, mva } = calcTotals(k);

          return (
            <div key={idx} className="bb-card flex flex-col">
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
                {/* Løyve */}
                <label className="flex flex-col">
                  <span className="mb-1">Løyve:</span>
                  {loyver.length === 0 ? (
                    <input
                      type="text"
                      className="bb-input w-[12ch] bg-gray-100 text-gray-500"
                      value="Ingen valgt"
                      readOnly
                    />
                  ) : loyver.length === 1 ? (
                    <input
                      type="text"
                      className="bb-input w-[12ch] bg-gray-100"
                      value={loyver[0].loyve}
                      readOnly
                    />
                  ) : (
                    <select
                      className={`bb-select w-[12ch] ${
                        !k.loyve ? "bb-input--error" : ""
                      }`}
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
                  )}
                  {!k.loyve && loyver.length > 1 && (
                    <p className="mt-1 text-sm text-red-600">
                      Du må velge løyve for denne turen.
                    </p>
                  )}
                </label>

                {/* Dato med egen knapp */}
                <label className="flex flex-col">
                  <span className="mb-1">Dato:</span>
                  <DatePicker
                    selected={parseDate(k.dato) || parseDate(today())}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const dd = String(date.getDate()).padStart(2, "0");
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const yyyy = date.getFullYear();
                        patch(idx, { dato: `${dd}/${mm}/${yyyy}` });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="nb"
                    customInput={
                      <DateInput value={k.dato} hasError={!k.dato} />
                    }
                  />
                </label>

                {/* Start Tid */}
                <label className="flex flex-col">
                  <span className="mb-1">Start Tid:</span>
                  <input
                    type="text"
                    placeholder="hh:mm"
                    className="bb-input w-[10ch]"
                    value={k.starttid || ""}
                    onChange={(e) => patch(idx, { starttid: e.target.value })}
                  />
                </label>

                {/* Slutt Tid */}
                <label className="flex flex-col">
                  <span className="mb-1">Slutt Tid:</span>
                  <input
                    type="text"
                    placeholder="hh:mm"
                    className="bb-input w-[10ch]"
                    value={k.slutttid || ""}
                    onChange={(e) => patch(idx, { slutttid: e.target.value })}
                  />
                </label>

                {/* Kvitteringsnummer */}
                <label className="flex flex-col">
                  <span className="mb-1">Kvitteringsnummer:</span>
                  <input
                    type="text"
                    className={`bb-input w-[16ch] ${
                      !k.kvittnr ? "bb-input--error" : ""
                    }`}
                    value={k.kvittnr || ""}
                    onChange={(e) => patch(idx, { kvittnr: e.target.value })}
                  />
                </label>

                {/* Turpris */}
                <label className="flex flex-col">
                  <span className="mb-1">Turpris:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`bb-input w-[12ch] ${
                        !k.turpris ? "bb-input--error" : ""
                      }`}
                      value={k.turpris || ""}
                      onChange={(e) => patch(idx, { turpris: e.target.value })}
                    />
                    <span>NOK</span>
                  </div>
                </label>

                {/* +Venting */}
                <label className="flex flex-col">
                  <span className="mb-1">+Venting:</span>
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

                {/* +Bompeng */}
                <label className="flex flex-col">
                  <span className="mb-1">+Bompeng:</span>
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

                {/* +Fergepeng */}
                <label className="flex flex-col">
                  <span className="mb-1">+Fergepeng:</span>
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

                {/* +Ekstra */}
                <label className="flex flex-col">
                  <span className="mb-1">+Ekstra:</span>
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

                {/* -Eigeandel */}
                <label className="flex flex-col">
                  <span className="mb-1">-Eigeandel:</span>
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
      </div>

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
