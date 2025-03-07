import { pool } from "~/server/config/db";

export default defineEventHandler(async (event) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT COUNT(id_produk_jenis) AS produk_jenis_count FROM m_produk_jenis"
    );
    return {
      data: result.rows[0],
      message: "OK",
    };
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
