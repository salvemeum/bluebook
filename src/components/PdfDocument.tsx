// src/components/PdfDocument.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export type KostItem = {
  kvittnr?: string;
  turpris?: number | string;
  venting?: number | string;
  bom?: number | string;
  ferge?: number | string;
  ekstra?: number | string;
  egenandel?: number | string;
  loyve?: string;
};

type Props = {
  formData: any;
  kostnader: KostItem[];
  vedlegg?: File[];
};

const styles = StyleSheet.create({
  page: { fontSize: 10, padding: 18, fontFamily: "Helvetica" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  logoBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  logo: { width: 110 },
  companyBox: { textAlign: "right" },
  title: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: 6,
    fontWeight: 700,
  },
  card: {
    border: "1pt solid #000",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 2,
  },
  col: { flexDirection: "row", flexGrow: 1, gap: 4 },
  label: { fontWeight: 700 },
  val: { flexShrink: 1 },
  sectionHeading: {
    fontWeight: 700,
    marginBottom: 4,
    fontSize: 11,
  },
  hr: { borderBottom: "1pt solid #000", marginVertical: 6 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    marginTop: 6,
  },
  totalsCol: { width: 220 },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
});

// ---- utils
const notEmpty = (v?: any) => {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  return true;
};

const toNumber = (v: any) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return isFinite(n) ? n : 0;
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("no-NO", { minimumFractionDigits: 0 }).format(n);

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
};

