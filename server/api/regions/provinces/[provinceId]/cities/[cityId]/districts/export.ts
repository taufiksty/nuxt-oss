import { pool } from "../../../../../../../config/db";
import Papa from "papaparse";

export default defineEventHandler(async (event) => {
  const cityId = event.context.params?.cityId;
  const query = getQuery(event);
  const search = query.search ? `%${query.search}%` : "%";

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT region_id, nama FROM m_region WHERE nama ILIKE $1 AND flag_aktif = TRUE AND level = 'kecamatan' AND parent_id = $2",
      [search, cityId]
    );

    const csvData = Papa.unparse(result.rows);

    event.node.res.setHeader("Content-Type", "text/csv");
    event.node.res.setHeader(
      "Content-Disposition",
      "attachment; filename=kecamatan.csv"
    );

    return csvData;
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
