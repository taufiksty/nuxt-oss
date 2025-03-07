import { pool } from "../../../config/db";

export default defineEventHandler(async (event) => {
  const sectorId = event.context.params?.sectorId;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT 
            ms.id_sektor, 
            ms.sektor, 
            ms.id_organisasi, 
            ms.created_at, 
            ms.updated_at, 
            ms.deleted_at, 
            ARRAY_AGG(mk.komoditas) AS komoditas 
        FROM m_sektor ms
        JOIN m_komoditas_sektor mks ON ms.id_sektor = mks.id_sektor
        JOIN m_komoditas mk ON mks.id_komoditas = mk.id_komoditas
        WHERE ms.id_sektor = $1
        GROUP BY ms.id_sektor, ms.sektor, ms.id_organisasi, ms.created_at, ms.updated_at, ms.deleted_at;`,
      [sectorId]
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
