<script setup>
const links = [
  {
    label: "Dashboard",
    name: "dashboard",
    icon: "heroicons:home-20-solid",
    to: "/dashboard",
  },
  {
    label: "Sektor",
    name: "sectors",
    icon: "heroicons:cog-20-solid",
    to: "/dashboard/sectors",
  },
  {
    label: "Komoditas",
    name: "commodities",
    icon: "heroicons:archive-box-20-solid",
    to: "/dashboard/commodities",
  },
  {
    label: "Jenis Produk",
    name: "productTypes",
    icon: "heroicons:shopping-bag-20-solid",
    to: "/dashboard/productTypes",
  },
  {
    label: "Laporan",
    name: "reports",
    icon: "heroicons:document-text-20-solid",
    to: "/dashboard/reports",
  },
];

const route = useRoute();
const activePage = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : null;
});
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="min-w-64 bg-[#00479B] text-white p-4 space-y-4 pt-20">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 ${
          activePage == link.name && 'bg-gray-800'
        }`"
      >
        <UIcon :name="link.icon" class="w-5 h-5" />
        <span>{{ link.label }}</span>
      </NuxtLink>
    </aside>
    <div class="flex-1 p-6">
      <slot />
    </div>
  </div>
</template>
