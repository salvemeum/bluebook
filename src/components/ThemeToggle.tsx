import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Init fra localStorage / prefers-color-scheme
  useEffect(() => {
    const stored = localStorage.getItem("theme"); // "dark" | "light" | null
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const useDark = stored ? stored === "dark" : !!prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
    setIsDark(useDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Bytt til lys" : "Bytt til mørk"}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white text-gray-900
                 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <span className="text-sm">{isDark ? "Lyst tema" : "Mørkt tema"}</span>
      <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
