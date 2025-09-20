import React, { useRef } from "react";
import { btnPrimary, btnDanger } from "../utils/ui";

interface Props {
  vedlegg: File[];
  setVedlegg: (arr: File[]) => void;
  formData: { [k: string]: any };
  setFormData: (data: any) => void;
}

export default function VedleggSection({ vedlegg, setVedlegg, formData, setFormData }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openPicker = () => inputRef.current?.click();

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const existing = new Set(vedlegg.map((f) => `${f.name}|${f.size}|${(f as any).lastModified}`));
    const toAdd: File[] = [];
    Array.from(files).forEach((f) => {
      const key = `${f.name}|${f.size}|${(f as any).lastModified}`;
      if (!existing.has(key)) {
        toAdd.push(f);
        existing.add(key);
      }
    });
    if (toAdd.length) setVedlegg([...vedlegg, ...toAdd]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (idx: number) => setVedlegg(vedlegg.filter((_, i) => i !== idx));
  const clearAll = () => setVedlegg([]);

  const prettySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <section className="bb-section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-600" />
          Vedlegg
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={openPicker} className={btnPrimary} title="Legg til fil(er)">
            ➕ Legg til fil
          </button>
          <button
            type="button"
            onClick={clearAll}
            className={btnDanger}
            title="Fjern alle vedlegg"
            disabled={vedlegg.length === 0}
          >
            🗑 Fjern alt
          </button>
        </div>
      </div>

      {/* Skjult input for filvalg */}
      <input ref={inputRef} type="file" multiple onChange={(e) => addFiles(e.currentTarget.files)} className="hidden" />

      {/* Liste over valgte vedlegg */}
      {vedlegg.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ingen vedlegg valgt. Trykk <span className="font-semibold">Legg til fil</span> for å velge.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {vedlegg.map((f, idx) => (
            <li
              key={`${f.name}-${f.size}-${(f as any).lastModified}`}
              className="py-2 flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {f.type || "ukjent type"} · {prettySize(f.size)}
                </div>
              </div>
              <button
                type="button"
                aria-label={`Fjern ${f.name}`}
                title={`Fjern ${f.name}`}
                onClick={() => removeAt(idx)}
                className="bb-chip-danger"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
        Vedleggene legges inn i PDF-en i samme rekkefølge som her, hver på egen side.
      </div>
    </section>
  );
}
