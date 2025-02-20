# Nuxt OSS

Nuxt OSS adalah sebuah website yang menampilkan informasi tentang wilayah di Indonesia, dari Sabang hingga Merauke. Proyek ini dibangun menggunakan Nuxt.js untuk memberikan pengalaman pengguna yang optimal.

## Teknologi yang Digunakan

- **Nuxt.js** - Framework berbasis Vue.js untuk membangun aplikasi web
- **PostgreSQL** - Database yang digunakan untuk menyimpan data wilayah
- **Docker** - Containerization untuk mempermudah deployment dan pengelolaan lingkungan

## Cara Instalasi dan Menjalankan Proyek

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan proyek di lokal:

### 1. Clone Repository
```bash
git clone https://github.com/taufiksty/nuxt-oss.git
cd nuxt-oss
```

### 2. Jalankan dengan Docker
Jika menggunakan Docker, jalankan perintah berikut:
```bash
docker compose up --build -d
```
Aplikasi akan berjalan di http://localhost:3000.


## 📜 Dokumentasi API

Dokumentasi API tersedia menggunakan Swagger. Anda dapat mengaksesnya melalui:

🔗 [Swagger Docs](http://localhost:3000/api/docs)

Pastikan server berjalan sebelum mengakses dokumentasi.

## 🤝 Kontribusi

Jika ingin berkontribusi dalam pengembangan proyek ini, silakan fork repository ini dan buat pull request dengan perubahan yang ingin ditambahkan.
