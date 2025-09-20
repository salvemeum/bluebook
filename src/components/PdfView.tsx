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
  preview?: string; // base64 bilde for doc/xls/pdf
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
  logo: { width: 90, height: 45 },
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
    backgroundColor: "#f9f9f9",
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

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  infoCol: { width: "48%" },
  infoItem: { marginBottom: 8 },
  infoLabel: { fontWeight: "bold", marginBottom: 2 },
  infoValue: {},

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
    backgroundColor: "#f9f9f9",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  label: { fontWeight: "bold", fontSize: 12 },
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

  imageRow: { flexDirection: "row", marginBottom: 10 },
  halfImage: {
    width: "50%",
    height: 300,
    objectFit: "contain",
  },
  fullImage: {
    width: "100%",
    objectFit: "contain",
    marginBottom: 10,
  },
});

// Hjelper: splitter et stort base64-bilde i flere sider (A4 høyde ~1123 px for bredde 794)
const splitImage = async (base64: string): Promise<string[]> => {
  const img = new Image();
  img.src = base64;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const pageHeightPx = 1123; // tilsvarer ca A4 høyde
  const pages: string[] = [];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.width;

  for (let y = 0; y < img.height; y += pageHeightPx) {
    const sliceHeight = Math.min(pageHeightPx, img.height - y);
    canvas.height = sliceHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, y, img.width, sliceHeight, 0, 0, img.width, sliceHeight);
    pages.push(canvas.toDataURL("image/png"));
  }

  return pages;
};

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
          <Image src="/logo.png" style={styles.logo} />
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
                  <Text style={styles.labelInline}>Løyve:</Text> {l.loyve}
                </Text>
                <Text style={styles.loyveColM}>
                  <Text style={styles.labelInline}>ID:</Text> {l.sjoforId}
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
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                {formData.bookingnr && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Bookingnummer</Text>
                    <Text style={styles.infoValue}>{formData.bookingnr}</Text>
                  </View>
                )}
                {formData.rute && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Rutenummer</Text>
                    <Text style={styles.infoValue}>{formData.rute}</Text>
                  </View>
                )}
                {formData.for && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>For</Text>
                    <Text style={styles.infoValue}>{formData.for}</Text>
                  </View>
                )}
                {formData.fra && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Frå</Text>
                    <Text style={styles.infoValue}>{formData.fra}</Text>
                  </View>
                )}
                {formData.referanse && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Referanse</Text>
                    <Text style={styles.infoValue}>{formData.referanse}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoCol}>
                {formData.kunde && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Kunde</Text>
                    <Text style={styles.infoValue}>{formData.kunde}</Text>
                  </View>
                )}
                {formData.ved && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ved</Text>
                    <Text style={styles.infoValue}>{formData.ved}</Text>
                  </View>
                )}
                {formData.til && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Til</Text>
                    <Text style={styles.infoValue}>{formData.til}</Text>
                  </View>
                )}
                {formData.merknad && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Merknad</Text>
                    <Text style={styles.infoValue}>{formData.merknad}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Kostnader per tur */}
        <View style={styles.cardContainer}>
          {kostnader.map((k, idx) => {
            const { total, mva } = calcTotals(k);
            return (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.row}>
                  <Text style={styles.label}>Tur {idx + 1}</Text>
                </View>
                {k.loyve && (
                  <View style={styles.row}>
                    <Text>Løyve:</Text>
                    <Text>{k.loyve}</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text>Dato:</Text>
                  <Text>{k.dato || today}</Text>
                </View>
                {(k.starttid || k.slutttid) && (
                  <View style={styles.row}>
                    {k.starttid && <Text>Starttid: {k.starttid}</Text>}
                    {k.slutttid && <Text>Slutttid: {k.slutttid}</Text>}
                  </View>
                )}
                {k.kvittnr && (
                  <View style={styles.row}>
                    <Text>Kvitteringsnummer:</Text>
                    <Text>{k.kvittnr}</Text>
                  </View>
                )}
                {k.turpris && (
                  <View style={styles.row}>
                    <Text>Turpris:</Text>
                    <Text>{k.turpris} NOK</Text>
                  </View>
                )}
                {k.venting && (
                  <View style={styles.row}>
                    <Text>+Venting:</Text>
                    <Text>{k.venting} NOK</Text>
                  </View>
                )}
                {k.bom && (
                  <View style={styles.row}>
                    <Text>+Bompeng:</Text>
                    <Text>{k.bom} NOK</Text>
                  </View>
                )}
                {k.ferge && (
                  <View style={styles.row}>
                    <Text>+Fergepeng:</Text>
                    <Text>{k.ferge} NOK</Text>
                  </View>
                )}
                {k.ekstra && (
                  <View style={styles.row}>
                    <Text>+Ekstra:</Text>
                    <Text>{k.ekstra} NOK</Text>
                  </View>
                )}
                {k.egenandel && (
                  <View style={styles.row}>
                    <Text>-Eigeandel:</Text>
                    <Text>{k.egenandel} NOK</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text>Totalpris:</Text>
                  <Text>{total.toFixed(2)} NOK</Text>
                </View>
                <View style={styles.row}>
                  <Text>Herav MVA 12%:</Text>
                  <Text>{mva.toFixed(2)} NOK</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summering */}
        {kostnader.length > 0 && (
          <View style={styles.sumCard} wrap={false}>
            <View style={styles.row}>
              <Text style={styles.label}>Sum totalpriser:</Text>
              <Text>{sums.total.toFixed(2)} NOK</Text>
            </View>
            <View style={styles.row}>
              <Text>Herav MVA 12%:</Text>
              <Text>{sums.mva.toFixed(2)} NOK</Text>
            </View>
          </View>
        )}
      </Page>

      {/* Vedlegg-sider */}
      {vedlegg.length > 0 && (
        <>
          {/* Første vedlegg-side med bilder */}
          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Vedlegg</Text>

            {/* Bilder to og to */}
            {vedlegg
              .filter((v) => v.file.type.startsWith("image/") && v.preview)
              .reduce((rows: any[], file, idx, arr) => {
                if (idx % 2 === 0) rows.push(arr.slice(idx, idx + 2));
                return rows;
              }, [])
              .map((row, idx) => (
                <View key={idx} style={styles.imageRow}>
                  {row.map((v, i) => (
                    <Image
                      key={i}
                      src={v.preview!}
                      style={
                        row.length === 2 ? styles.halfImage : styles.fullImage
                      }
                    />
                  ))}
                </View>
              ))}
          </Page>

          {/* Dokumenter (preview) splittet på flere sider om nødvendig */}
          {vedlegg
            .filter((v) => v.preview && !v.file.type.startsWith("image/"))
            .map((v, idx) => (
              <React.Fragment key={`doc-${idx}`}>
                {/*
                  For doc/xls/pdf previews, splitt base64-bildet til A4-sider
                */}
                {/*
                  NB: Må bruke promise → splitImage, men @react-pdf kan ikke await inne i JSX.
                  For enkelthet: vi rendrer hele preview som én side,
                  men her har vi lagt grunnlag for splitting.
                */}
                <Page size="A4" style={styles.page}>
                  <Image src={v.preview!} style={styles.fullImage} />
                </Page>
              </React.Fragment>
            ))}
        </>
      )}
    </Document>
  );
}
