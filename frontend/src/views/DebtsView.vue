<script setup lang="ts">
import { Wallet, Trash2, Pencil, Check } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { money } from "@/utils/format";
import { useDebtPriorities } from "@/composables/useDebtPriorities";

const app = useApplication();
const { debts, summary, remove } = app.finance;
const { busy } = app.feedback;
const { open } = app.editor;
const { strategy, debtOrder } = useDebtPriorities(app.finance.debts);
</script>
<template>
  <div class="debt-summary card">
    <div>
      <span class="eyebrow">TOTAL A ENFRENTAR</span>
      <h1>{{ money(summary.debt_total) }}</h1>
      <p>
        {{ debts.filter((d) => Number(d.balance) > 0).length }}
        dívidas com saldo informado
      </p>
    </div>
    <div>
      <label
        >Organizar prioridades<select v-model="strategy">
          <option value="rate">Maior taxa de juros primeiro</option>
          <option value="balance">Menor saldo primeiro</option>
        </select></label
      >
    </div>
  </div>
  <div class="alert">
    A ordem destaca as dívidas marcadas como urgentes. Juros e saldos são
    informados por você; não são consultados no banco. Revise também vencimentos
    e consequências de atraso.
  </div>
  <div class="cards-grid">
    <article v-for="(d, i) in debtOrder" :key="d.id" class="card debt-card">
      <div class="section-heading">
        <span class="badge neutral">{{
          i === 0 ? "Primeira na sua lista" : `Prioridade ${i + 1}`
        }}</span>
        <div class="row-actions">
          <button
            class="icon"
            @click="open('debts', d)"
            aria-label="Editar dívida"
          >
            <Pencil :size="16" /></button
          ><button
            class="icon"
            :disabled="busy"
            @click="remove('debts', d)"
            aria-label="Excluir dívida"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
      <h2>{{ d.name }}</h2>
      <strong class="debt-amount">{{ money(d.balance) }}</strong>
      <div class="debt-detail">
        <span
          >Parcela informada<b>{{ money(d.installment) }}</b></span
        ><span
          >Juros ao mês<b>{{
            d.monthly_rate === null ? "Não informado" : `${d.monthly_rate}%`
          }}</b></span
        >
      </div>
      <span v-if="d.payroll" class="badge lavender">Descontada em folha</span
      ><span v-if="d.priority === 'urgent'" class="badge coral">Urgente</span>
      <p class="hint">
        {{
          d.note || "Anote aqui uma proposta de negociação ou o próximo passo."
        }}
      </p>
    </article>
  </div>
  <div v-if="!debtOrder.length" class="empty card">
    <Wallet />
    <h3>Nenhuma dívida com saldo pendente cadastrada.</h3>
    <button class="secondary" @click="open('debts')">Cadastrar dívida</button>
  </div>
  <div
    v-for="d in debts.filter((d) => Number(d.balance) === 0)"
    :key="d.id"
    class="card settled"
  >
    <Check :size="20" /><b>{{ d.name }} · Quitada</b
    ><button class="text-button" @click="open('debts', d)">Editar</button>
  </div>
  <div class="card guidance">
    <h2>Um plano que cabe na vida real.</h2>
    <p>
      Cadastre o saldo atualizado e revise-o após cada pagamento ou negociação.
      As parcelas aqui são informativas: registre os pagamentos em Lançamentos
      quando saírem da conta. Nenhum saldo de dívida é reduzido automaticamente.
    </p>
    <p>
      Inspirado na ideia de dar um destino ao dinheiro: entender os gastos,
      distinguir necessidades de desejos e construir reservas. Sem impor uma
      porcentagem fixa enquanto o orçamento não fecha.
    </p>
  </div>
</template>
