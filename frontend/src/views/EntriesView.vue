<script setup lang="ts">
import { ArrowLeftRight, Trash2, Pencil, Download } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { money } from "@/utils/format";
import { useEntryFilters } from "@/composables/useEntryFilters";

const app = useApplication();
const { accountName, remove, togglePaid, exportData } = app.finance;
const { busy } = app.feedback;
const { online } = app.pwa;
const { open } = app.editor;
const { search, kindFilter, filtered } = useEntryFilters(
  app.finance.monthEntries,
);
</script>
<template>
  <div class="card">
    <div class="filters">
      <input
        v-model="search"
        placeholder="Buscar lançamento…"
        aria-label="Buscar lançamento"
      /><select v-model="kindFilter" aria-label="Filtrar tipo">
        <option value="all">Entradas e saídas</option>
        <option value="expense">Só despesas</option>
        <option value="income">Só entradas</option></select
      ><button class="secondary" @click="exportData">
        <Download :size="16" /> Exportar dados
      </button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Lançamento</th>
            <th>Data</th>
            <th>Conta</th>
            <th>Valor</th>
            <th>Situação</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtered" :key="e.id">
            <td>
              <b>{{ e.description }}</b
              ><small
                >{{ e.category }}{{ e.essential ? " · Essencial" : "" }} ·
                {{ e.author_name }}</small
              >
            </td>
            <td>{{ e.date.split("-").reverse().join("/") }}</td>
            <td>{{ accountName(e.account) }}</td>
            <td class="nowrap" :class="{ 'text-green': e.kind === 'income' }">
              {{ e.kind === "income" ? "+" : "−" }}
              {{ money(e.amount) }}
            </td>
            <td>
              <button
                :class="['badge', e.paid ? 'green' : 'gold']"
                :disabled="busy || !online"
                @click="togglePaid(e)"
              >
                {{ e.paid ? "Efetivado" : "Previsto" }}
              </button>
            </td>
            <td>
              <div class="row-actions">
                <button
                  class="icon"
                  @click="open('entries', e)"
                  aria-label="Editar lançamento"
                >
                  <Pencil :size="16" /></button
                ><button
                  class="icon"
                  :disabled="busy"
                  @click="remove('entries', e)"
                  aria-label="Excluir lançamento"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!filtered.length" class="empty">
      <ArrowLeftRight />
      <h3>Nenhum lançamento encontrado.</h3>
      <p>Escolha outro mês ou registre sua primeira movimentação.</p>
    </div>
  </div>
  <div class="alert">
    Cartão nesta versão: registre a fatura como despesa no vencimento. Não
    registre também as compras que já estão incluídas nela. Consignado já
    abatido do salário líquido não deve virar uma segunda saída.
  </div>
</template>
