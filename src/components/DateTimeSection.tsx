// src/components/DateTimeSection.tsx
import React from "react";

interface KostRad {
  dato?: string;
  starttid?: string;
  slutttid?: string;
  turNr?: number;
  loyve?: string;
}

interface LoyveInfo {
  loyve: string;
  sjoforId: string;
  sjoforNavn: string;
}

interface Props {
  kostnader?: KostRad[];
  setKostnader: (k: KostRad[]) => void;
  loyver?: LoyveInfo[];
}

export default function DateTimeSection({
  kostnader = [],
  setKostnader,
  loyver = [],
}: Props) {
  const patch = (idx: number, changes: Partial<KostRad>) => {
    const updated = [...kostnader];
    updated[idx] = { ...updated[idx], ...changes };
    setKostnader(updated);
  };

  const manyLoyver = (loyver?.length ?? 0) > 1;

  return (
    <section className="bb-section">
      <h2 className="font-bold mb-2">Dato og tid</h2>
      <div className="flex flex-col gap-4">
        {(kostnader ?? []).map((k, idx) => (
          <div key={idx} className="bb-card p-3">
            <div className="flex flex-wrap items-end gap-4">
              {/* Dato */}
              <label className="flex flex-col">
                <span className="mb-1">Dato:</span>
                <input
                  type="date"
                  className={`bb-input w-[16ch] ${!k.dato ? "bb-input--error" : ""}`}
                  aria-invalid={!k.dato}
                  value={k.dato || ""}
                  onChange={(e) => patch(idx, { dato: e.target.value })}
                />
              </label>

              {/* Starttid */}
              <label className="flex flex-col">
                <span className="mb-1">Start:</span>
                <input
                  type="time"
                  className={`bb-input w-[10ch] ${!k.starttid ? "bb-input--error" : ""}`}
                  aria-invalid={!k.starttid}
                  value={k.starttid || ""}
                  onChange={(e) => patch(idx, { starttid: e.target.value })}
                />
              </label>

              {/* Slutttid */}
              <label className="flex flex-col">
                <span className="mb-1">Slutt:</span>
                <input
                  type="time"
                  className={`bb-input w-[10ch] ${!k.slutttid ? "bb-input--error" : ""}`}
                  aria-invalid={!k.slutttid}
                  value={k.slutttid || ""}
                  onChange={(e) => patch(idx, { slutttid: e.target.value })}
                />
              </label>

              {/* TurNr dropdown */}
              <label className="flex flex-col">
                <span className="mb-1">Tur nr:</span>
                <select
                  className="bb-select w-[10ch]"
                  value={k.turNr ?? idx + 1}
                  onChange={(e) =>
                    patch(idx, { turNr: parseInt(e.target.value, 10) })
                  }
                >
                  {(kostnader ?? []).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>

              {/* Løyve dropdown hvis flere valgt */}
              {manyLoyver && (
                <label className="flex flex-col">
                  <span className="mb-1">Løyve:</span>
                  <select
                    className={`bb-select w-[12ch] ${!k.loyve ? "bb-input--error" : ""}`}
                    aria-invalid={!k.loyve}
                    value={k.loyve ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const info = (loyver ?? []).find((l) => l.loyve === val);
                      patch(idx, { loyve: info?.loyve ?? val });
                    }}
                  >
                    <option value="">-- Velg --</option>
                    {(loyver ?? []).map((l) => (
                      <option key={l.loyve} value={l.loyve}>
                        {l.loyve}
                      </option>
                    ))}
                  </select>
                  {!k.loyve && (
                    <p className="mt-1 text-sm text-red-600">
                      Du må velge løyve
                    </p>
                  )}
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
