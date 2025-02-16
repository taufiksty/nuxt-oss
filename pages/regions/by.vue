<script setup>
import { ref, watch } from "vue";

const searchProvince = ref("");
const searchCity = ref("");
const searchDistrict = ref("");
const searchVillage = ref("");

const selectedProvince = ref([]);
const selectedCity = ref([]);
const selectedDistrict = ref([]);
const selectedVillage = ref([]);

const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);

const loadingProvince = ref(false);
const loadingCity = ref(false);
const loadingDistrict = ref(false);
const loadingVillage = ref(false);

const fetchProvinces = async () => {
  loadingProvince.value = true;

  try {
    const data = await $fetch("/api/regions/provinces", {
      query: { search: searchProvince.value },
    });

    provinces.value = data.data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
  } finally {
    loadingProvince.value = false;
  }
};

const fetchCities = async () => {
  if (!selectedProvince.value.length) return;
  loadingCity.value = true;

  try {
    const data = await $fetch(
      `/api/regions/provinces/${selectedProvince.value[0].region_id}/cities`,
      {
        query: { search: searchCity.value },
      }
    );

    cities.value = data.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
  } finally {
    loadingCity.value = false;
  }
};

const fetchDistricts = async () => {
  if (!selectedCity.value.length) return;
  loadingDistrict.value = true;

  try {
    const data = await $fetch(
      `/api/regions/provinces/${selectedProvince.value[0].region_id}/cities/${selectedCity.value[0].region_id}/districts`,
      {
        query: { search: searchDistrict.value },
      }
    );

    districts.value = data.data;
  } catch (error) {
    console.error("Error fetching districts:", error);
  } finally {
    loadingDistrict.value = false;
  }
};

const fetchVillages = async () => {
  if (!selectedDistrict.value.length) return;
  loadingVillage.value = true;

  try {
    const data = await $fetch(
      `/api/regions/provinces/${selectedProvince.value[0].region_id}/cities/${selectedCity.value[0].region_id}/districts/${selectedDistrict.value[0].region_id}/villages`,
      {
        query: { search: searchVillage.value },
      }
    );

    villages.value = data.data;
  } catch (error) {
    console.error("Error fetching villages:", error);
  } finally {
    loadingVillage.value = false;
  }
};

watch(searchProvince, fetchProvinces, { immediate: true });
watch(searchCity, fetchCities);
watch(searchDistrict, fetchDistricts);
watch(searchVillage, fetchVillages);

watch(selectedProvince, () => {
  if (selectedProvince.value.length) {
    provinces.value = [selectedProvince.value[0]];
    fetchCities();
  } else {
    selectedCity.value = [];
    cities.value = [];
    selectedDistrict.value = [];
    districts.value = [];
    selectedVillage.value = [];
    villages.value = [];
    fetchProvinces();
  }
});

watch(selectedCity, () => {
  if (selectedCity.value.length) {
    cities.value = [selectedCity.value[0]];
    selectedDistrict.value = [];
    fetchDistricts();
  } else {
    selectedDistrict.value = [];
    districts.value = [];
    selectedVillage.value = [];
    villages.value = [];
    fetchCities();
  }
});

watch(selectedDistrict, () => {
  if (selectedDistrict.value.length) {
    districts.value = [selectedDistrict.value[0]];
    selectedVillage.value = [];
    fetchVillages();
  } else {
    selectedVillage.value = [];
    villages.value = [];
    fetchDistricts();
  }
});

watch(selectedVillage, () => {
  if (selectedVillage.value.length) {
    villages.value = [selectedVillage.value[0]];
  } else {
    fetchVillages();
  }
});
</script>

<template>
  <div class="main-container">
    <h1 class="title">Wilayah (berdasarkan)</h1>

    <div>
      <h2>Provinsi</h2>
      <div
        class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700"
      >
        <UInput
          v-model="searchProvince"
          placeholder="Cari provinsi..."
          clearable
        />
      </div>
      <UTable
        :rows="provinces"
        :columns="[
          { key: 'region_id', label: 'ID' },
          { key: 'nama', label: 'Nama Provinsi' },
        ]"
        :loading="loadingProvince"
        v-model="selectedProvince"
        :single-select="true"
      />
    </div>

    <div v-if="selectedProvince.length" class="mt-10">
      <h2>Kota/Kabupaten</h2>
      <div
        class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700"
      >
        <UInput
          v-model="searchCity"
          placeholder="Cari kota/kabupaten..."
          clearable
        />
      </div>
      <UTable
        :rows="cities"
        :columns="[
          { key: 'region_id', label: 'ID' },
          { key: 'nama', label: 'Nama Kota/Kabupaten' },
        ]"
        :loading="loadingCity"
        v-model="selectedCity"
        :single-select="true"
      />
    </div>

    <div v-if="selectedCity.length" class="mt-10">
      <h2>Kecamatan</h2>
      <div
        class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700"
      >
        <UInput
          v-model="searchDistrict"
          placeholder="Cari kecamatan..."
          clearable
        />
      </div>
      <UTable
        :rows="districts"
        :columns="[
          { key: 'region_id', label: 'ID' },
          { key: 'nama', label: 'Nama Kecamatan' },
        ]"
        :loading="loadingDistrict"
        v-model="selectedDistrict"
        :single-select="true"
      />
    </div>

    <div v-if="selectedDistrict.length" class="mt-10">
      <h2>Kelurahan/Desa</h2>
      <div
        class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700"
      >
        <UInput
          v-model="searchVillage"
          placeholder="Cari kelurahan/desa..."
          clearable
        />
      </div>
      <UTable
        :rows="villages"
        :columns="[
          { key: 'region_id', label: 'ID' },
          { key: 'nama', label: 'Nama Kelurahan/Desa' },
        ]"
        :loading="loadingVillage"
        v-model="selectedVillage"
        :single-select="true"
      />
    </div>

    <div v-if="selectedVillage.length" class="mt-10">
      <p>
        Rekap lokasi usahamu: {{ selectedProvince[0].nama }},
        {{ selectedCity[0].nama }}, {{ selectedDistrict[0].nama }},
        {{ selectedVillage[0].nama }}
      </p>
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
