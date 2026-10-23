<script setup lang="ts">
import type { Draft, Budget } from "@/types/finance";
import { categories } from "@/constants/categories";

const form = defineModel<Draft<Budget>>({ required: true });
defineProps<{ monthLabel: string }>();
</script>
<template>
  <label
    >Categoria<select v-model="form.category">
      <option v-for="c in categories" :key="c">{{ c }}</option>
    </select></label
  ><label
    >Limite para {{ monthLabel }} (R$)<input
      v-model="form.limit"
      required
      type="number"
      min="0.01"
      step="0.01"
  /></label>
  <p class="hint">
    Considera despesas previstas e efetivadas, incluindo benefício alimentação.
  </p>
</template>
