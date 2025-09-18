// src/components/VedleggSection.tsx
import React, { useRef } from "react";
import { btnPrimary, btnDanger, chipDanger, sectionCard } from "@/utils/ui";


interface Props {
  vedlegg: File[];
  setVedlegg: (arr: File[]) => void;
}

export default function VedleggSection({ vedlegg, setVedlegg }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const box =
    "rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border";
  const normalBorder = "border-gray-400 dark:border-gray-600";

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
    // tøm input så samme fil kan velges igjen senere
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (idx: number) => {
    const next = vedlegg.filter((_, i) => i !== idx);
    setVedlegg(next);
  };

  const clearAll = () => setVedlegg([]);

  const prettySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <section className="p-4 border-2 border-black dark:border-white rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold">Vedlegg</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openPicker}
            className="px-3 py-1 border rounded bg-white dark:bg-gray-800"
            title="Legg til fil(er)"
          >
            Legg til fil
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1 border rounded bg-white dark:bg-gray-800"
            title="Fjern alle vedlegg"
            disabled={vedlegg.length === 0}
          >
            Fjern alt
          </button>
        </div>
      </div>

      {/* Skjult input for filvalg */}
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => addFiles(e.currentTarget.files)}
        className="hidden"
      />

      {/* Liste over valgte vedlegg */}
      {vedlegg.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ingen vedlegg valgt. Trykk <span className="font-semibold">Legg til fil</span> for å velge.
        </p>
      ) : (
        <ul className="divide-y divide-gray-300 dark:divide-gray-600">
          {vedlegg.map((f, idx) => (
            <li key={`${f.name}-${f.size}-${(f as any).lastModified}`} className="py-2 flex items-center justify-between">
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
                className="ml-3 px-2 py-0.5 border rounded text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Hint om PDF */}
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
        Vedleggene legges inn i PDF-en i samme rekkefølge som her, hver på egen side.
      </div>
    </section>
  );
}
