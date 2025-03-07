<script setup>
definePageMeta({
  layout: "dashboard",
});

const totals = ref([
  { label: "Sektor", count: 0 },
  { label: "Komoditas", count: 0 },
  {
    label: "Jenis Produk",
    count: 0,
  },
]);

const fetchTotal = async () => {
  try {
    const responseSectors = await $fetch("/api/sectors/count");
    const responseCommodities = await $fetch("/api/commodities/count");
    const responseProductTypes = await $fetch("/api/productTypes/count");
    totals.value[0].count = responseSectors.data.sektor_count || 0;
    totals.value[1].count = responseCommodities.data.komoditas_count || 0;
    totals.value[2].count = responseProductTypes.data.produk_jenis_count || 0;
    console.log(totals);
  } catch (error) {
    console.error("Failed to fetch totals:", error.details);
  }
};

fetchTotal();
</script>

<template>
  <h1 class="font-bold text-2xl">Dashboard</h1>
  <div class="flex items-center gap-3 mt-5">
    <UCard v-for="total in totals" class="w-60 flex flex-row gap-6">
      <h2>Total {{ total.label }}</h2>
      <span class="font-semibold">{{ total.count }}</span>
    </UCard>
  </div>
</template>
