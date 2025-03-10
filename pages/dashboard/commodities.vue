<script setup>
import { useDebounceFn } from "@vueuse/core";

definePageMeta({
  layout: "dashboard",
});

const commodities = ref([]);
const commoditySelected = ref({});

const search = ref("");
const page = ref(1);
const pagination = ref({ totalRows: 0, totalPages: 1 });

const loadingCommodities = ref(false);
const loadingCommodityDetail = ref(false);

const isModalOpen = ref(false);

const fetchCommodities = async () => {
  loadingCommodities.value = true;

  try {
    const data = await $fetch("/api/commodities", {
      query: { page: page.value, limit: 8, search: search.value },
    });
    commodities.value = data.data;
    pagination.value = data.pagination;
  } catch (error) {
    console.error("Error fetching commodities:", error);
  } finally {
    loadingCommodities.value = false;
  }
};

const handleModalOpen = async (id) => {
  isModalOpen.value = true;
  loadingCommodityDetail.value = true;
  try {
    const data = await $fetch(`/api/commodities/${id}`);
    commoditySelected.value = data.data;
  } catch (error) {
    console.error("Error fetching commodity detail:", error);
  } finally {
    loadingCommodityDetail.value = false;
  }
};

const debouncedFetchCommodities = useDebounceFn(fetchCommodities, 500);

watch(page, fetchCommodities, { immediate: true });
watch(search, () => {
  page.value = 1;
  debouncedFetchCommodities();
});
</script>

<template>
  <h1 class="font-bold text-2xl">Komoditas</h1>
  <div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="search" placeholder="Cari komoditas..." clearable />
    </div>

    <UTable
      :rows="commodities"
      :columns="[
        { key: 'id_komoditas', label: 'ID Komoditas' },
        { key: 'komoditas', label: 'Komoditas' },
        { key: 'actions' },
      ]"
      :loading="loadingCommodities"
      data-testid="sector-table"
      ><template #actions-data="{ row }">
        <UButton
          color="yellow"
          variant="outline"
          @click="handleModalOpen(row.id_komoditas)"
          >Detail</UButton
        ></template
      ></UTable
    >
    <div
      class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
    >
      <span
        >Menampilkan {{ commodities?.length || 0 }} dari
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
  <UModal v-model="isModalOpen">
    <div class="p-10">
      <div
        v-if="loadingCommodityDetail"
        class="h-36 flex justify-center items-center"
      >
        <UIcon name="svg-spinners:blocks-wave" />
      </div>
      <div v-else class="flex flex-col gap-5">
        <div class="grid grid-cols-2">
          <div class="flex flex-col">
            <span class="text-xs">ID Komoditas</span>
            <span class="font-medium">
              {{ commoditySelected.id_komoditas }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Komoditas</span>
            <span class="font-medium">
              {{ commoditySelected.komoditas }}
            </span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Kategori</span>
          <span class="font-medium">
            {{ commoditySelected.kategori || "-" }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Sektor</span>
          <span class="font-medium">
            {{
              commoditySelected.sektor.length
                ? commoditySelected.sektor.join(", ")
                : "-"
            }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Produk Jenis</span>
          <span class="font-medium">
            {{ commoditySelected.produk_jenis.join(", ") }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">KBLI Terbaca</span>
          <div v-for="(kbli, index) in commoditySelected.kbli">
            <span class="font-medium">
              {{ kbli }}
            </span>
            <UDivider
              class="mt-1"
              v-if="!(commoditySelected.kbli.length - 1 == index)"
            />
          </div>
        </div>
        <div class="grid grid-cols-3">
          <div class="flex flex-col">
            <span class="text-xs">Dibuat pada</span>
            <span class="font-medium">
              {{ commoditySelected.created_at || "-" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Diubah pada</span>
            <span class="font-medium">
              {{ commoditySelected.updated_at || "-" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Dihapus pada</span>
            <span class="font-medium">
              {{ commoditySelected.deleted_at || "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UModal>
</template>
