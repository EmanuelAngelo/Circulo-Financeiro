<script setup lang="ts">
import { onMounted, provide } from "vue";
import { createApplication } from "./app/createApplication";
import { applicationKey } from "./app/context";
import AuthView from "./views/AuthView.vue";
import AppLayout from "./layouts/AppLayout.vue";

const app = createApplication();
provide(applicationKey, app);
const { user, ready } = app.auth;
onMounted(() => app.feedback.run(app.auth.restore));
</script>
<template>
  <div v-if="!ready" class="loading" role="status">Carregando seu espaço…</div>
  <AuthView v-else-if="!user" />
  <AppLayout v-else />
</template>
