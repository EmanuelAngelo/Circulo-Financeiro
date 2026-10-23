<script setup lang="ts">
import { Trash2, Pencil, SlidersHorizontal } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { money } from "@/utils/format";
import { percent } from "@/utils/format";
import { computed } from "vue";

const app = useApplication();
const { currentBudgets, spent, remove } = app.finance;
const { busy } = app.feedback;
const { open } = app.editor;
const essentials = computed(() =>
  app.finance.monthEntries.value
    .filter((e) => e.kind === "expense" && e.essential)
    .reduce((s, e) => s + Number(e.amount), 0),
);
</script>
<template>
  <div class="card guidance">
    <h2>O essencial vem para a conversa.</h2>
    <p>
      {{ money(essentials) }} em despesas marcadas como essenciais neste mês,
      incluindo benefício. Os limites abaixo consideram todas as contas do
      círculo.
    </p>
  </div>
  <div class="cards-grid">
    <article v-for="b in currentBudgets" :key="b.id" class="card">
      <div class="section-heading">
        <h2>{{ b.category }}</h2>
        <div class="row-actions">
          <button
            class="icon"
            @click="open('budgets', b)"
            aria-label="Editar limite"
          >
            <Pencil :size="16" /></button
          ><button
            class="icon"
            @click="remove('budgets', b)"
            :disabled="busy"
            aria-label="Excluir limite"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
      <h2>
        {{ money(spent(b.category)) }}
        <small class="muted">de {{ money(b.limit) }}</small>
      </h2>
      <div class="track large">
        <span
          :style="{
            width: percent(spent(b.category), b.limit) + '%',
            background:
              spent(b.category) > Number(b.limit) ? '#c56656' : '#246c5c',
          }"
        ></span>
      </div>
      <p :class="spent(b.category) > Number(b.limit) ? 'text-red' : 'muted'">
        {{
          spent(b.category) > Number(b.limit)
            ? "Acima do limite em " + money(spent(b.category) - Number(b.limit))
            : "Ainda disponível: " + money(Number(b.limit) - spent(b.category))
        }}
      </p>
    </article>
  </div>
  <div v-if="!currentBudgets.length" class="empty card">
    <SlidersHorizontal />
    <h3>Planeje uma categoria de cada vez.</h3>
    <p>Comece por alimentação, moradia ou lazer.</p>
    <button class="secondary" @click="open('budgets')">
      Criar limite mensal
    </button>
  </div>
</template>
