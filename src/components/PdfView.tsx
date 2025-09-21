// src/components/PdfView.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

interface KostRad {
  kvittnr?: string;
  turpris?: string | number;
  venting?: string | number;
  bom?: string | number;
  ferge?: string | number;
  ekstra?: string | number;
  egenandel?: string | number;
  loyve?: string;
  dato?: string;
  starttid?: string;
  slutttid?: string;
}

interface FormData {
  bookingnr?: string;
  rute?: string;
  kunde?: string;
  for?: string;
  ved?: string;
  fra?: string;
  til?: string;
  referanse?: string;
  merknad?: string;
}

interface Loyve {
  loyve: string;
  sjoforId: string;
  sjoforNavn: string;
}

interface VedleggItem {
  file: File;
  preview?: string;
}

interface Props {
  kostnader: KostRad[];
  formData?: FormData;
  loyver?: Loyve[];
  vedlegg?: VedleggItem[];
}

const styles = StyleSheet.create({
  page: { padding: 25, fontSize: 11, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  companyInfo: { fontSize: 10, textAlign: "right" },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
  },

  sectionCard: {
    border: "1pt solid #000",
    borderRadius: 4,
    padding: 10,
    marginBottom: 18,
    backgroundColor: "#f1f1f1",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 13,
    textDecoration: "underline",
  },

  loyveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  loyveColL: { width: "25%" },
  loyveColM: { width: "20%" },
  loyveColR: { width: "53%" },
  labelInline: { fontWeight: "bold", marginRight: 3 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  card: {
    border: "1pt solid #000",
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
    width: "48%",
    backgroundColor: "#f1f1f1",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  label: { fontWeight: "bold", fontSize: 12 },

  turHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "0.5pt solid #000",
    paddingBottom: 2,
    marginBottom: 4,
  },
  turHeaderText: { fontWeight: "bold", fontSize: 12 },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    borderTop: "1pt solid #000",
    paddingTop: 3,
  },

  sumCard: {
    border: "1pt solid #000",
    borderRadius: 4,
    padding: 12,
    marginTop: 12,
    backgroundColor: "#f1f1f1",
  },

  boldText: { fontWeight: "bold" },

  imageRow: { flexDirection: "row", justifyContent: "space-between" },
  halfImage: {
    width: "48%",
    height: 300,
    objectFit: "contain",
  },
  fullImage: {
    width: "100%",
    height: 500,
    objectFit: "contain",
    marginBottom: 10,
  },
});

const toNumber = (v: any) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return isFinite(n) ? n : 0;
};

const calcTotals = (k: KostRad) => {
  const turpris = toNumber(k.turpris);
  const venting = toNumber(k.venting);
  const ekstra = toNumber(k.ekstra);
  const bom = toNumber(k.bom);
  const ferge = toNumber(k.ferge);
  const egenandel = toNumber(k.egenandel);

  const total = turpris + venting + ekstra + bom + ferge - egenandel;
  const mva = total - total / 1.12;
  return { total, mva };
};

