<script setup lang="ts">
import { Menu, CalendarDays } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { usePageNavigation } from "@/composables/usePageNavigation";

const app = useApplication();
const { month } = app.finance;
const { members } = app.circles;
const { page, nav } = usePageNavigation();
const mobile = defineModel<boolean>({ required: true });
</script>
<template>
  <header class="topbar">
    <button
      class="mobile-menu icon"
      @click="mobile = true"
      aria-label="Abrir menu"
    >
      <Menu />
    </button>
    <div class="breadcrumb">
      Meu espaço <span>/</span>
      <b>{{ nav.find((n) => n.id === page)?.label }}</b>
    </div>
    <div class="top-actions">
      <span class="shared"
        ><span class="tiny-dot"></span> {{ members.length }} no círculo</span
      ><label class="month-picker"
        ><CalendarDays :size="16" /><input
          type="month"
          v-model="month"
          required
          aria-label="Mês de referência"
      /></label>
    </div>
  </header>
</template>
