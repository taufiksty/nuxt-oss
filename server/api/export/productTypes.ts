import Papa from "papaparse";
import PDFDocument from "pdfkit-table";
import { PassThrough } from "stream";
import { pool } from "~/server/config/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const to = query.to || "pdf";

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT mpj.id_produk_jenis, mpj.produk_jenis, mpj.produk_jenis_baku, ARRAY_AGG(DISTINCT mk.komoditas) AS komoditas
        FROM m_produk_jenis mpj
        JOIN m_produk_jenis_komoditas mpjk ON mpjk.id_produk_jenis = mpj.id_produk_jenis
        JOIN m_komoditas mk ON mk.id_komoditas = mpjk.id_komoditas
        GROUP BY mpj.id_produk_jenis, mpj.produk_jenis, mpj.produk_jenis_baku;`
    );

    const data = result.rows;
    if (to === "csv") {
      const csvData = Papa.unparse(
        data.map(
          ({
            id_produk_jenis,
            produk_jenis,
            produk_jenis_baku,
            komoditas,
          }: any) => ({
            id_produk_jenis,
            produk_jenis,
            produk_jenis_baku,
            komoditas,
          })
        )
      );

      event.node.res.setHeader("Content-Type", "text/csv");
      event.node.res.setHeader(
        "Content-Disposition",
        `attachment; filename=product-types.csv`
      );

      return csvData;
    } else if (to === "pdf") {
      const stream = new PassThrough();
      const doc = new PDFDocument({ margin: 30, size: "A4" });

      event.node.res.setHeader("Content-Type", "application/pdf");
      event.node.res.setHeader(
        "Content-Disposition",
        `attachment; filename=product-types.pdf`
      );

      doc.pipe(stream);

      // Title
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("OSS Produk Jenis", { align: "center" });
      doc.moveDown(2);

      // Handling data kosong
      if (data.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(12)
          .text("Data tidak tersedia.", { align: "center" });
        doc.end();
        return sendStream(event, stream);
      }

      // Create Table Data
      const tableData = {
        headers: [
          { label: "ID", width: 80, align: "left", headerColor: "#eaeaea" },
          {
            label: "Produk Jenis",
            width: 150,
            align: "left",
            headerColor: "#eaeaea",
          },
          {
            label: "Produk Jenis Baku",
            width: 180,
            align: "left",
            headerColor: "#eaeaea",
          },
          {
            label: "Komoditas",
            width: 120,
            align: "left",
            headerColor: "#eaeaea",
          },
        ],
        rows: data.map((item: any) => [
          item.id_produk_jenis.toString(),
          item.produk_jenis,
          item.produk_jenis_baku,
          item.komoditas.join(", "),
        ]),
        rowsBackground: ["#f8f8f8", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        border: true,
      };

      // Render Table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
        prepareRow: () => doc.font("Helvetica").fontSize(11),
      });

      doc.end();
      return sendStream(event, stream);
    }
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  }
});
