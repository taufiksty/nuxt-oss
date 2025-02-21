import { pool } from "../../config/db";
import Papa from "papaparse";
import PDFDocument from "pdfkit-table";
import { PassThrough } from "stream";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = query.search ? `%${query.search}%` : "%";
  const to = query.to || "pdf";
  const level = query.level || "provinsi";
  const parentId = query.parentId;

  if (!parentId && level !== "provinsi") {
    throw createError({
      statusCode: 400,
      statusMessage: "You must include parentId",
    });
  }

  const client = await pool.connect();

  try {
    const query = `
        SELECT region_id, nama, propinsi, kab_kota, kecamatan, kelurahan 
        FROM m_region 
        WHERE nama ILIKE $1 
            AND flag_aktif = TRUE 
            AND level = $2
            ${level !== "provinsi" ? "AND parent_id = $3" : ""}
    `;

    const params =
      level !== "provinsi" ? [search, level, parentId] : [search, level];

    const result = await client.query(query, params);

    if (to === "csv") {
      const csvData = Papa.unparse(
        result.rows.map(({ region_id, nama }) => ({ region_id, nama }))
      );

      event.node.res.setHeader("Content-Type", "text/csv");
      event.node.res.setHeader(
        "Content-Disposition",
        `attachment; filename=${level}.csv`
      );

      return csvData;
    } else if (to === "pdf") {
      const stream = new PassThrough();
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      event.node.res.setHeader("Content-Type", "application/pdf");
      event.node.res.setHeader(
        "Content-Disposition",
        `attachment; filename=${level}.pdf`
      );

      doc.pipe(stream);

      // Title
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(
          `Daftar ${
            level?.toString().charAt(0).toUpperCase() +
            level?.toString().slice(1)
          }`,
          { align: "center" }
        );
      doc.moveDown(2);

      // Descriptions
      if (level === "kota") {
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`Provinsi : ${result.rows[0].propinsi}`);
        doc.moveDown(2);
      }
      if (level === "kecamatan") {
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`Provinsi : ${result.rows[0].propinsi}`);
        doc.text(`Kota / Kabupaten : ${result.rows[0].kab_kota}`);
        doc.moveDown(2);
      }
      if (level === "kelurahan") {
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`Provinsi : ${result.rows[0].propinsi}`);
        doc.text(`Kota / Kabupaten : ${result.rows[0].kab_kota}`);
        doc.text(`Kecamatan : ${result.rows[0].kecamatan}`);
        doc.moveDown(2);
      }

      // Handling data kosong
      if (result.rows.length === 0) {
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
          { label: "ID", width: 150, align: "center", headerColor: "#eaeaea" },
          {
            label: `Nama ${
              level?.toString().charAt(0).toUpperCase() +
              level?.toString().slice(1)
            }`,
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
