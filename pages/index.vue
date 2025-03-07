<script setup>
import { NuxtLink } from '#components';

useHead({
  title: "Nuxt OSS",
});
</script>

<template>
  <div class="main-container">
    <img src="/img/logo-oss.png" alt="logo-oss" />
    <div class="link-container">
      <NuxtLink to="/regions" class="link"
        >Kunjungi halaman wilayah untuk menemukan ID Provinsi, Kota/Kabupaten,
        Kecamatan, Kelurahan/Desa mu.</NuxtLink
      >
      <NuxtLink to="/regions/by" class="link"
        >Kunjungi halaman wilayah (berdasarkan) untuk menemukan ID wilayah usahamu.</NuxtLink
      ><//NuxtLink>
      <NuxtLink to="/dashboard" class="link">Dashboard Sektor, Komoditas, dan Produk Jenis.</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 5rem;
}

.link-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.link {
  font-size: larger;
}

.link:hover {
  color: #0070f3;
  text-decoration: underline;
}
</style>