export default function PdfDocument({
  formData = {},
  kostnader = [],
  vedlegg = [],
}: Props) {
  // Logo (valgfri)
  const logoSrc = formData.logo || "/logo.png";

  // Fast firmainfo
  const firmaNavn = "Voss Taxi SA";
  const firmaAdr = "Uttrågata 19";
  const firmaPost = "5700 Voss";
  const firmaTlf = "+47 56 51 13 40";
  const orgnr = "Org.nr: 999505279";

  // Dato/tid
  const dato = formatDate(formData.dato);
  const tid = formData.tid || "";
  const start = formData.start || formData.starttid || "";
  const slutt = formData.slutt || formData.slutttid || "";

  // Turinfo – rutenummer fallback
  const rutenr = formData.rute || formData.rutenr || "";

  // Alle turer med løyver
  const turer = Array.isArray(formData.turer) ? formData.turer : [];

  // Totals
  const sums = kostnader.reduce(
    (acc, k) => {
      const turpris = toNumber(k.turpris);
      const venting = toNumber(k.venting);
      const ekstra = toNumber(k.ekstra);
      const bom = toNumber(k.bom);
      const ferge = toNumber(k.ferge);
      const egenandel = toNumber(k.egenandel);

      const taxable = turpris + venting + ekstra;
      const nonTaxable = bom + ferge;
      const mva = Math.round(taxable * 0.12);

      acc.taxable += taxable;
      acc.nonTaxable += nonTaxable;
      acc.mva += mva;
      acc.egenandel += egenandel;
      return acc;
    },
    { taxable: 0, nonTaxable: 0, mva: 0, egenandel: 0 }
  );

  const sumEksMva = sums.taxable + sums.nonTaxable;
  const totalInklMva = sumEksMva + sums.mva;

  // Helper
  const Pair = ({
    leftLabel,
    leftValue,
    rightLabel,
    rightValue,
  }: {
    leftLabel?: string;
    leftValue?: any;
    rightLabel?: string;
    rightValue?: any;
  }) => {
    const leftOk = notEmpty(leftValue);
    const rightOk = notEmpty(rightValue);
    if (!leftOk && !rightOk) return null;
    return (
      <View style={styles.row}>
        {leftOk ? (
          <View style={styles.col}>
            <Text style={styles.label}>{leftLabel}</Text>
            <Text style={styles.val}>{String(leftValue)}</Text>
          </View>
        ) : (
          <View style={styles.col} />
        )}
        {rightOk ? (
          <View style={styles.col}>
            <Text style={styles.label}>{rightLabel}</Text>
            <Text style={styles.val}>{String(rightValue)}</Text>
          </View>
        ) : (
          <View style={styles.col} />
        )}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            {notEmpty(logoSrc) ? <Image src={logoSrc} style={styles.logo} /> : null}
          </View>
          <View style={styles.companyBox}>
            <Text style={{ fontWeight: 700 }}>{firmaNavn}</Text>
            <Text>{firmaAdr}</Text>
            <Text>{firmaPost}</Text>
            <Text>{firmaTlf}</Text>
            <Text>{orgnr}</Text>
          </View>
        </View>

        <Text style={styles.title}>Rekning</Text>

        {/* Løyver valgt pr tur */}
        {turer.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Løyver</Text>
            {turer.map((tur: any, idx: number) =>
              Array.isArray(tur.loyver) && tur.loyver.length > 0 ? (
                tur.loyver.map((l: any, j: number) => (
                  <View key={`${idx}-${j}`} style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Løyve:</Text>
                      <Text style={styles.val}>{l.loyve}</Text>
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.label}>ID:</Text>
                      <Text style={styles.val}>{l.sjoforId}</Text>
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.label}>Sjåfør:</Text>
                      <Text style={styles.val}>{l.sjoforNavn}</Text>
                    </View>
                  </View>
                ))
              ) : null
            )}
          </View>
        )}

        {/* Dato og tid */}
        {(notEmpty(dato) || notEmpty(tid) || notEmpty(start) || notEmpty(slutt)) && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Dato og tid</Text>
            <Pair leftLabel="Dato:" leftValue={dato} rightLabel="Tid:" rightValue={tid} />
            <Pair leftLabel="Start:" leftValue={start} rightLabel="Slutt:" rightValue={slutt} />
          </View>
        )}

        {/* Turinformasjon */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Turinformasjon</Text>
          <Pair leftLabel="Bookingnummer:" leftValue={formData.bookingnr} />
          <Pair leftLabel="Rutenummer:" leftValue={rutenr} rightLabel="Kunde:" rightValue={formData.kunde} />
          <Pair leftLabel="For:" leftValue={formData.for} rightLabel="Ved:" rightValue={formData.ved} />
          <Pair leftLabel="Frå:" leftValue={formData.fra} rightLabel="Til:" rightValue={formData.til} />
          {notEmpty(formData.referanse) && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Referanse:</Text>
                <Text style={styles.val}>{String(formData.referanse)}</Text>
              </View>
            </View>
          )}
          {notEmpty(formData.merknad) && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Merknad:</Text>
                <Text style={styles.val}>{String(formData.merknad)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Kostnader */}
        {kostnader.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Kostnader</Text>
            {kostnader.map((k, i) => {
              const turLabel = `Tur ${i + 1}`;
              return (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ fontWeight: 700, marginBottom: 2 }}>{turLabel}</Text>
                  <Pair
                    leftLabel="Kvitt.nr:"
                    leftValue={k.kvittnr}
                    rightLabel="Løyve:"
                    rightValue={k.loyve}
                  />
                  <Pair leftLabel="Turpris:" leftValue={k.turpris} rightLabel="Venting:" rightValue={k.venting} />
                  <Pair leftLabel="Bompenger:" leftValue={k.bom} rightLabel="Ferge:" rightValue={k.ferge} />
                  <Pair leftLabel="Ekstra:" leftValue={k.ekstra} rightLabel="Egenandel:" rightValue={k.egenandel} />
                </View>
              );
            })}
            <View style={styles.hr} />
            <View style={styles.totalsRow}>
              <View style={styles.totalsCol}>
                <View style={styles.totalsLine}>
                  <Text>Sum eks. mva</Text>
                  <Text>{fmtMoney(sumEksMva)}</Text>
                </View>
                <View style={styles.totalsLine}>
                  <Text>MVA 12%</Text>
                  <Text>{fmtMoney(sums.mva)}</Text>
                </View>
                <View style={styles.totalsLine}>
                  <Text style={{ fontWeight: 700 }}>Total (inkl. mva)</Text>
                  <Text style={{ fontWeight: 700 }}>{fmtMoney(totalInklMva)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Vedlegg */}
        {Array.isArray(vedlegg) && vedlegg.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Vedlegg</Text>
            {vedlegg.map((v, idx) => (
              <Text key={idx}>{(v as any).name ?? `Vedlegg ${idx + 1}`}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
