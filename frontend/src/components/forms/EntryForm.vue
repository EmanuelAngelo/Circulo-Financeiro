<script setup lang="ts">
import { Lightbulb } from "lucide-vue-next";
import type { Draft, Entry, Account } from "@/types/finance";
import { categories } from "@/constants/categories";

const form = defineModel<Draft<Entry>>({ required: true });
defineProps<{ accounts: Account[] }>();
</script>
<template>
  <div class="segmented">
    <button
      type="button"
      :class="{ selected: form.kind === 'expense' }"
      @click="form.kind = 'expense'"
    >
      Despesa</button
    ><button
      type="button"
      :class="{ selected: form.kind === 'income' }"
      @click="form.kind = 'income'"
    >
      Entrada
    </button>
  </div>
  <label
    >O que foi?<input
      v-model="form.description"
      required
      maxlength="120"
      placeholder="Ex.: Energia, salário líquido, farmácia"
      autofocus
  /></label>
  <div class="form-grid">
    <label
      >Valor (R$)<input
        v-model="form.amount"
        type="number"
        step="0.01"
        min="0.01"
        required
        inputmode="decimal"
        placeholder="0,00" /></label
    ><label
      >Data / vencimento<input
        v-model="form.date"
        type="date"
        required /></label
    ><label
      >Conta<select v-model="form.account" required>
        <option v-for="a in accounts" :value="a.id" :key="a.id">
          {{ a.name }}
        </option>
      </select></label
    ><label
      >Categoria<select v-model="form.category">
        <option v-for="c in categories" :key="c">{{ c }}</option>
      </select></label
    >
  </div>
  <label class="checkbox"
    ><input v-model="form.paid" type="checkbox" /> Já foi
    {{ form.kind === "income" ? "recebido" : "pago" }}</label
  ><label v-if="form.kind === 'expense'" class="checkbox"
    ><input v-model="form.essential" type="checkbox" /> É uma despesa
    essencial</label
  >
  <div v-if="form.kind === 'expense' && !form.essential" class="reflection">
    <Lightbulb :size="20" />
    <p>
      Isso precisa acontecer agora? Pode esperar? Existe uma alternativa que
      cabe melhor no mês?
    </p>
  </div>
  <label
    >Observação opcional<textarea
      v-model="form.note"
      maxlength="500"
      placeholder="Uma reflexão ou detalhe para lembrar."
    ></textarea>
  </label>
  <p v-if="form.kind === 'income'" class="hint">
    Salário: informe o valor líquido que cai na conta, após descontos. Cadastre
    o Alelo na conta de benefício.
  </p>
</template>
