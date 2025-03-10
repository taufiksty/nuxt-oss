import { pool } from "../../../config/db";

export default defineEventHandler(async (event) => {
  const commodityId = event.context.params?.commodityId;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT 
            mk.id_komoditas, 
            mk.komoditas, 
            mk.kategori, 
            mk.created_at, 
            mk.updated_at, 
            mk.deleted_at,
            ARRAY_AGG(DISTINCT ms.sektor) AS sektor,
            ARRAY_AGG(DISTINCT mpj.produk_jenis_idn) AS produk_jenis, 
            ARRAY_AGG(DISTINCT mkk.kbli) AS kbli 
        FROM m_komoditas mk
        JOIN m_kbli_komoditas mkk ON mk.id_komoditas = mkk.id_komoditas
        JOIN m_komoditas_sektor mks ON mk.id_komoditas = mks.id_komoditas
        JOIN m_sektor ms ON mks.id_sektor = ms.id_sektor
        JOIN m_produk_jenis_komoditas mpjk ON mk.id_komoditas = mpjk.id_komoditas
        JOIN m_produk_jenis mpj ON mpjk.id_produk_jenis = mpj.id_produk_jenis 
        WHERE mk.id_komoditas = $1
        GROUP BY mk.id_komoditas, mk.komoditas, mk.kategori, mk.created_at, mk.updated_at, mk.deleted_at;`,
      [commodityId]
    );

    // result.rows[0].kbli = await Promise.all(
    //   result.rows[0].kbli.map(async (kbli: string) => {
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
      data: result.rows[0],
      message: "OK",
    };
  } catch (error: any) {
    return { error: "Failed to fetch data", details: error.message };
  } finally {
    client.release();
  }
});
