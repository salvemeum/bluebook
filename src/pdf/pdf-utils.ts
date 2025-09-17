import { pdf } from "@react-pdf/renderer";

export async function pdfToBlob(doc: JSX.Element): Promise<Blob> {
  return await pdf(doc).toBlob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function openBlobInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  // ikke revoke med én gang – la bruker få åpnet
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function pdfToBase64(doc: JSX.Element): Promise<string> {
  const blob = await pdfToBlob(doc);
  const ab = await blob.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function printBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  // Call print når PDF-vieweren har åpnet
  const tryPrint = () => {
    try {
      w?.focus();
      w?.print();
    } catch {}
  };
  // Prøv både onload og litt delay (avhenger av viewer)
  w?.addEventListener("load", tryPrint);
  setTimeout(tryPrint, 800);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
