import { pool } from "~/server/config/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const by = query.by || "productType";

  const client = await pool.connect();

  try {
    if (by == "productType") {
      const result = await client.query(
        `SELECT
            mk.komoditas, 
            COUNT(mpjk.id_komoditas) AS total 
        FROM m_komoditas mk
        JOIN m_produk_jenis_komoditas mpjk ON mk.id_komoditas = mpjk.id_komoditas
        GROUP BY mk.komoditas
        ORDER BY total DESC;`
      );
      return {
        data: result.rows[0],
        message: "OK",
      };
    }
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
