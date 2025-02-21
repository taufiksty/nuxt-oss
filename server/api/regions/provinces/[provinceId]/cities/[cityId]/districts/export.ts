import { pool } from "../../../../../../../config/db";
import Papa from "papaparse";
import PDFDocument from "pdfkit-table";
import { PassThrough } from "stream";

export default defineEventHandler(async (event) => {
  const cityId = event.context.params?.cityId;
  const query = getQuery(event);
  const search = query.search ? `%${query.search}%` : "%";
  const to = query.to;

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT region_id, nama, propinsi, kab_kota FROM m_region WHERE nama ILIKE $1 AND flag_aktif = TRUE AND level = 'kecamatan' AND parent_id = $2",
      [search, cityId]
    );

    if (to === "csv") {
      const csvData = Papa.unparse(result.rows);

      event.node.res.setHeader("Content-Type", "text/csv");
      event.node.res.setHeader(
        "Content-Disposition",
        "attachment; filename=kecamatan.csv"
      );

      return csvData;
    } else if (to === "pdf") {
      const stream = new PassThrough();
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      event.node.res.setHeader("Content-Type", "application/pdf");
      event.node.res.setHeader(
        "Content-Disposition",
        "attachment; filename=kecamatan.pdf"
      );

      doc.pipe(stream);

      // Title
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("Daftar Kecamatan", { align: "center" });
      doc.moveDown(2);

      // Descriptions
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Provinsi : ${result.rows[0].propinsi}`);
      doc.text(`Kota/Kabupaten : ${result.rows[0].kab_kota}`);
      doc.moveDown(2);

      // Create Table Data
      const tableData = {
        headers: [
          { label: "ID", width: 150, align: "center", headerColor: "#eaeaea" },
          {
            label: "Nama Kecamatan",
            width: 350,
            align: "left",
            headerColor: "#eaeaea",
          },
        ],
        rows: result.rows.map((item) => [item.region_id.toString(), item.nama]),
        rowsBackground: ["#f8f8f8", "#ffffff"],
        border: true,
      };

      // Render Table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
        prepareRow: () => doc.font("Helvetica").fontSize(12),
      });

      doc.end();
      return sendStream(event, stream);
    }
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
