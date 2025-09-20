import { pdf } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import PdfView from "../components/PdfView";

interface VedleggItem {
  file: File;
  preview?: string; // base64 bilde (doc/xls konvertert)
}

export async function generatePdfBlob(
  formData: any,
  kostnader: any[],
  loyver: any[],
  vedlegg: VedleggItem[]
) {
  // 1. Lag hoved-PDF
  const doc = (
    <PdfView formData={formData} kostnader={kostnader} loyver={loyver} />
  );
  const mainBlob = await pdf(doc).toBlob();
  const mainPdf = await PDFDocument.load(await mainBlob.arrayBuffer());

  // 2. Legg til vedlegg
  for (const v of vedlegg) {
    const file = v.file;

    if (file.type.startsWith("image/")) {
      // Bilder direkte
      const imgBytes = await file.arrayBuffer();
      let img;
      if (file.type === "image/png") img = await mainPdf.embedPng(imgBytes);
      else img = await mainPdf.embedJpg(imgBytes);

      const page = mainPdf.addPage([595, 842]); // A4
      const { width, height } = img.scaleToFit(500, 700);
      page.drawText(file.name, { x: 50, y: 800, size: 12 });
      page.drawImage(img, { x: 50, y: 100, width, height });
    } else if (file.type === "application/pdf") {
      // PDF → merge inn
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mainPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((p) => mainPdf.addPage(p));
    } else if (v.preview) {
      // DOCX/XLSX → konvertert bilde
      const imgBytes = await fetch(v.preview).then((res) => res.arrayBuffer());
      const img = await mainPdf.embedPng(imgBytes);

      const page = mainPdf.addPage([595, 842]);
      const { width, height } = img.scaleToFit(500, 700);
      page.drawText(file.name, { x: 50, y: 800, size: 12 });
      page.drawImage(img, { x: 50, y: 100, width, height });
    } else {
      // Fallback
      const page = mainPdf.addPage([595, 842]);
      page.drawText(`Vedlegg (ikke støttet): ${file.name}`, {
        x: 50,
        y: 750,
        size: 14,
      });
    }
  }

  // 3. Ferdig PDF
  return await mainPdf.save();
}
