import { pool } from "../../config/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;
  const search = query.search ? `%${query.search}%` : "%";
  const offset = (page - 1) * limit;

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT region_id, nama, level FROM m_region WHERE nama ILIKE $1 AND flag_aktif = TRUE LIMIT $2 OFFSET $3",
      [search, limit, offset]
    );

    const countResult = await client.query(
      "SELECT COUNT(region_id) FROM m_region WHERE nama ILIKE $1 AND flag_aktif = TRUE",
      [search]
    );

    const totalRows = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRows / limit);

    return {
      data: result.rows,
      pagination: { totalRows, totalPages, currentPage: page, perPage: limit },
      message: "OK",
    };
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
