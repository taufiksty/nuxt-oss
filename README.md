# Nuxt OSS

Nuxt OSS adalah sebuah website yang menampilkan informasi tentang wilayah di Indonesia, dari Sabang hingga Merauke. Proyek ini dibangun menggunakan Nuxt.js untuk memberikan pengalaman pengguna yang optimal.

## Teknologi yang Digunakan

- **Nuxt.js** - Framework berbasis Vue.js untuk membangun aplikasi web
- **NuxtUI** - Library UI untuk yang di desain untuk Nuxt.js
- **PostgreSQL** - Database yang digunakan untuk menyimpan data wilayah
- **Docker** - Containerization untuk mempermudah deployment dan pengelolaan lingkungan
- **Playwright** - End-to-end test menggunakan Playwright

## Cara Instalasi dan Menjalankan Proyek

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan proyek di lokal:

### 1. Clone Repository

```bash
git clone https://github.com/taufiksty/nuxt-oss.git
cd nuxt-oss
```

### 2. Set Environment

Copy file `.env.example` dan rename file hasil copy menjadi `.env`

```bash
# This is example, edit on your needs
POSTGRES_DB=db_name
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=postgres_oss # or your_container_postgres_name if you named it differ 
POSTGRES_PORT=5432
```

### 3. Jalankan dengan Docker

Jika menggunakan Docker, jalankan perintah berikut:

```bash
docker compose up --build -d
```

### 4. Jika data belum muncul, lakukan import data di PostgreSQL Docker  

Masuk docker PostgreSQL, ganti `<postgres_container_name>` dengan nama container PostgreSQL Anda, `example: postgres_oss` jika mengikuti environment sebelumnya.

```bash
docker exec -it <postgres_container_name> bash
```
##### a. Masuk ke PostgreSQL:
```bash
psql -U postgres -d oss_rba_master
```
Setelah itu masukkan password yang sesuai dengan `.env` sebelumnya.
##### b. Buat tabel m_region_temp:
Tabel ini akan digunakan sebagai tempat sementara untuk mengimpor data CSV sebelum dipindahkan ke `m_region`.
```bash
CREATE TABLE IF NOT EXISTS m_region_temp (
    region_id TEXT,
    propinsi TEXT,
    kab_kota TEXT,
    kecamatan TEXT,
    kelurahan TEXT,
    flag_ibukota TEXT,
    keterangan TEXT,
    parent_id TEXT,
    nama TEXT,
    level TEXT,
    updated TEXT,
    created TEXT,
    flag_aktif TEXT,
    region_id_lama TEXT
);
```
##### c. Buat tabel m_region:
Setelah data dimasukkan ke `m_region_temp`, kita pindahkan ke tabel utama `m_region` dengan tipe data yang sesuai.
```bash
CREATE TABLE IF NOT EXISTS m_region (
    region_id BIGINT PRIMARY KEY,
    propinsi VARCHAR(255),
    kab_kota VARCHAR(255),
    kecamatan VARCHAR(255),
    kelurahan VARCHAR(255),
    flag_ibukota BOOLEAN,
    keterangan TEXT,
    parent_id BIGINT,
    nama VARCHAR(255),
    level VARCHAR(50),
    updated TIMESTAMP,
    created TIMESTAMP,
    flag_aktif BOOLEAN,
    region_id_lama BIGINT
);
```
##### d. Upload File CSV ke Container
Keluarlah dari PostgreSQL dengan perintah \q, lalu unggah file CSV ke dalam container:
```bash
docker cp m_region.csv <postgres_container_name>:/tmp/m_region.csv
```
##### e. Import Data ke `m_region_temp`
Kembali ke dalam PostgreSQL (seperti langkah awal) dan jalankan perintah berikut untuk mengimpor data dari CSV:
```bash
COPY m_region_temp FROM '/tmp/m_region.csv' DELIMITER ',' CSV HEADER;
```
##### f. Pindahkan Data ke `m_region`
Setelah data masuk ke `m_region_temp`, lakukan transformasi data ke dalam `m_region`:
```bash
INSERT INTO m_region (
    region_id, propinsi, kab_kota, kecamatan, kelurahan, flag_ibukota,
    keterangan, parent_id, nama, level, updated, created, flag_aktif, region_id_lama
)
SELECT
    region_id::BIGINT, 
    propinsi, 
    NULLIF(TRIM(kab_kota), ''), 
    NULLIF(TRIM(kecamatan), ''), 
    NULLIF(TRIM(kelurahan), ''), 
    NULLIF(TRIM(flag_ibukota), '')::BOOLEAN, 
    NULLIF(TRIM(keterangan), ''), 
    NULLIF(TRIM(parent_id), '')::BIGINT, 
    nama, 
    level, 
    updated::TIMESTAMP, 
    created::TIMESTAMP, 
    NULLIF(TRIM(flag_aktif), '')::BOOLEAN, 
    NULLIF(TRIM(region_id_lama), '')::BIGINT
FROM m_region_temp;
```
Sekarang, refresh kembali halaman Anda.

## 📜 Dokumentasi API

Dokumentasi API tersedia menggunakan Swagger. Anda dapat mengaksesnya melalui:

🔗 [Swagger Docs](http://localhost:3000/docs)

Pastikan server berjalan sebelum mengakses dokumentasi.

## 🤝 Kontribusi

Jika ingin berkontribusi dalam pengembangan proyek ini, silakan fork repository ini dan buat pull request dengan perubahan yang ingin ditambahkan.
