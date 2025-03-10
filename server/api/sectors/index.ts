import { pool } from "~/server/config/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const getAll = query.all == "true";

  const client = await pool.connect();

  try {
    let result;
    if (getAll) {
      result = await client.query(
        `SELECT 
              ms.id_sektor, 
              ms.sektor,  
              ARRAY_AGG(mk.komoditas) AS komoditas 
          FROM m_sektor ms
          JOIN m_komoditas_sektor mks ON ms.id_sektor = mks.id_sektor
          JOIN m_komoditas mk ON mks.id_komoditas = mk.id_komoditas
          GROUP BY ms.id_sektor, ms.sektor;`
      );
      return {
        data: result.rows,
        message: "OK",
      };
    } else {
      result = await client.query("SELECT id_sektor, sektor FROM m_sektor");
      return {
        data: result.rows,
        message: "OK",
      };
    }
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
