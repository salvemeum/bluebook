import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type Trip = { kunde: string; fra: string; til: string; pris: number };
export type PDFData = {
  dato: string;
  mottakerEpost: string;
  referanse?: string | null;
  turer: Trip[];
  vedlegg?: { name: string; size: number }[];
};

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11 },
  header: { marginBottom: 12, borderBottomWidth: 1, paddingBottom: 6 },
  labelRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  section: { marginTop: 10 },
  tur: { borderWidth: 1, borderRadius: 4, padding: 8, marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  small: { fontSize: 10, color: "#555" },
  bold: { fontSize: 12, fontWeight: 700 },
  total: { marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
});

export default function Dokument({ data }: { data: PDFData }) {
  const sum = data.turer.reduce((acc, t) => acc + (Number(t.pris) || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.bold}>Rekning</Text>
          <View style={styles.labelRow}>
            <Text>Dato: {data.dato}</Text>
            <Text>Mottaker: {data.mottakerEpost}</Text>
          </View>
          {data.referanse ? <Text>Referanse: {data.referanse}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Turer</Text>
          {data.turer.map((tur, i) => (
            <View key={i} style={styles.tur} wrap={false}>
              <View style={styles.row}>
                <Text style={styles.bold}>Tur {i + 1}</Text>
                <Text style={styles.small}>Pris: {Number(tur.pris).toFixed(0)} NOK</Text>
              </View>
              <Text>Kunde: {tur.kunde}</Text>
              <View style={styles.row}>
                <Text>Fra: {tur.fra}</Text>
                <Text>Til: {tur.til}</Text>
              </View>
            </View>
          ))}

          <View style={styles.total}>
            <View style={styles.row}>
              <Text style={styles.bold}>Sum</Text>
              <Text style={styles.bold}>{sum.toFixed(0)} NOK</Text>
            </View>
          </View>
        </View>

        {data.vedlegg && data.vedlegg.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.bold}>Vedlegg</Text>
            {data.vedlegg.map((v, idx) => (
              <Text key={idx} style={styles.small}>
                • {v.name} ({Math.round(v.size / 1024)} kB)
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
