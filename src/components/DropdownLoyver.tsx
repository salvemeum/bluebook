import { useEffect, useMemo, useState } from "react";
import { capitalizeName } from "../utils/format";

type LoyveEntry = {
  loyve: string;
  sjoforId: string;
  sjoforNavn: string;
};

interface Props {
  formData: { [k: string]: any };
  setFormData: (data: any) => void;
  turIndex: number; // NY prop: hvilken tur denne dropdownen tilhører
}

export default function DropdownLoyver({ formData, setFormData, turIndex }: Props) {
  const [biler, setBiler] = useState<string[]>([]);
  const [sjoff, setSjoff] = useState<{ id: string; navn: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  const turer = Array.isArray(formData?.turer) ? formData.turer : [];
  const currentTur = turer[turIndex] || { loyver: [] };

  const selected: LoyveEntry[] = useMemo(
    () => (Array.isArray(currentTur?.loyver) ? currentTur.loyver : []),
    [currentTur?.loyver]
  );

  // Last inn biler.txt
  useEffect(() => {
    fetch("/biler.txt")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        setBiler(lines);
      })
      .catch(() => setBiler([]));
  }, []);

  // Last inn sjoff.txt
  useEffect(() => {
    fetch("/sjoff.txt")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const parsed = lines.map((line) => {
          const [id, ...rest] = line.split(/\s+/);
          return { id, navn: capitalizeName(rest.join(" ")) };
        });
        setSjoff(parsed);
      })
      .catch(() => setSjoff([]));
  }, []);

  function updateFormData(nextLoyver: LoyveEntry[]) {
    const nextTurer = [...turer];
    nextTurer[turIndex] = { ...currentTur, loyver: nextLoyver };
    setFormData({ ...formData, turer: nextTurer });
  }

  function toggleLoyve(loyve: string) {
    const exists = selected.find((s) => s.loyve === loyve);
    let next: LoyveEntry[];
    if (exists) {
      next = selected.filter((s) => s.loyve !== loyve);
    } else {
      // start med tomme (skal vises rødt)
      next = [...selected, { loyve, sjoforId: "", sjoforNavn: "" }];
    }
    updateFormData(next);
    setOpen(false);
  }

  function updateLoyve(loyve: string, field: "sjoforId" | "sjoforNavn", value: string) {
    let next = selected.map((s) => {
      if (s.loyve !== loyve) return s;
      return { ...s, [field]: value };
    });

    // Lookup fra ID
    if (field === "sjoforId") {
      const hit = sjoff.find((s) => s.id === value);
      if (hit) {
        next = next.map((s) =>
          s.loyve === loyve ? { ...s, sjoforId: hit.id, sjoforNavn: hit.navn } : s
        );
      }
    }

    // Lookup fra Navn
    if (field === "sjoforNavn") {
      const formatted = capitalizeName(value);
      const hit = sjoff.find((s) => s.navn.toLowerCase() === formatted.toLowerCase());
      if (hit) {
        next = next.map((s) =>
          s.loyve === loyve ? { ...s, sjoforId: hit.id, sjoforNavn: hit.navn } : s
        );
      } else {
        next = next.map((s) =>
          s.loyve === loyve ? { ...s, sjoforNavn: formatted } : s
        );
      }
    }

    updateFormData(next);
  }

  const noneSelected = selected.length === 0;

  return (
    <section className="bb-section">
      <h2 className="font-bold mb-2">Løyver:</h2>

      {/* Dropdown-knapp – OBLIGATORISK: rød når ingen valgt */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`bb-input w-full text-left py-2 ${noneSelected ? "bb-input--error" : ""}`}
          aria-invalid={noneSelected}
          title={noneSelected ? "Velg minst ett løyve" : "Endre løyver"}
        >
          {noneSelected ? "Velg Løyve" : selected.map((s) => s.loyve).join(", ")}
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-lg border-2 border-gray-800/60 dark:border-gray-200/60 bg-white dark:bg-gray-900 shadow-lg max-h-60 overflow-y-auto">
            <ul>
              {biler.map((loyve) => {
                const checked = !!selected.find((s) => s.loyve === loyve);
                return (
                  <li key={loyve}>
                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-red-600"
                        checked={checked}
                        onChange={() => toggleLoyve(loyve)}
                      />
                      <span>{loyve}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Hjelpetekst når ingen valgt */}
      {noneSelected && (
        <p className="mt-2 text-sm text-red-600">Minst ett løyve er påkrevd.</p>
      )}

      {/* Liste med valgte løyver */}
      <div className="mt-4 space-y-2">
        {selected.map((item) => {
          const idEmpty = (item.sjoforId ?? "").trim().length === 0;
          const navnEmpty = (item.sjoforNavn ?? "").trim().length === 0;

          return (
            <div
              key={item.loyve}
              className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border-2 border-gray-800/40 dark:border-gray-200/30"
            >
              <span className="min-w-[5rem] font-semibold">{item.loyve}</span>

              {/* ID input – OBLIGATORISK */}
              <label className="flex items-center gap-2">
                <span>ID:</span>
                <input
                  type="text"
                  maxLength={6}
                  value={item.sjoforId ?? ""}
                  onChange={(e) => updateLoyve(item.loyve, "sjoforId", e.target.value)}
                  className={`bb-input w-24 ${idEmpty ? "bb-input--error" : ""}`}
                  aria-invalid={idEmpty}
                />
              </label>

              {/* Navn input – OBLIGATORISK */}
              <label className="flex flex-col gap-1 relative w-80 max-w-full">
                <div className="flex items-center gap-2">
                  <span>Navn:</span>
                  <input
                    type="text"
                    maxLength={35}
                    value={item.sjoforNavn ?? ""}
                    onFocus={() => {
                      setActiveSuggest(item.loyve);
                      setShowSuggest(true);
                    }}
                    onChange={(e) => {
                      updateLoyve(item.loyve, "sjoforNavn", e.target.value);
                      setActiveSuggest(item.loyve);
                      setShowSuggest(true);
                    }}
                    className={`bb-input flex-1 ${navnEmpty ? "bb-input--error" : ""}`}
                    aria-invalid={navnEmpty}
                  />
                </div>

                {/* Autocomplete liste */}
                {activeSuggest === item.loyve && showSuggest && (item.sjoforNavn ?? "").length > 1 && (
                  <ul className="absolute left-12 top-10 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded shadow-md max-h-40 overflow-y-auto w-64 z-10">
                    {sjoff
                      .filter((s) =>
                        s.navn.toLowerCase().includes((item.sjoforNavn ?? "").toLowerCase())
                      )
                      .slice(0, 6)
                      .map((s) => (
                        <li
                          key={s.id}
                          onMouseDown={() => {
                            const next = selected.map((l) =>
                              l.loyve === item.loyve
                                ? { ...l, sjoforId: s.id, sjoforNavn: s.navn }
                                : l
                            );
                            updateFormData(next);
                            setActiveSuggest(null);
                            setShowSuggest(false);
                          }}
                          className="px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {s.navn} ({s.id})
                        </li>
                      ))}
                  </ul>
                )}
              </label>

              {/* Fjern knapp */}
              <button
                type="button"
                onClick={() => toggleLoyve(item.loyve)}
                className="ml-auto text-red-600 hover:text-red-800 font-bold px-2"
                title="Fjern løyve"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
