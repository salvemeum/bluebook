// src/pdf/PdfDocument.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

interface Props {
  formData: any;
  loyver: any[];
  kostnader: any[];
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  page: { fontSize: 12, padding: 30, fontFamily: "Helvetica" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logo: { width: 120, height: 40, objectFit: "contain" },
  titleCenter: { textAlign: "center", fontSize: 20, fontWeight: "bold", flexGrow: 1, marginTop: 10 },
  companyInfo: { fontSize: 10, textAlign: "right" },

  section: { marginBottom: 12, padding: 6, border: "1pt solid #000" },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 6, borderBottom: "1pt solid #000" },

  row: { flexDirection: "row", marginBottom: 4, flexWrap: "wrap" },

  // To-kolonne-layout for Turinformasjon
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoCol: { width: "50%", paddingRight: 12 },

  label: { fontWeight: "bold" },

  card: { border: "1pt solid #000", padding: 6, marginBottom: 6 },
  fieldBlock: { marginBottom: 4 },

  totalRow: { marginTop: 10, borderTop: "1pt solid #000", paddingTop: 6 },
});

// ---------- HELPERS ----------
const hasVal = (v: any) => v !== undefined && v !== null && String(v).trim() !== "";

const InlineField: React.FC<{ label: string; value: any; after?: number }> = ({ label, value, after = 16 }) => {
  if (!hasVal(value)) return null;
  return (
    <>
      <Text style={styles.label}>{label}:</Text>
      <Text style={{ marginRight: after }}>{String(value)}</Text>
    </>
  );
};

const SingleLine: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (!hasVal(value)) return null;
  return (
    <View style={styles.fieldBlock}>
      <Text>
        <Text style={styles.label}>{label}:</Text> {String(value)}
      </Text>
    </View>
  );
};

// To kolonner på én linje – hver celle viser "Label: verdi" tett
const TwoColLine: React.FC<{
  left?: { label: string; value: any };
  right?: { label: string; value: any };
}> = ({ left, right }) => {
  const showLeft = left && hasVal(left.value);
  const showRight = right && hasVal(right.value);
  if (!showLeft && !showRight) return null;

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoCol}>
        {showLeft && (
          <Text>
            <Text style={styles.label}>{left!.label}:</Text> {String(left!.value)}
          </Text>
        )}
      </View>
      <View style={styles.infoCol}>
        {showRight && (
          <Text>
            <Text style={styles.label}>{right!.label}:</Text> {String(right!.value)}
          </Text>
        )}
      </View>
    </View>
  );
};

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const totalOf = (k: any) =>
  toNum(k.turpris) + toNum(k.venting) + toNum(k.bom) + toNum(k.ferge) + toNum(k.ekstra) - toNum(k.egenandel);
const mva12 = (sum: number) => (sum > 0 ? sum - sum / 1.12 : 0);

// ---------- COMPONENT ----------
export default function PdfDocument({ formData, loyver, kostnader }: Props) {
  const allLoyver = formData?.loyver?.length ? formData.loyver : loyver || [];

  const sumTotal = (kostnader || []).reduce((a, it) => a + totalOf(it), 0);
  const sumMva = (kostnader || []).reduce((a, it) => a + mva12(totalOf(it)), 0);

  // Dato (dd/MM/yyyy) – tid vises kun hvis eksplisitt satt (24t)
  const date = hasVal(formData?.dato) ? new Date(formData.dato) : null;
  const dateStr = date
    ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
    : "";
  const timeStr = hasVal(formData?.tid) ? String(formData.tid) : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <Text style={styles.titleCenter}>Rekning</Text>
          <View style={styles.companyInfo}>
            <Text>Voss Taxi SA</Text>
            <Text>Telefon: 56 51 10 00</Text>
            <Text>Org.nr: 123 456 789 MVA</Text>
          </View>
        </View>

        {/* LØYVER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Løyver</Text>
          {(allLoyver || []).map((l: any, idx: number) => (
            <View key={idx} style={[styles.row, { marginBottom: 2 }]}>
              <InlineField label="Løyve" value={l?.loyve} after={16} />
              <InlineField label="ID" value={l?.sjoforId} after={16} />
              <InlineField label="Navn" value={l?.sjoforNavn} after={0} />
            </View>
          ))}
        </View>

        {/* DATO & TID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dato og Tid</Text>
          <View style={styles.row}>
            {/* Dato rett etter "Dato:" */}
            <InlineField label="Dato" value={dateStr} after={24} />
            <InlineField label="Tid" value={timeStr} after={0} />
          </View>
        </View>

        {/* TURINFORMASJON */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Turinformasjon</Text>

          {/* Linje 1: Bookingnummer */}
          <SingleLine label="Bookingnummer" value={formData?.bookingnr} />

          {/* Linje 2: Rutenummer | Kunde */}
          <TwoColLine
            left={{ label: "Rutenummer", value: formData?.rutenr }}
            right={{ label: "Kunde", value: formData?.kunde }}
          />

          {/* Linje 3: For | Ved */}
          <TwoColLine
            left={{ label: "For", value: formData?.for }}
            right={{ label: "Ved", value: formData?.ved }}
          />

          {/* Linje 4: Frå | Til */}
          <TwoColLine
            left={{ label: "Frå", value: formData?.fra }}
            right={{ label: "Til", value: formData?.til }}
          />

          {/* Linje 5: Referanse */}
          <SingleLine label="Referanse" value={formData?.referanse} />

          {/* Linje 6: Merknad */}
          <SingleLine label="Merknad" value={formData?.merknad} />
        </View>

        {/* KOSTNADER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kostnader</Text>

          {(kostnader || []).map((k: any, idx: number) => {
            const total = totalOf(k);
            const mva = mva12(total);
            const show = (v: any) => (hasVal(v) ? String(v) + " NOK" : "");

            return (
              <View key={idx} style={styles.card}>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Tur {idx + 1}</Text>

                {/* Løyve på turkortet kun hvis det finnes flere løyver totalt */}
                {allLoyver.length > 1 && <SingleLine label="Løyve" value={k?.loyve} />}

                <SingleLine label="Kvitteringsnummer" value={k?.kvittnr} />
                <SingleLine label="Turpris" value={show(k?.turpris)} />
                <SingleLine label="Venting" value={show(k?.venting)} />
                <SingleLine label="Bompeng" value={show(k?.bom)} />
                <SingleLine label="Fergepeng" value={show(k?.ferge)} />
                <SingleLine label="Ekstra" value={show(k?.ekstra)} />
                <SingleLine label="Eigenandel" value={show(k?.egenandel)} />
                <SingleLine label="Totalpris" value={total > 0 ? `${total.toFixed(0)} NOK` : ""} />
                <SingleLine label="Herav MVA 12%" value={mva > 0 ? `${mva.toFixed(2)} NOK` : ""} />
              </View>
            );
          })}

          {/* Summeringer */}
          <View style={styles.totalRow}>
            <SingleLine label="Total Sum" value={sumTotal > 0 ? `${sumTotal.toFixed(0)} NOK` : ""} />
            <SingleLine label="Total MVA 12%" value={sumMva > 0 ? `${sumMva.toFixed(2)} NOK` : ""} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
