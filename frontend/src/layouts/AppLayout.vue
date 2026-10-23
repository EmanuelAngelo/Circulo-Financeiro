<script setup lang="ts">
import { ref } from "vue";
import { useApplication } from "@/app/context";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import PageHeading from "@/components/layout/PageHeading.vue";
import AppAlerts from "@/components/common/AppAlerts.vue";
import RecordDialog from "@/components/finance/RecordDialog.vue";
import CircleOnboardingView from "@/views/CircleOnboardingView.vue";

const app = useApplication();
const { circleId } = app.circles;
const { loading, loaded, load } = app.finance;
const mobile = ref(false);
</script>
<template>
  <div class="app-shell">
    <AppSidebar v-model="mobile" />
    <div v-if="mobile" class="scrim" @click="mobile = false" />
    <main>
      <AppHeader v-model="mobile" />
      <div class="content">
        <AppAlerts />
        <CircleOnboardingView v-if="!circleId" />
        <template v-else
          ><PageHeading />
          <div v-if="loading" class="loading" role="status">
            Atualizando seu círculo…
          </div>
          <RouterView v-else-if="loaded" /><button
            v-else
            class="secondary"
            @click="load"
          >
            Tentar carregar novamente
          </button></template
        >
      </div>
    </main>
    <RecordDialog />
  </div>
</template>
