import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Dokument, { PDFData } from "../pdf/Dokument";
import { pdfToBlob, openBlobInNewTab, downloadBlob, printBlob } from "../pdf/pdf-utils";

const TripSchema = z.object({
  kunde: z.string().min(1, "Påkrevd"),
  fra: z.string().min(1, "Påkrevd"),
  til: z.string().min(1, "Påkrevd"),
  pris: z.coerce.number().min(0, "Må være ≥ 0"),
});

const FormSchema = z.object({
  dato: z.string().min(1, "Påkrevd"),
  mottakerEpost: z.string().email("Ugyldig e-post"),
  referanse: z.string().max(50).optional().or(z.literal("")),
  turer: z.array(TripSchema).min(1, "Minst én tur"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function FormSkjema() {
  const [vedlegg, setVedlegg] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dato: format(new Date(), "yyyy-MM-dd"),
      mottakerEpost: "",
      referanse: "",
      turer: [{ kunde: "", fra: "", til: "", pris: 0 }],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "turer" });

  // Samle data + vedlegg i formatet PDF-komponenten forventer
  const toPDFData = (data: FormValues): PDFData => ({
    ...data,
    vedlegg: vedlegg.map(v => ({ name: v.name, size: v.size })),
  });

  const onSubmitValidate = (data: FormValues) => {
    // Kun valideringsknappen
    console.log("Validert:", data, vedlegg);
    alert("Validering ok! Se Console for data.");
  };

  const onPreview = async (data: FormValues) => {
    const blob = await pdfToBlob(<Dokument data={toPDFData(data)} />);
    openBlobInNewTab(blob);
  };

  const onDownload = async (data: FormValues) => {
    const blob = await pdfToBlob(<Dokument data={toPDFData(data)} />);
    downloadBlob(blob, `rekning_${data.dato}.pdf`);
  };

  const onPrint = async (data: FormValues) => {
    const blob = await pdfToBlob(<Dokument data={toPDFData(data)} />);
    printBlob(blob);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitValidate)} className="mt-6 space-y-6">
      {/* Toppfelt */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Dato</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2"
            {...register("dato")}
          />
          {errors.dato && (
            <p className="text-red-600 text-sm mt-1">{errors.dato.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Mottaker e-post</label>
          <input
            type="email"
            placeholder="f.eks. regnskap@firma.no"
            className="w-full rounded border px-3 py-2"
            {...register("mottakerEpost")}
          />
          {errors.mottakerEpost && (
            <p className="text-red-600 text-sm mt-1">{errors.mottakerEpost.message}</p>
          )}
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium mb-1">Referanse (valgfritt)</label>
          <input
            type="text"
            placeholder="Fritekst / ordre / kunde-referanse"
            className="w-full rounded border px-3 py-2"
            {...register("referanse")}
          />
          {errors.referanse && (
            <p className="text-red-600 text-sm mt-1">{errors.referanse.message}</p>
          )}
        </div>
      </div>

      {/* Turer */}
      <section className="rounded-2xl border bg-white p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Turer</h2>
          <button
            type="button"
            onClick={() => append({ kunde: "", fra: "", til: "", pris: 0 })}
            className="px-3 py-1.5 rounded bg-black text-white text-sm"
          >
            + Legg til tur
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, i) => (
            <div key={field.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Tur {i + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-sm px-2 py-1 rounded border hover:bg-gray-50"
                  >
                    Fjern
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Kunde</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="Navn"
                      {...register(`turer.${i}.kunde` as const)}
                    />
                    {errors.turer?.[i]?.kunde && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.turer[i]!.kunde!.message}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fra</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="Start"
                    {...register(`turer.${i}.fra` as const)}
                  />
                  {errors.turer?.[i]?.fra && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.turer[i]!.fra!.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Til</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="Slutt"
                    {...register(`turer.${i}.til` as const)}
                  />
                  {errors.turer?.[i]?.til && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.turer[i]!.til!.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pris (NOK)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="w-full rounded border px-3 py-2"
                    {...register(`turer.${i}.pris` as const, { valueAsNumber: true })}
                  />
                  {errors.turer?.[i]?.pris && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.turer[i]!.pris!.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vedlegg */}
      <section className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Vedlegg (filer)</h2>
        <input
          type="file"
          multiple
          onChange={(e) => setVedlegg(Array.from(e.target.files || []))}
          className="block w-full rounded border p-2"
        />
        {vedlegg.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
            {vedlegg.map((f) => (
              <li key={f.name}>{f.name} ({Math.round(f.size / 1024)} kB)</li>
            ))}
          </ul>
        )}
      </section>

      {/* Knapper */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-white border">
          Valider
        </button>
        <button
          type="button"
          onClick={handleSubmit(onPreview)}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Forhåndsvis PDF
        </button>
        <button
          type="button"
          onClick={handleSubmit(onDownload)}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Last ned PDF
        </button>
        <button
          type="button"
          onClick={handleSubmit(onPrint)}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Skriv ut
        </button>
      </div>

      {/* Live-innsyn for utvikling */}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-gray-600">Vis live skjemadata</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
{JSON.stringify(
  { ...watch(), vedlegg: vedlegg.map(v => ({ name: v.name, size: v.size })) },
  null,
  2
)}
        </pre>
      </details>
    </form>
  );
}
