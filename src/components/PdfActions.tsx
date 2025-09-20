import React from "react";
import { btnPrimary, btnSecondary, btnGhost, btnDanger } from "../utils/ui";

interface Props {
  onPreview?: () => void;   // Vis PDF
  onSave?: () => void;      // Lagre PDF
  onPrint?: () => void;     // Skriv ut PDF
  onSend?: () => void;      // Send PDF
  loading?: boolean;        // disabler alle knapper ved prosessering
  className?: string;       // ekstra margin/padding hvis ønskelig
}

export default function PdfActions({
  onPreview,
  onSave,
  onPrint,
  onSend,
  loading = false,
  className = "",
}: Props) {
  return (
    <footer
      className={`mt-8 bb-section ${className}`}
      aria-label="PDF handlinger"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm opacity-80">
          • Filformat: PDF &nbsp;• Utskrift optimalisert &nbsp;• Vedlegg inkluderes
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={!onPreview || loading}
            className={`${btnGhost} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Forhåndsvis PDF i ny fane"
          >
            👁️ Vis PDF
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!onSave || loading}
            className={`${btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Generer og last ned PDF"
          >
            💾 Lagre PDF
          </button>

          <button
            type="button"
            onClick={onPrint}
            disabled={!onPrint || loading}
            className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Åpne utskriftsdialog"
          >
            🖨️ Skriv ut PDF
          </button>

          <button
            type="button"
            onClick={onSend}
            disabled={!onSend || loading}
            className={`${btnDanger} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Send PDF på e-post"
          >
            ✉️ Send PDF
          </button>
        </div>
      </div>
    </footer>
  );
}
