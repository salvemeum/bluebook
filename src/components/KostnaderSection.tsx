import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { btnPrimary, btnDanger, chipDanger, sectionCard } from "../utils/ui";

type Loyve = { loyve: string; sjoforId?: string; sjoforNavn?: string };

// Matcher Home.tsx:
type KostItem = {
  kvittnr: string;   // rød ramme når tomt (lengde valgfri)
  loyve?: string;    // dropdown når >1 løyve valgt
  turpris: string;   // ALLE beløp som STRING (kun sifre i state)
  venting: string;
  bom: string;
  ferge: string;
  ekstra: string;
  egenandel: string;
};

interface Props {
  kostnader: Partial<KostItem>[];
  setKostnader: (arr: Partial<KostItem>[]) => void;
  formData?: any;     // forventer ev. formData.loyver
  loyver?: Loyve[];   // valgfritt: kan også sende løyver direkte
}

/* ---------------- helpers ---------------- */
const asStr = (v: unknown) => (v ?? "") + "";
const onlyDigits = (s: string) => (s || "").replace(/[^\d]/g, "");
const toNum = (s: string) => {
  const n = parseInt(onlyDigits(s), 10);
  return Number.isFinite(n) ? n : 0;
};
const formatThousands = (digits: string) => {
  const s = onlyDigits(digits);
  if (!s) return "";
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const totalOf = (k: KostItem) =>
  toNum(k.turpris) +
  toNum(k.venting) +
  toNum(k.bom) +
  toNum(k.ferge) +
  toNum(k.ekstra) -
  toNum(k.egenandel);

const mva12 = (sum: number) => (sum > 0 ? sum - sum / 1.12 : 0);

/* ---------------- component ---------------- */
export default function KostnaderSection({
  kostnader,
  setKostnader,
  formData,
  loyver: loyverProp,
}: Props) {
  // Løyver fra formData eller prop
  const loyver: Loyve[] = Array.isArray(formData?.loyver)
    ? formData.loyver
    : Array.isArray(loyverProp)
    ? loyverProp
    : [];
  const manyLoyver = (loyver?.filter(Boolean)?.length ?? 0) > 1;

  // Lokal sannhet for inputs — parent får sync på blur/knapper
  const [local, setLocal] = useState<KostItem[]>(() => {
    const src = (kostnader?.length ? kostnader : [{}]) as Partial<KostItem>[];
    return src.map((k) => ({
      kvittnr: asStr(k.kvittnr),
      loyve: k.loyve ?? (manyLoyver ? loyver[0]?.loyve ?? "" : ""),
      turpris: onlyDigits(asStr(k.turpris)),
      venting: onlyDigits(asStr(k.venting)),
      bom: onlyDigits(asStr(k.bom)),
      ferge: onlyDigits(asStr(k.ferge)),
      ekstra: onlyDigits(asStr(k.ekstra)),
      egenandel: onlyDigits(asStr(k.egenandel)),
    }));
  });

  // Hvis parent endrer ANTALL kolonner, juster lengden – ikke rør verdier
  useEffect(() => {
    const want = Math.max(1, kostnader?.length ?? 0);
    if (local.length !== want) {
      const next: KostItem[] = [];
      for (let i = 0; i < want; i++) {
        const k = (kostnader[i] ?? {}) as Partial<KostItem>;
        next.push({
          kvittnr: asStr(k.kvittnr),
          loyve: k.loyve ?? (manyLoyver ? loyver[0]?.loyve ?? "" : ""),
          turpris: onlyDigits(asStr(k.turpris)),
          venting: onlyDigits(asStr(k.venting)),
          bom: onlyDigits(asStr(k.bom)),
          ferge: onlyDigits(asStr(k.ferge)),
          ekstra: onlyDigits(asStr(k.ekstra)),
          egenandel: onlyDigits(asStr(k.egenandel)),
        });
      }
      setLocal(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kostnader?.length, manyLoyver]);

  const patch = (idx: number, p: Partial<KostItem>) =>
    setLocal((prev) => prev.map((x, i) => (i === idx ? { ...x, ...p } : x)));

  // Sync TIL parent – på blur/knapper
  const syncToParent = () => {
    setKostnader(
      local.map((k) => ({
        kvittnr: k.kvittnr,
        loyve: k.loyve,
        turpris: k.turpris,
        venting: k.venting,
        bom: k.bom,
        ferge: k.ferge,
        ekstra: k.ekstra,
        egenandel: k.egenandel,
      }))
    );
  };

  const emptyItem = (): KostItem => ({
    kvittnr: "",
    loyve: manyLoyver ? loyver[0]?.loyve ?? "" : "",
    turpris: "",
    venting: "",
    bom: "",
    ferge: "",
    ekstra: "",
    egenandel: "",
  });

  const addCol = () => {
    setLocal((prev) => [...prev, emptyItem()]);
    setTimeout(syncToParent, 0);
  };

  const clearAll = () => {
    const one = emptyItem();
    setLocal([one]);
    setKostnader([one]);
  };

  const deleteCol = (delIdx: number) => {
    setLocal((prev) => {
      if (prev.length <= 1) {
        const one = emptyItem();
        setTimeout(() => setKostnader([one]), 0);
        return [one];
      }
      const next = prev.filter((_, i) => i !== delIdx);
      setTimeout(() => setKostnader(next), 0);
      return next;
    });
  };

  const sumTotal = useMemo(() => local.reduce((a, it) => a + totalOf(it), 0), [local]);
  const sumMva = useMemo(() => local.reduce((a, it) => a + mva12(totalOf(it)), 0), [local]);

  // ---------- Fokus-lås (robust) ----------
  const activeFid = useRef<string | null>(null);
  const caret = useRef<{ start: number | null; end: number | null }>({ start: null, end: null });

  // Gjenopprett caret KUN for aktivt felt (hindrer hopping)
  useLayoutEffect(() => {
    if (!activeFid.current) return;
    const el = document.querySelector<HTMLInputElement>(`[data-fid="${activeFid.current}"]`);
    if (!el) return;
    const active = document.activeElement as HTMLElement | null;
    if (!active || active.getAttribute?.("data-fid") !== activeFid.current) return;

    if (el.setSelectionRange && caret.current.start !== null && caret.current.end !== null) {
      try {
        el.setSelectionRange(caret.current.start, caret.current.end);
      } catch {}
    }
  });

  const rememberCaret = (
    fid: string,
    e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>
  ) => {
    activeFid.current = fid;
    caret.current = {
      start: (e.target as HTMLInputElement).selectionStart,
      end: (e.target as HTMLInputElement).selectionEnd,
    };
  };

  const clearActiveIf = (fid: string) => {
    if (activeFid.current === fid) {
      activeFid.current = null;
      caret.current = { start: null, end: null };
    }
  };

  // UI-klasser
  const box =
    "rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border";
  const normalBorder = "border-gray-400 dark:border-gray-600";
  const requiredBorder = "border-red-600";

  // Money input – viser tusenskille når feltet IKKE har fokus
  const Money: React.FC<{
    id: string;      // unikt per felt
    v: string;       // bare sifre i state
    onChange: (s: string) => void;
    bold?: boolean;
    maxLen?: number;
  }> = ({ id, v, onChange, bold, maxLen = 8 }) => {
    const fid = `money-${id}`;
    const isActive = activeFid.current === fid;
    const raw = onlyDigits(v).slice(0, maxLen);
    const display = isActive ? raw : formatThousands(raw);

    return (
      <div className="flex items-center gap-2">
        <input
          data-fid={fid}
          id={id}
          type="text"
          inputMode="numeric"
          className={`${box} ${normalBorder} w-[8ch] ${bold ? "font-semibold" : ""}`}
          value={display}
          onChange={(e) => {
            const next = onlyDigits(e.currentTarget.value).slice(0, maxLen);
            onChange(next);
            rememberCaret(fid, e);
          }}
          onFocus={(e) => rememberCaret(fid, e)}
          onBlur={() => {
            clearActiveIf(fid);
            syncToParent();
          }}
        />
        <span className="text-sm text-gray-700 dark:text-gray-200">NOK</span>
      </div>
    );
  };

  // Kvitteringsnummer – godkjent så lenge det ikke er tomt
  const Kvitt: React.FC<{
    id: string;
    v: string;
    onChange: (s: string) => void;
  }> = ({ id, v, onChange }) => {
    const fid = `kvitt-${id}`;
    return (
      <input
        data-fid={fid}
        id={id}
        type="text"
        inputMode="text"
        className={`${box} ${(v ?? "").trim() === "" ? requiredBorder : normalBorder} w-[12ch]`}
        value={v}
        onChange={(e) => {
          onChange(e.currentTarget.value);
          rememberCaret(fid, e);
        }}
        onFocus={(e) => rememberCaret(fid, e)}
        onBlur={() => {
          clearActiveIf(fid);
          syncToParent();
        }}
      />
    );
  };

  return (
    <section className={sectionCard}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold">Kostnader</h2>
        <div className="flex gap-2">
          <button type="button" onClick={addCol} className={btnPrimary}>
            Legg til
          </button>
          <button type="button" onClick={clearAll} className={btnDanger}>
            Fjern Alt
          </button>
        </div>
      </div>

      {/* Responsiv GRID: mobil 1, desktop maks 4 per rad */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {local.map((k, idx) => {
          const total = totalOf(k);
          const mva = mva12(total);

          return (
            <div key={idx} className="p-3 border rounded-lg">
              {/* Tittel + Slett (rødt kryss) */}
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Tur {idx + 1}</div>
                <button
                  type="button"
                  aria-label={`Slett Tur ${idx + 1}`}
                  title={`Slett Tur ${idx + 1}`}
                  onClick={() => deleteCol(idx)}
                  className={chipDanger}
                >
                  ✕
                </button>
              </div>

              {/* Løyve over kvittnr når >1 løyve (smal bredde) */}
              {manyLoyver && (
                <div className="mb-3">
                  <label className="block text-sm mb-1">Løyve:</label>
                  <select
                    className={`${box} ${normalBorder} w-[12ch]`}
                    value={k.loyve ?? ""}
                    onChange={(e) => patch(idx, { loyve: e.target.value })}
                    onBlur={syncToParent}
                  >
                    {loyver.map((l) => (
                      <option key={l.loyve} value={l.loyve}>
                        {l.loyve}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kvitteringsnummer */}
              <div className="mb-3">
                <label className="block text-sm mb-1">Kvitteringsnummer:</label>
                <Kvitt
                  id={`kvittnr-${idx}`}
                  v={k.kvittnr}
                  onChange={(s) => patch(idx, { kvittnr: s })}
                />
              </div>

              {/* Linje 1–6 med NOK */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Turpris:</label>
                  <Money id={`turpris-${idx}`} v={k.turpris} onChange={(s) => patch(idx, { turpris: s })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Venting:</label>
                  <Money id={`venting-${idx}`} v={k.venting} onChange={(s) => patch(idx, { venting: s })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Bompeng:</label>
                  <Money id={`bom-${idx}`} v={k.bom} onChange={(s) => patch(idx, { bom: s })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Fergepeng:</label>
                  <Money id={`ferge-${idx}`} v={k.ferge} onChange={(s) => patch(idx, { ferge: s })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Ekstra:</label>
                  <Money id={`ekstra-${idx}`} v={k.ekstra} onChange={(s) => patch(idx, { ekstra: s })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Eigenandel:</label>
                  <Money id={`egen-${idx}`} v={k.egenandel} onChange={(s) => patch(idx, { egenandel: s })} />
                </div>

                {/* Totalpris */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Totalpris:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      className={`${box} ${normalBorder} w-[10ch] font-semibold`}
                      value={formatThousands(String(Math.round(total)))}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">NOK</span>
                  </div>
                </div>

                {/* Herav MVA 12% */}
                <div>
                  <label className="block text-sm mb-1">Herav MVA 12%:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      className={`${box} ${normalBorder} w-[10ch]`}
                      value={formatThousands(String(Math.round(mva)))}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">NOK</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summeringer nederst */}
      <hr className="my-4 border-gray-400 dark:border-gray-600" />
      <div className="grid gap-3 sm:grid-cols-2 max-w-[560px]">
        <div>
          <label className="block text-sm font-semibold mb-1">Total Sum:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              className={`${box} ${normalBorder} w-[12ch] font-semibold`}
              value={formatThousands(String(Math.round(sumTotal)))}
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">NOK</span>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Total MVA 12%:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              className={`${box} ${normalBorder} w-[12ch]`}
              value={formatThousands(String(Math.round(sumMva)))}
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">NOK</span>
          </div>
        </div>
      </div>
    </section>
  );
}
