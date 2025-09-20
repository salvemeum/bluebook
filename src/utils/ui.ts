// src/utils/ui.ts
export const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-medium shadow-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900";

export const btnPrimary =
  `${btnBase} bg-blue-600 text-white border-blue-700 hover:bg-blue-700 focus:ring-blue-500`;

export const btnSecondary =
  `${btnBase} bg-amber-500 text-white border-amber-600 hover:bg-amber-600 focus:ring-amber-400`;

export const btnGhost =
  `${btnBase} bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-400`;

export const btnDanger =
  `${btnBase} bg-red-600 text-white border-red-700 hover:bg-red-700 focus:ring-red-500`;
