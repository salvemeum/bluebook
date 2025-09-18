import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  formData: { [k: string]: any };
  setFormData: (data: any) => void;
}

/** Helpers */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function isoToDisplay(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}
function displayToISO(display: string): string | null {
  const m = display.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return null;
  let dd = parseInt(m[1], 10);
  let mm = parseInt(m[2], 10);
  const yyyy = parseInt(m[3], 10);
  if (mm < 1 || mm > 12) return null;
  const daysInMonth = new Date(yyyy, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) return null;
  return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
}
function normalizeTime(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return "";
  let h = 0, m = 0;
  if (digits.length <= 2) {
    h = parseInt(digits, 10);
    m = 0;
  } else if (digits.length === 3) {
    h = parseInt(digits.slice(0, 1), 10);
    m = parseInt(digits.slice(1), 10);
  } else {
    h = parseInt(digits.slice(0, 2), 10);
    m = parseInt(digits.slice(2, 4), 10);
  }
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  if (h > 23) h = 23;
  if (m > 59) m = 59;
  return `${pad2(h)}:${pad2(m)}`;
}

export default function DateTimeSection({ formData, setFormData }: Props) {
  const [dateText, setDateText] = useState<string>("");
  const [startText, setStartText] = useState<string>(formData.starttid ?? "");
  const [sluttText, setSluttText] = useState<string>(formData.sluttid ?? "");
  const calendarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!formData.dato) {
      const iso = todayISO();
      setFormData({ ...formData, dato: iso });
      setDateText(isoToDisplay(iso));
    } else {
      setDateText(isoToDisplay(formData.dato));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!formData.dato) setDateText("");
    else setDateText(isoToDisplay(formData.dato));
  }, [formData.dato]);
  useEffect(() => {
    setStartText(formData.starttid ?? "");
  }, [formData.starttid]);
  useEffect(() => {
    setSluttText(formData.sluttid ?? "");
  }, [formData.sluttid]);

  const dateIsValid = useMemo(() => !!displayToISO(dateText), [dateText]);
  const setISODate = (iso: string) => {
    setFormData({ ...formData, dato: iso });
    setDateText(isoToDisplay(iso));
  };

  const handleDateChange = (val: string) => {
    setDateText(val);
    const iso = displayToISO(val);
    if (iso) setFormData({ ...formData, dato: iso });
    else {
      const { dato, ...rest } = formData;
      setFormData(rest);
    }
  };
  const handleDateBlur = () => {
    const iso = displayToISO(dateText);
    if (iso) setISODate(iso);
    else if (!dateText.trim()) {
      const { dato, ...rest } = formData;
      setFormData(rest);
    }
  };
  const handleTimeChange = (field: "starttid" | "sluttid", raw: string) => {
    const next = raw.replace(/[^\d:]/g, "");
    if (field === "starttid") setStartText(next);
    else setSluttText(next);
  };
  const handleTimeBlur = (field: "starttid" | "sluttid", raw: string) => {
    const norm = normalizeTime(raw);
    if (field === "starttid") setStartText(norm);
    else setSluttText(norm);
    setFormData({ ...formData, [field]: norm });
  };
  const openCalendar = () => {
    try {
      // @ts-ignore
      calendarRef.current?.showPicker?.();
    } catch {}
    calendarRef.current?.click();
  };

  return (
    <section className="p-4 border-2 border-black dark:border-white rounded-xl">
      <h2 className="font-bold mb-2">Dato / Tid</h2>

      <div className="flex flex-wrap gap-6 items-end">
        {/* Dato */}
        <label className="flex flex-col">
          <span className="mb-1">Dato:</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/yyyy"
              value={dateText}
              onChange={(e) => handleDateChange(e.target.value)}
              onBlur={handleDateBlur}
              className={`rounded px-2 py-1 bg-white dark:bg-gray-700 w-[13ch] text-center tracking-wider ${
                dateIsValid
                  ? "border border-gray-400 dark:border-gray-600"
                  : "border-2 border-primary"
              }`}
            />
            <button
              type="button"
              onClick={openCalendar}
              className="px-2 py-1 rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              title="Velg dato"
            >
              📅
            </button>
            <input
              ref={calendarRef}
              type="date"
              value={formData.dato ?? ""}
              onChange={(e) => {
                const iso = e.target.value;
                if (iso) setISODate(iso);
              }}
              className="hidden"
            />
          </div>
        </label>

        {/* Starttid */}
        <label className="flex flex-col">
          <span className="mb-1">Start:</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="hh:mm"
            value={startText}
            onChange={(e) => handleTimeChange("starttid", e.target.value)}
            onBlur={(e) => handleTimeBlur("starttid", e.target.value)}
            className="rounded px-2 py-1 bg-white dark:bg-gray-700 w-[7ch] text-center border border-gray-400 dark:border-gray-600"
          />
        </label>

        {/* Sluttid */}
        <label className="flex flex-col">
          <span className="mb-1">Slutt:</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="hh:mm"
            value={sluttText}
            onChange={(e) => handleTimeChange("sluttid", e.target.value)}
            onBlur={(e) => handleTimeBlur("sluttid", e.target.value)}
            className="rounded px-2 py-1 bg-white dark:bg-gray-700 w-[7ch] text-center border border-gray-400 dark:border-gray-600"
          />
        </label>
      </div>
    </section>
  );
}
