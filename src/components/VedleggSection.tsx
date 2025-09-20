import React, { useRef } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { renderAsync } from "docx-preview";

// pdfjs-dist oppsett for Vite (ESM / legacy build)
import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface VedleggItem {
  file: File;
  preview?: string;
}

interface Props {
  vedlegg: VedleggItem[];
  setVedlegg: React.Dispatch<React.SetStateAction<VedleggItem[]>>;
}

export default function VedleggSection({ vedlegg, setVedlegg }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const previews: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      previews.push(canvas.toDataURL("image/png"));
    }

    return previews;
  };

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: VedleggItem[] = [];

    for (const file of Array.from(e.target.files)) {
      let preview: string | undefined;

      if (file.type.startsWith("image/")) {
        // Bilder rett til base64
        preview = await fileToDataUrl(file);
        newFiles.push({ file, preview });
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // DOCX → HTML → Canvas → PNG (uten ramme/filnavn, skalert til A4)
        const buffer = await file.arrayBuffer();
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        document.body.appendChild(container);

        await renderAsync(buffer, container, null, {
          inWrapper: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
        });

        // Sett fast bredde ~ A4
        container.style.width = "794px";

        // Fjern evt. wrappers/headers som docx-preview la inn (ramme og filnavn)
        container
          .querySelectorAll(".docx-wrapper, .docx-header, .docx-title")
          .forEach((el) => el.remove());

        const canvas = await html2canvas(container);
        preview = canvas.toDataURL("image/png");

        document.body.removeChild(container);
        newFiles.push({ file, preview });
      } else if (
        file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        // XLS/XLSX → HTML → Canvas → PNG
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(ws);

        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.innerHTML = html;
        document.body.appendChild(container);

        const canvas = await html2canvas(container);
        preview = canvas.toDataURL("image/png");

        document.body.removeChild(container);
        newFiles.push({ file, preview });
      } else if (file.type === "application/pdf") {
        // PDF → PNG-bilder
        const previews = await convertPdfToImages(file);
        previews.forEach((p) => newFiles.push({ file, preview: p }));
      } else {
        // Andre filer: fallback til base64
        const dataUrl = await fileToDataUrl(file);
        newFiles.push({ file, preview: dataUrl });
      }
    }

    setVedlegg((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (idx: number) => {
    setVedlegg((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveAll = () => {
    setVedlegg([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="bb-section">
      <h2 className="font-bold mb-1">Vedlegg</h2>
      <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
        Last opp kvitteringer, dokument og lignende for å dokumentere turen!
      </p>

      <input
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        multiple
        ref={fileInputRef}
        onChange={handleAdd}
        className="hidden"
      />

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={openFileDialog}
          className="px-4 py-2 rounded-lg shadow-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          ➕ Legg til
        </button>
        {vedlegg.length > 0 && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="px-4 py-2 rounded-lg shadow-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            🗑️ Fjern alle
          </button>
        )}
      </div>

      <ul className="space-y-1">
        {vedlegg.map((v, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center bb-card px-2 py-1"
          >
            <span className="truncate">{v.file.name}</span>
            <button
              type="button"
              className="text-red-600 font-bold ml-2 hover:text-red-800"
              onClick={() => handleRemove(idx)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
