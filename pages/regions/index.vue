<script setup>
import { ref, watch } from "vue";
import { useFetch } from "#app";
import { useDebounce, useDebounceFn } from "@vueuse/core";

const searchQuery = ref("");
const page = ref(1);
const limit = ref(20);
const regions = ref([]);
const pagination = ref({ totalRows: 0, totalPages: 1 });
const loading = ref(false);
const error = ref(null);

const fetchRegions = async () => {
  loading.value = true;
  error.value = null;

  const { data, error: fetchError } = await useFetch("/api/regions", {
    query: {
      search: searchQuery.value,
      page: page.value,
      limit: limit.value,
    },
  });

  if (fetchError.value) {
    error.value = fetchError.value;
    loading.value = false;
    return;
  }

  regions.value = data.value?.data || [];
  pagination.value = data.value?.pagination || { totalRows: 0, totalPages: 1 };
  loading.value = false;
};

const debouncedFetchRegions = useDebounceFn(fetchRegions, 500);

watch(page, fetchRegions, { immediate: true });
watch(searchQuery, () => {
  page.value = 1;
  debouncedFetchRegions();
});

const columns = [
  { key: "region_id", label: "ID" },
  { key: "nama", label: "Nama" },
  { key: "level", label: "Level" },
];
</script>

<template>
  <div class="main-container">
    <h1 class="title">Wilayah</h1>

    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="searchQuery" placeholder="Cari wilayah..." clearable />
    </div>

    <UTable
      :columns="columns"
      :rows="regions"
      :loading="loading"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }"
      :progress="{ color: 'primary', animation: 'carousel' }"
    ></UTable>

    <div
      class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
    >
      <span
        >Menampilkan {{ regions?.length || 0 }} dari
        {{ pagination.totalRows }} data</span
      >
      <UPagination
        v-model="page"
        :total="pagination.totalRows"
        :page-count="pagination.perPage"
        :sibling-count="1"
        show-total
      />
    </div>
  </div>
</template>

<style scoped>
.main-container {
  max-width: 900px;
  margin: 2rem auto;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}
</style>
