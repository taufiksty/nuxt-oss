import { pool } from "../../config/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const search = query.search ? `%${query.search}%` : "%";
  const offset = (page - 1) * limit;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id_produk_jenis, produk_jenis, produk_jenis_baku FROM m_produk_jenis WHERE produk_jenis_baku ILIKE $1 LIMIT $2 OFFSET $3`,
      [search, limit, offset]
    );

    const countResult = await client.query(
      "SELECT COUNT(id_produk_jenis) FROM m_produk_jenis"
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
