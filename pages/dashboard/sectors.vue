<script setup>
definePageMeta({
  layout: "dashboard",
});

const sectors = ref([]);
const sectorSelected = ref({});

const loadingSectors = ref(false);
const loadingSectorDetail = ref(false);

const isModalOpen = ref(false);

const fetchSectors = async () => {
  loadingSectors.value = true;

  try {
    const data = await $fetch("/api/sectors");
    sectors.value = data.data;
  } catch (error) {
    console.error("Error fetching sectors:", error);
  } finally {
    loadingSectors.value = false;
  }
};

const handleModalOpen = async (id) => {
  isModalOpen.value = true;
  loadingSectorDetail.value = true;
  try {
    const data = await $fetch(`/api/sectors/${id}`);
    sectorSelected.value = data.data;
  } catch (error) {
    console.error("Error fetching sector detail:", error);
  } finally {
    loadingSectorDetail.value = false;
  }
};

fetchSectors();
</script>

<template>
  <h1 class="font-bold text-2xl">Sektor</h1>
  <UTable
    :rows="sectors"
    :columns="[
      { key: 'id_sektor', label: 'ID Sektor' },
      { key: 'sektor', label: 'Sektor' },
      { key: 'actions' },
    ]"
    :loading="loadingSectors"
    data-testid="sector-table"
    ><template #actions-data="{ row }">
      <UButton
        color="yellow"
        variant="outline"
        @click="handleModalOpen(row.id_sektor)"
        >Detail</UButton
      ></template
    ></UTable
  >
  <UModal v-model="isModalOpen">
    <div class="p-10">
      <div
        v-if="loadingSectorDetail"
        class="h-36 flex justify-center items-center"
      >
        <UIcon name="svg-spinners:blocks-wave" />
      </div>
      <div v-else class="flex flex-col gap-5">
        <div class="grid grid-cols-2">
          <div class="flex flex-col">
            <span class="text-xs">ID Sektor</span>
            <span class="font-medium">
              {{ sectorSelected.id_sektor }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Sektor</span>
            <span class="font-medium">
              {{ sectorSelected.sektor }}
            </span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">Komoditas</span>
          <span class="font-medium">
            {{
              sectorSelected.komoditas.length
                ? sectorSelected.komoditas.join(", ")
                : "-"
            }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs">ID Organisasi</span>
          <span class="font-medium">
            {{ sectorSelected.id_organisasi }}
          </span>
        </div>
        <div class="grid grid-cols-3">
          <div class="flex flex-col">
            <span class="text-xs">Dibuat pada</span>
            <span class="font-medium">
              {{ sectorSelected.created_at || "-" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Diubah pada</span>
            <span class="font-medium">
              {{ sectorSelected.updated_at || "-" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs">Dihapus pada</span>
            <span class="font-medium">
              {{ sectorSelected.deleted_at || "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UModal>
</template>