export default function PdfView({
  kostnader,
  formData,
  loyver = [],
  vedlegg = [],
}: Props) {
  const sums = kostnader.reduce(
    (acc, k) => {
      const { total, mva } = calcTotals(k);
      acc.total += total;
      acc.mva += mva;
      return acc;
    },
    { total: 0, mva: 0 }
  );

  const today = new Date().toLocaleDateString("nb-NO");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/bok/logo2.png" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>Voss Taxi SA</Text>
            <Text>Uttrågata 19</Text>
            <Text>5700 Voss</Text>
            <Text>Tlf: +47 56 51 13 40</Text>
            <Text>Org.nr: 999505279</Text>
          </View>
        </View>

        {/* Tittel */}
        <Text style={styles.title}>Rekning</Text>

        {/* Løyver */}
        {loyver.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Løyver</Text>
            {loyver.map((l, idx) => (
              <View key={idx} style={styles.loyveRow} wrap={false}>
                <Text style={styles.loyveColL}>
                  <Text style={styles.labelInline}>Løyve:</Text>{" "}
                  {l.loyve}
                </Text>
                <Text style={styles.loyveColM}>
                  <Text style={styles.labelInline}>ID:</Text>{" "}
                  {l.sjoforId}
                </Text>
                <Text style={styles.loyveColR}>
                  <Text style={styles.labelInline}>Sjåførnavn:</Text>{" "}
                  {l.sjoforNavn}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Turinformasjon */}
        {formData && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Turinformasjon</Text>

            {/* Rad 1 */}
            {formData.bookingnr && (
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  <Text>
                    <Text style={{ fontWeight: "bold" }}>Bookingnummer:</Text>
                    {"\u00A0\u00A0"}{formData.bookingnr}
                  </Text>
                </View>
                <View style={{ width: "48%" }} />
              </View>
            )}

            {/* Rad 2 */}
            {(formData.rute || formData.kunde) && (
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  {formData.rute && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Rutenummer:</Text>
                      {"\u00A0\u00A0"}{formData.rute}
                    </Text>
                  )}
                </View>
                <View style={{ width: "48%" }}>
                  {formData.kunde && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Kunde:</Text>
                      {"\u00A0\u00A0"}{formData.kunde}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Rad 3 */}
            {(formData.for || formData.ved) && (
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  {formData.for && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>For:</Text>
                      {"\u00A0\u00A0"}{formData.for}
                    </Text>
                  )}
                </View>
                <View style={{ width: "48%" }}>
                  {formData.ved && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Ved:</Text>
                      {"\u00A0\u00A0"}{formData.ved}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Rad 4 */}
            {(formData.fra || formData.til) && (
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  {formData.fra && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Frå:</Text>
                      {"\u00A0\u00A0"}{formData.fra}
                    </Text>
                  )}
                </View>
                <View style={{ width: "48%" }}>
                  {formData.til && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Til:</Text>
                      {"\u00A0\u00A0"}{formData.til}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Rad 5 */}
            {(formData.referanse || formData.merknad) && (
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  {formData.referanse && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Referanse:</Text>
                      {"\u00A0\u00A0"}{formData.referanse}
                    </Text>
                  )}
                </View>
                <View style={{ width: "48%" }}>
                  {formData.merknad && (
                    <Text>
                      <Text style={{ fontWeight: "bold" }}>Merknad:</Text>
                      {"\u00A0\u00A0"}{formData.merknad}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Kostnader */}
        <View style={styles.cardContainer}>
          {kostnader.map((k, idx) => {
            const { total, mva } = calcTotals(k);
            return (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.turHeader}>
                  <Text style={styles.turHeaderText}>Tur {idx + 1}</Text>
                  {k.loyve && (
                    <Text style={styles.turHeaderText}>Løyve: {k.loyve}</Text>
                  )}
                  <Text style={styles.turHeaderText}>
                    Dato: {k.dato || today}
                  </Text>
                </View>

                {(k.starttid || k.slutttid) && (
                  <View style={styles.row}>
                    {k.starttid && <Text>Starttid:{"\u00A0"}{k.starttid}</Text>}
                    {k.slutttid && <Text>Slutttid:{"\u00A0"}{k.slutttid}</Text>}
                  </View>
                )}
                {k.kvittnr && (
                  <View style={styles.row}>
                    <Text>Kvitteringsnummer:{"\u00A0"}{k.kvittnr}</Text>
                  </View>
                )}
                {k.turpris && (
                  <View style={styles.row}>
                    <Text style={styles.boldText}>Turpris:{"\u00A0"}</Text>
                    <Text style={styles.boldText}>{k.turpris} NOK</Text>
                  </View>
                )}
                {k.venting && (
                  <View style={styles.row}>
                    <Text>+Venting:{"\u00A0"}{k.venting} NOK</Text>
                  </View>
                )}
                {k.bom && (
                  <View style={styles.row}>
                    <Text>+Bompeng:{"\u00A0"}{k.bom} NOK</Text>
                  </View>
                )}
                {k.ferge && (
                  <View style={styles.row}>
                    <Text>+Fergepeng:{"\u00A0"}{k.ferge} NOK</Text>
                  </View>
                )}
                {k.ekstra && (
                  <View style={styles.row}>
                    <Text>+Ekstra:{"\u00A0"}{k.ekstra} NOK</Text>
                  </View>
                )}
                {k.egenandel && (
                  <View style={styles.row}>
                    <Text>-Eigeandel:{"\u00A0"}{k.egenandel} NOK</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.boldText}>Totalpris:{"\u00A0"}</Text>
                  <Text style={styles.boldText}>{total.toFixed(2)} NOK</Text>
                </View>
                <View style={styles.row}>
                  <Text>Herav MVA 12%:{"\u00A0"}{mva.toFixed(2)} NOK</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summering */}
        {kostnader.length > 0 && (
          <View style={styles.sumCard} wrap={false}>
            <View style={styles.row}>
              <Text style={styles.boldText}>Sum totalpriser:{"\u00A0"}</Text>
              <Text style={styles.boldText}>{sums.total.toFixed(2)} NOK</Text>
            </View>
            <View style={styles.row}>
              <Text>Herav MVA 12%:{"\u00A0"}{sums.mva.toFixed(2)} NOK</Text>
            </View>
          </View>
        )}
      </Page>

      {/* Vedlegg */}
      {vedlegg.length > 0 && (
        <>
          {vedlegg
            .filter((v) => v.preview && v.file.type.startsWith("image/"))
            .reduce((rows: any[], v) => {
              if (!v.preview) return rows;
              const isLandscape = (v.file as any).width > (v.file as any).height;
              if (isLandscape) {
                rows.push([v]);
              } else {
                const lastRow = rows[rows.length - 1];
                if (
                  lastRow &&
                  lastRow.length === 1 &&
                  !((lastRow[0].file as any).width > (lastRow[0].file as any).height)
                ) {
                  lastRow.push(v);
                } else {
                  rows.push([v]);
                }
              }
              return rows;
            }, [])
            .map((row, idx) => (
              <Page key={`vedlegg-${idx}`} size="A4" style={styles.page}>
                <View style={styles.imageRow}>
                  {row.map((v, i) =>
                    v.preview ? (
                      <Image
                        key={i}
                        src={v.preview}
                        style={row.length === 2 ? styles.halfImage : styles.fullImage}
                      />
                    ) : null
                  )}
                </View>
              </Page>
            ))}

          {vedlegg
            .filter((v) => v.preview && !v.file.type.startsWith("image/"))
            .map((v, idx) =>
              v.preview ? (
                <Page key={`doc-${idx}`} size="A4" style={styles.page}>
                  <Image src={v.preview} style={styles.fullImage} />
                </Page>
              ) : null
            )}
        </>
      )}
    </Document>
  );
}
