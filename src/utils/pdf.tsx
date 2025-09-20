// src/utils/pdf.tsx
import { pdf } from "@react-pdf/renderer";
import PdfView from "../components/PdfView";

type GenerateArgs = {
  formData: any;
  loyver: { loyve: string; sjoforId: string; sjoforNavn: string }[];
  kostnader: any[];
};

export async function generatePdfBlob({ formData, loyver, kostnader }: GenerateArgs) {
  const doc = (
    <PdfView
      kostnader={Array.isArray(kostnader) ? kostnader : []}
      formData={formData}
      loyver={Array.isArray(loyver) ? loyver : []}
    />
  );

  const asPdf = pdf();
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();

  return blob;
}
