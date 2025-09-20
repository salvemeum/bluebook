// src/components/DropdownLoyver.tsx
import { useEffect, useState } from "react";
import { capitalizeName } from "../utils/format";

type LoyveEntry = {
  loyve: string;
  sjoforId: string;
  sjoforNavn: string;
};

interface Props {
  loyver: LoyveEntry[];
  setLoyver: (list: LoyveEntry[]) => void;
  formData?: any;
  setFormData?: (data: any) => void;
}

export default function DropdownLoyver({
  loyver,
  setLoyver,
  formData,
  setFormData,
}: Props) {
  const [biler, setBiler] = useState<string[]>([]);
  const [sjoff, setSjoff] = useState<{ id: string; navn: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  // Last inn biler.txt (liste over løyvenummer)
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}biler.txt`)

      .then((res) => res.text())
      .then((text) => {
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        setBiler(lines);
      })
      .catch(() => setBiler([]));
  }, []);

  // Last inn sjoff.txt (ID + navn)
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}sjoff.txt`)

      .then((res) => res.text())
      .then((text) => {
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const parsed = lines.map((line) => {
          const [id, ...rest] = line.split(/\s+/);
          return { id, navn: capitalizeName(rest.join(" ")) };
        });
        setSjoff(parsed);
      })
      .catch(() => setSjoff([]));
  }, []);

  function syncFormData(next: LoyveEntry[]) {
    if (setFormData) {
      setFormData({
        ...(formData ?? {}),
        loyver: next, // valgfri sync for kompatibilitet
      });
    }
  }

  function toggleLoyve(loyveNr: string) {
    const exists = loyver.find((s) => s.loyve === loyveNr);
    let next: LoyveEntry[];
    if (exists) {
      next = loyver.filter((s) => s.loyve !== loyveNr);
    } else {
      next = [...loyver, { loyve: loyveNr, sjoforId: "", sjoforNavn: "" }];
    }
    setLoyver(next);
    syncFormData(next);
    setOpen(false);
  }

  function updateLoyve(
    loyveNr: string,
    field: "sjoforId" | "sjoforNavn",
    value: string
  ) {
    let next = loyver.map((s) => {
      if (s.loyve !== loyveNr) return s;
      return { ...s, [field]: value };
    });

    // Lookup fra ID
    if (field === "sjoforId") {
      const hit = sjoff.find((s) => s.id === value);
      if (hit) {
        next = next.map((s) =>
          s.loyve === loyveNr
            ? { ...s, sjoforId: hit.id, sjoforNavn: hit.navn }
            : s
        );
      }
    }

    // Lookup fra Navn
    if (field === "sjoforNavn") {
      const formatted = capitalizeName(value);
      const hit = sjoff.find(
        (s) => s.navn.toLowerCase() === formatted.toLowerCase()
      );
      if (hit) {
        next = next.map((s) =>
          s.loyve === loyveNr
            ? { ...s, sjoforId: hit.id, sjoforNavn: hit.navn }
            : s
        );
      } else {
        next = next.map((s) =>
          s.loyve === loyveNr ? { ...s, sjoforNavn: formatted } : s
        );
      }
    }

    setLoyver(next);
    syncFormData(next);
  }

  const noneSelected = loyver.length === 0;

  return (
    <section className="bb-section">
      <h2 className="font-bold mb-2">Løyver:</h2>

      {/* Dropdown-knapp – OBLIGATORISK: rød når ingen valgt */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`bb-input w-full text-left py-2 ${
            noneSelected ? "bb-input--error" : ""
          }`}
          aria-invalid={noneSelected}
          title={noneSelected ? "Velg minst ett løyve" : "Endre løyver"}
        >
          {noneSelected
            ? "Velg Løyve"
            : loyver.map((s) => s.loyve).join(", ")}
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-lg border-2 border-gray-800/60 dark:border-gray-200/60 bg-white dark:bg-gray-900 shadow-lg max-h-60 overflow-y-auto">
            <ul>
              {biler.map((loyveNr) => {
                const checked = !!loyver.find((s) => s.loyve === loyveNr);
                return (
                  <li key={loyveNr}>
                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-red-600"
                        checked={checked}
                        onChange={() => toggleLoyve(loyveNr)}
                      />
                      <span>{loyveNr}</span>
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
        <p className="mt-2 text-sm text-red-600">
          Minst ett løyve er påkrevd.
        </p>
      )}

      {/* Liste med valgte løyver */}
      <div className="mt-4 space-y-2">
        {loyver.map((item) => {
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
                  onChange={(e) =>
                    updateLoyve(item.loyve, "sjoforId", e.target.value)
                  }
                  className={`bb-input w-24 ${
                    idEmpty ? "bb-input--error" : ""
                  }`}
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
                    onBlur={() => {
                      // Lukk forslagslista når feltet mister fokus.
                      // Delay så klikk på forslag rekker å trigge før blur lukker den.
                      setTimeout(() => {
                        setActiveSuggest(null);
                        setShowSuggest(false);
                      }, 150);
                    }}
                    className={`bb-input flex-1 ${
                      navnEmpty ? "bb-input--error" : ""
                    }`}
                    aria-invalid={navnEmpty}
                  />
                </div>

                {/* Autocomplete */}
                {activeSuggest === item.loyve &&
                  showSuggest &&
                  (item.sjoforNavn ?? "").length > 1 && (
                    <ul className="absolute left-12 top-10 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded shadow-md max-h-40 overflow-y-auto w-64 z-10">
                      {sjoff
                        .filter((s) =>
                          s.navn
                            .toLowerCase()
                            .includes((item.sjoforNavn ?? "").toLowerCase())
                        )
                        .slice(0, 6)
                        .map((s) => (
                          <li
                            key={s.id}
                            onClick={() => {
                              const next = loyver.map((l) =>
                                l.loyve === item.loyve
                                  ? {
                                      ...l,
                                      sjoforId: s.id,
                                      sjoforNavn: s.navn,
                                    }
                                  : l
                              );
                              setLoyver(next);
                              syncFormData(next);
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
