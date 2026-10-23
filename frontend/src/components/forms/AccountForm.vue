<script setup lang="ts">
import type { Draft, Account } from "@/types/finance";

const form = defineModel<Draft<Account>>({ required: true });
</script>
<template>
  <label
    >Nome da conta<input
      v-model="form.name"
      required
      maxlength="80"
      placeholder="Ex.: Conta salário" /></label
  ><label
    >Tipo<select v-model="form.kind">
      <option value="cash">Dinheiro</option>
      <option value="benefit">Benefício alimentação</option>
    </select></label
  ><label
    >Saldo anterior ao primeiro registro (R$)<input
      v-model="form.opening_balance"
      required
      type="number"
      step="0.01"
  /></label>
  <p class="hint">
    Com lançamentos cadastrados, tipo e saldo inicial ficam protegidos contra
    alterações.
  </p>
</template>
