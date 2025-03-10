import { pool } from "../../../config/db";

export default defineEventHandler(async (event) => {
  const productTypeId = event.context.params?.productTypeId;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT 
            mpj.id_produk_jenis, 
            mpj.produk_jenis, 
            mpj.produk_jenis_baku, 
            mpj.created_at, 
            mpj.updated_at, 
            mpj.deleted_at,
            ARRAY_AGG(DISTINCT mk.komoditas) AS komoditas,
            COALESCE(ARRAY_AGG(DISTINCT mpjkbli.kbli) FILTER (WHERE mpjkbli.kbli IS NOT NULL), '{}') AS kbli
            FROM m_produk_jenis mpj
            LEFT JOIN m_produk_jenis_komoditas mpjk ON mpj.id_produk_jenis = mpjk.id_produk_jenis
            LEFT JOIN m_komoditas mk ON mpjk.id_komoditas = mk.id_komoditas
            LEFT JOIN m_produk_jenis_kbli mpjkbli ON mpj.id_produk_jenis = mpjkbli.id_produk_jenis
            WHERE mpj.id_produk_jenis = $1
            GROUP BY mpj.id_produk_jenis, mpj.produk_jenis, mpj.produk_jenis_baku, mpj.created_at, mpj.updated_at, mpj.deleted_at;`,
      [productTypeId]
    );

    const row = result.rows[0];
    row.kbli = row.kbli ?? [];

    // row.kbli = await Promise.all(
    //   row.kbli.map(async (kbli: string) => {
    //     const response: any = await $fetch(
    //       "https://api-stg.oss.go.id/stg/v1/izin/main/getBidangUsaha",
    //       {
    //         method: "POST",
    //         headers: {
    //           Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkX3Byb2ZpbGUiOjEyMTkzMDQ5OTUsInVzZXJuYW1lIjoidW5pY2hlbWNhbmRpNTQyNSIsImplbmlzX3BlbGFrdV91c2FoYSI6IlVtQUNQQT09IiwiZmxhZ191bWsiOiJVaDQ9Iiwicm9sZV91c2VyIjpbIlZXWUdPQT09Il0sImlkX29yZ2FuaXNhc2kiOm51bGx9LCJpYXQiOjE3NDEyMjc0OTAsImV4cCI6MTc0MTMxMzg5MCwiaXNzIjoib3NzX3JiYSJ9.ixoMVFE9Sr25iEt1SkYj_lXq6ScgrcEjJHtMrYz7t3k`,
    //           user_key: "f9c53f291ab3b47251ef5b001b4f6dcc",
    //         },
    //         body: { main: { jenis_nib: "02", kbli } },
    //       }
    //     );
    //     return `${kbli}${
    //       response.data.map((bu: any) => bu.bidang_usaha) ==
    //       "Bidang Usaha tidak termasuk bidang usaha yang diatur berdasarkan ketentuan Bidang Usaha Penanaman Modal (BUPM) sesuai dengan Peraturan Presiden Nomor 10 Tahun 2021 yang telah diubah dengan Peraturan Presiden Nomor 49 Tahun 2021"
    //         ? ""
    //         : " - " + response.data.map((bu: any) => bu.bidang_usaha).join("; ")
    //     }`;
    //   })
    // );

    return {
      data: row,
      message: "OK",
    };
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
