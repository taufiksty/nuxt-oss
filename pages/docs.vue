<script setup lang="ts">
import "swagger-ui-dist/swagger-ui.css";
// @ts-ignore
import SwaggerUI from "swagger-ui-dist/swagger-ui-es-bundle";

onMounted(() => {
  SwaggerUI({
    dom_id: "#swagger",
    url: "/api/docs",
  });
});
</script>

<template>
  <div>
    <div id="swagger"></div>
  </div>
</template>
