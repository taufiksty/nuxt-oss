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
      `SELECT 
              ms.id_sektor, 
              ms.sektor,  
              ARRAY_AGG(mk.komoditas) AS komoditas 
          FROM m_sektor ms
          JOIN m_komoditas_sektor mks ON ms.id_sektor = mks.id_sektor
          JOIN m_komoditas mk ON mks.id_komoditas = mk.id_komoditas
          GROUP BY ms.id_sektor, ms.sektor;`
    );
    const data = result.rows;
    if (to === "csv") {
      const csvData = Papa.unparse(
        data.map(({ id_sektor, sektor, komoditas }: any) => ({
          id_sektor,
          sektor,
          komoditas,
        }))
      );

      event.node.res.setHeader("Content-Type", "text/csv");
      event.node.res.setHeader(
        "Content-Disposition",
        `attachment; filename=sectors.csv`
      );

      return csvData;
    } else if (to === "pdf") {
      const stream = new PassThrough();
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      event.node.res.setHeader("Content-Type", "application/pdf");
      event.node.res.setHeader(
        "Content-Disposition",
        `attachment; filename=sectors.pdf`
      );

      doc.pipe(stream);

      // Title
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("OSS Sektor", { align: "center" });
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
          { label: "ID", width: 120, align: "center", headerColor: "#eaeaea" },
          {
            label: "Sektor",
            width: 150,
            align: "left",
            headerColor: "#eaeaea",
          },
          {
            label: "Komoditas",
            width: 230,
            align: "left",
            headerColor: "#eaeaea",
          },
        ],
        rows: data.map((item: any) => [
          item.id_sektor.toString(),
          item.sektor,
          item.komoditas.join(", "),
        ]),
        rowsBackground: ["#f8f8f8", "#ffffff", "#ffffff"],
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
  }
});
