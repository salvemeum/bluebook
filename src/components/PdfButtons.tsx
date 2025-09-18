export default function PdfButtons() {
  return (
    <div className="flex justify-center space-x-2">
      <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">
        Vis PDF
      </button>
      <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">
        Lagre PDF
      </button>
      <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">
        Skriv ut PDF
      </button>
      <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">
        Send PDF
      </button>
    </div>
  );
}
