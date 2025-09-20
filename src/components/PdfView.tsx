// src/components/PdfView.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { KostItem } from "./PdfViewTypes";

// Standard font
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica.ttf" }, // fallback
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 20,
  },
  section: {
    marginBottom: 10,
    padding: 8,
    border: "1pt solid #000",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    flex: 1,
    marginLeft: 4,
  },
});

type PdfViewProps = {
  formData: any;
  kostnader: KostItem[];
};

export default function PdfView({ formData, kostnader }: PdfViewProps) {
  const turer = Array.isArray(formData.turer) ? formData.turer : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Løyve-seksjon pr tur */}
        {turer.length > 0 && (
          <View style={styles.section}>
            {turer.map((tur: any, idx: number) =>
              Array.isArray(tur.loyver) && tur.loyver.length > 0 ? (
                tur.loyver.map((l: any, j: number) => (
                  <View key={`${idx}-${j}`} style={styles.row}>
                    <Text style={styles.label}>Tur {idx + 1}</Text>
                    <Text style={styles.label}>Løyve:</Text>
                    <Text style={styles.value}>{l.loyve}</Text>
                    <Text style={styles.label}>ID:</Text>
                    <Text style={styles.value}>{l.sjoforId}</Text>
                    <Text style={styles.label}>Sjåfør:</Text>
                    <Text style={styles.value}>{l.sjoforNavn}</Text>
                  </View>
                ))
              ) : null
            )}
          </View>
        )}

        {/* Dato + Tid */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Dato:</Text>
            <Text style={styles.value}>{formData.dato || ""}</Text>
            <Text style={styles.label}>Tid:</Text>
            <Text style={styles.value}>{formData.tid || ""}</Text>
          </View>
        </View>

        {/* Turinfo */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Bookingnummer:</Text>
            <Text style={styles.value}>{formData.bookingnr || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rutenummer:</Text>
            <Text style={styles.value}>
              {formData.rute || formData.rutenr || ""}
            </Text>
            <Text style={styles.label}>Kunde:</Text>
            <Text style={styles.value}>{formData.kunde || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>For:</Text>
            <Text style={styles.value}>{formData.for || ""}</Text>
            <Text style={styles.label}>Ved:</Text>
            <Text style={styles.value}>{formData.ved || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Frå:</Text>
            <Text style={styles.value}>{formData.fra || ""}</Text>
            <Text style={styles.label}>Til:</Text>
            <Text style={styles.value}>{formData.til || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Referanse:</Text>
            <Text style={styles.value}>{formData.referanse || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Merknad:</Text>
            <Text style={styles.value}>{formData.merknad || ""}</Text>
          </View>
        </View>

        {/* Kostnader */}
        <View style={styles.section}>
          {kostnader.map((k, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
                Tur {i + 1}
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Turpris:</Text>
                <Text style={styles.value}>{k.turpris}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Venting:</Text>
                <Text style={styles.value}>{k.venting}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Bompenger:</Text>
                <Text style={styles.value}>{k.bom}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Ferge:</Text>
                <Text style={styles.value}>{k.ferge}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Ekstra:</Text>
                <Text style={styles.value}>{k.ekstra}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Egenandel:</Text>
                <Text style={styles.value}>{k.egenandel}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
