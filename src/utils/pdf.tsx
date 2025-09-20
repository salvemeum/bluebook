// src/utils/pdf.tsx
import { pdf } from "@react-pdf/renderer";
import PdfDocument, { KostItem } from "../components/PdfDocument";

type GenerateArgs = {
  formData: any;
  kostnader: KostItem[];
  vedlegg: File[];
};

export async function generatePdfBlob({
  formData,
  kostnader,
  vedlegg,
}: GenerateArgs): Promise<Blob> {
  console.log("🚀 Data som sendes til PdfDocument:", {
    formData,
    kostnader,
    vedlegg,
  });

  const doc = (
    <PdfDocument
      formData={formData}
      kostnader={kostnader}
      vedlegg={vedlegg}
    />
  );

  const asPdf = pdf();
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();
  return blob;
}
