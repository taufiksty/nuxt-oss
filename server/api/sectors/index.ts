import { pool } from "~/server/config/db";

export default defineEventHandler(async (event) => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT id_sektor, sektor FROM m_sektor");
    return {
      data: result.rows,
      message: "OK",
    };
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
