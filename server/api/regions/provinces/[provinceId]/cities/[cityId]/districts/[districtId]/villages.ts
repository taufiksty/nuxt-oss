import { pool } from "../../../../../../../../config/db";

export default defineEventHandler(async (event) => {
  const districtId = event.context.params?.districtId;
  const query = getQuery(event);
  const search = query.search ? `%${query.search}%` : "%";

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT region_id, nama FROM m_region WHERE nama ILIKE $1 AND flag_aktif = TRUE AND level = 'kelurahan' AND parent_id = $2",
      [search, districtId]
    );

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
