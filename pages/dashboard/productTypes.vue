<script setup>
import { useDebounceFn } from "@vueuse/core";

definePageMeta({
  layout: "dashboard",
});

const productTypes = ref([]);
const productTypeSelected = ref({});

const page = ref(1);
const pagination = ref({ totalRows: 0, totalPages: 1 });
const search = ref("");

const loadingProductType = ref(false);
const loadingProductTypeDetail = ref(false);

const isModalOpen = ref(false);

const fetchProductTypes = async () => {
  loadingProductType.value = true;

  try {
    const data = await $fetch("/api/productTypes", {
      query: { page: page.value, limit: 8, search: search.value },
    });
    productTypes.value = data.data;
    pagination.value = data.pagination;
  } catch (error) {
    console.error("Error fetching product types:", error);
  } finally {
    loadingProductType.value = false;
  }
};

const handleModalOpen = async (id) => {
  isModalOpen.value = true;
  loadingProductTypeDetail.value = true;
  try {
    const data = await $fetch(`/api/productTypes/${id}`);
    productTypeSelected.value = data.data;
  } catch (error) {
    console.error("Error fetching product type detail:", error);
  } finally {
    loadingProductTypeDetail.value = false;
  }
};

const debouncedFetchProductTypes = useDebounceFn(fetchProductTypes, 500);

watch(page, fetchProductTypes, { immediate: true });
watch(search, () => {
  page.value = 1;
  debouncedFetchProductTypes();
});
</script>

<template>
  <h1 class="font-bold text-2xl">Jenis Produk</h1>
  <div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="search" placeholder="Cari komoditas..." clearable />
    </div>
    <UTable
      :rows="productTypes"
      :columns="[
        { key: 'id_produk_jenis', label: 'ID Jenis Produk' },
        { key: 'produk_jenis', label: 'Jenis Produk' },
        { key: 'produk_jenis_baku', label: 'Jenis Produk Baku' },
        { key: 'actions' },
      ]"
      :loading="loadingProductType"
      data-testid="sector-table"
      ><template #actions-data="{ row }">
        <UButton
          color="yellow"
          variant="outline"
          @click="handleModalOpen(row.id_produk_jenis)"
          >Detail</UButton
        ></template
      ></UTable
    >
    <div
      class="flex justify-between px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
    >
      <span
        >Menampilkan {{ productTypes?.length || 0 }} dari
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
        v-if="loadingProductTypeDetail"
        class="h-36 flex justify-center items-center"
      >
        <UIcon name="svg-spinners:blocks-wave" />
      </div>
      <div v-else class="flex flex-col gap-5">
        <div class="flex flex-col">
          <span class="text-xs">ID Jenis Produk</span>
          <span class="font-medium">
            {{ productTypeSelected.id_produk_jenis }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Jenis Produk</span>
          <span class="font-medium">
            {{ productTypeSelected.produk_jenis }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Produk Jenis Baku</span>
          <span class="font-medium">
            {{ productTypeSelected.produk_jenis_baku }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Komoditas</span>
          <span class="font-medium">
            {{
              productTypeSelected.komoditas.length
                ? productTypeSelected.komoditas.join(", ")
                : "-"
            }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">KBLI Terbaca</span>
          <div
            v-if="productTypeSelected.kbli.length"
            v-for="(kbli, index) in productTypeSelected.kbli"
          >
            <span class="font-medium">
              {{ kbli }}
            </span>
            <UDivider
              class="mt-1"
              v-if="!(productTypeSelected.kbli.length - 1 == index)"
            />
          </div>
          <div v-else>-</div>
        </div>
        <div class="grid grid-cols-3">
          <div class="flex flex-col">
            <span class="text-xs">Dibuat pada</span>
            <span class="font-medium">
              {{ productTypeSelected.created_at || "-" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Diubah pada</span>
            <span class="font-medium">
              {{ productTypeSelected.updated_at || "-" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Dihapus pada</span>
            <span class="font-medium">
              {{ productTypeSelected.deleted_at || "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UModal>
</template>
