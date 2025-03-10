import { pool } from "../../config/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const search = query.search ? `%${query.search}%` : "%";
  const offset = (page - 1) * limit;
  const getAll = query.all == "true";

  const client = await pool.connect();

  try {
    let result;
    let totalRows;
    let totalPages;

    if (getAll) {
      result = await client.query(
        `SELECT 
              mk.id_komoditas, 
              mk.komoditas, 
              ARRAY_AGG(DISTINCT ms.sektor) AS sektor 
          FROM m_komoditas mk
          JOIN m_komoditas_sektor mks ON mks.id_komoditas = mk.id_komoditas
          JOIN m_sektor ms ON ms.id_sektor = mks.id_sektor
          GROUP BY mk.id_komoditas, mk.komoditas;
          `
      );
      totalRows = result.rowCount;
      totalPages = 1;
      return {
        data: result.rows,
        pagination: {
          totalRows,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
        message: "OK",
      };
    } else {
      result = await client.query(
        `SELECT id_komoditas, komoditas FROM m_komoditas WHERE komoditas ILIKE $1 LIMIT $2 OFFSET $3`,
        [search, limit, offset]
      );

      const countResult = await client.query(
        "SELECT COUNT(id_komoditas) FROM m_komoditas WHERE komoditas ILIKE $1",
        [search]
      );

      totalRows = parseInt(countResult.rows[0].count);
      totalPages = Math.ceil(totalRows / limit);

      return {
        data: result.rows,
        pagination: {
          totalRows,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
        message: "OK",
      };
    }
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
