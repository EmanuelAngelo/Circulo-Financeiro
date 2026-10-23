<script setup lang="ts">
import { Target, ArrowUpRight, Trash2, Pencil } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { money } from "@/utils/format";
import { percent } from "@/utils/format";

const app = useApplication();
const { goals, remove } = app.finance;
const { busy } = app.feedback;
const { open } = app.editor;
</script>
<template>
  <div class="cards-grid">
    <article class="card goal-card" v-for="g in goals" :key="g.id">
      <div class="section-heading">
        <span class="icon-tile lavender"><Target /></span>
        <div class="row-actions">
          <button
            class="icon"
            @click="open('goals', g)"
            aria-label="Editar meta"
          >
            <Pencil :size="16" /></button
          ><button
            class="icon"
            @click="remove('goals', g)"
            :disabled="busy"
            aria-label="Excluir meta"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
      <h2>{{ g.name }}</h2>
      <p>
        <strong>{{ money(g.saved) }}</strong> de
        {{ money(g.target) }}
      </p>
      <div class="track large">
        <span :style="{ width: percent(g.saved, g.target) + '%' }"></span>
      </div>
      <div class="section-heading">
        <small>{{ percent(g.saved, g.target).toFixed(0) }}% do caminho</small
        ><button class="text-button" @click="open('goals', g)">
          Atualizar valor <ArrowUpRight :size="16" />
        </button>
      </div>
    </article>
  </div>
  <div v-if="!goals.length" class="empty card">
    <Target />
    <h3>Qual sonho vocês querem proteger?</h3>
    <p>A chegada da filha, uma reserva de emergência, uma vida sem dívidas.</p>
    <button class="secondary" @click="open('goals')">
      Criar nossa primeira meta
    </button>
  </div>
  <div class="alert">
    Metas são acompanhamento manual. O valor guardado não transfere nem reserva
    dinheiro nas contas e não é somado aos saldos do painel.
  </div>
</template>
