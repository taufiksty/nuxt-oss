<script setup>
definePageMeta({
  layout: "dashboard",
});

const items = [
  [
    {
      label: "Sektor",
      click: () => {
        console.log("Sektor");
      },
    },
  ],
  [
    {
      label: "Komoditas",
      click: () => {
        console.log("Komoditas");
      },
    },
  ],
  [
    {
      label: "Jenis Produk",
      click: () => {
        console.log("Jenis Produk");
      },
    },
  ],
];
</script>

<template>
  <h1 class="font-bold text-2xl">Laporan</h1>
  <div class="mt-5">
    <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
      <UButton
        color="white"
        label="Data"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
    </UDropdown>
  </div>
</template>
