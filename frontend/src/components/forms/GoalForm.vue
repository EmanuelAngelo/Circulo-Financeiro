<script setup lang="ts">
import type { Draft, Goal } from "@/types/finance";

const form = defineModel<Draft<Goal>>({ required: true });
</script>
<template>
  <label
    >Nome da meta<input
      v-model="form.name"
      required
      maxlength="100"
      placeholder="Ex.: Reserva para a chegada da nossa filha"
  /></label>
  <div class="form-grid">
    <label
      >Valor desejado (R$)<input
        v-model="form.target"
        required
        type="number"
        min="0.01"
        step="0.01" /></label
    ><label
      >Já guardado (R$)<input
        v-model="form.saved"
        required
        type="number"
        min="0"
        step="0.01"
    /></label>
  </div>
  <p class="hint">Acompanhamento manual, sem movimentar dinheiro.</p>
</template>
