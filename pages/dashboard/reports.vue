<script setup>
definePageMeta({
  layout: "dashboard",
});

const selectedData = ref("");
const apiSelect = ref("");
const tableData = ref([]);
const loading = ref(false);

const handleSelectedData = async (selected) => {
  selectedData.value = selected;
  loading.value = true;

  try {
    if (selected == "Sektor") {
      apiSelect.value = "sectors";
      columnsSelected.value = columnsSector;
    }
    if (selected == "Komoditas") {
      apiSelect.value = "commodities";
      columnsSelected.value = columnsCommodities;
    }
    if (selected == "Jenis Produk") {
      apiSelect.value = "productTypes";
      columnsSelected.value = columnsProductTypes;
    }
    const response = await $fetch(`/api/${apiSelect.value}?all=true`);
    tableData.value = response.data.map((e) => {
      if ("komoditas" in e && Array.isArray(e.komoditas)) {
        e.komoditas = e.komoditas.join(", ");
      } else if ("sektor" in e && Array.isArray(e.sektor)) {
        e.sektor = e.sektor.join(", ");
      }
      return e;
    });
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
  } finally {
    loading.value = false;
  }
};

const items = [
  [
    {
      label: "Sektor",
      click: () => {
        handleSelectedData("Sektor");
      },
    },
  ],
  [
    {
      label: "Komoditas",
      click: () => {
        handleSelectedData("Komoditas");
      },
    },
  ],
  [
    {
      label: "Jenis Produk",
      click: () => {
        handleSelectedData("Jenis Produk");
      },
    },
  ],
];

const columnsSelected = ref([]);
const columnsSector = [
  { key: "id_sektor", label: "ID Sektor" },
  { key: "sektor", label: "Sektor" },
  { key: "komoditas", label: "Komoditas" },
];
const columnsCommodities = [
  { key: "id_komoditas", label: "ID Komoditas" },
  { key: "komoditas", label: "Komoditas" },
  { key: "sektor", label: "Sektor" },
];
const columnsProductTypes = [
  { key: "id_produk_jenis", label: "ID Jenis Produk" },
  { key: "produk_jenis", label: "Jenis Produk" },
  { key: "produk_jenis_baku", label: "Jenis Produk Baku" },
  { key: "komoditas", label: "Komoditas" },
];

const handleExport = async (to, data) => {
  window.open(`/api/export/${data}?to=${to}`, "_blank");
};
</script>

<template>
  <h1 class="font-bold text-2xl">Laporan</h1>
  <div class="mt-5 flex gap-5">
    <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
      <UButton
        color="white"
        label="Data"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
    </UDropdown>
    <div v-if="selectedData" class="flex gap-3">
      <UButton
        variant="solid"
        color="primary"
        @click.prevent="handleExport('csv', apiSelect)"
        data-testid="export-province-csv"
      >
        Export to CSV
      </UButton>
      <UButton
        variant="solid"
        color="rose"
        @click.prevent="handleExport('pdf', apiSelect)"
        data-testid="export-province-pdf"
      >
        Export to PDF
      </UButton>
    </div>
  </div>

  <div class="mt-5">
    <UTable
      class="overflow-x-auto"
      :rows="tableData"
      :columns="columnsSelected"
      :loading="loading"
      data-testid="data-table"
    />
  </div>
</template>
