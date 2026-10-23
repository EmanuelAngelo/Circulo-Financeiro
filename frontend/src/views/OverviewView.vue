<script setup lang="ts">
import {
  ArrowLeftRight,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Heart,
} from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { money } from "@/utils/format";
import { percent } from "@/utils/format";
import { usePageNavigation } from "@/composables/usePageNavigation";
import { useDashboard } from "@/composables/useDashboard";

const app = useApplication();
const { summary, monthLabel, accountName } = app.finance;
const { open } = app.editor;
const { page } = usePageNavigation();
const { latest, cashBalance, benefitBalance, categoryTotals } = useDashboard(
  app.finance,
);
</script>
<template>
  <div class="hero-grid">
    <section class="hero-balance">
      <div class="hero-top">
        <span>RESULTADO PREVISTO DO MÊS</span
        ><span class="pill">{{ monthLabel }}</span>
      </div>
      <div class="big-number">{{ money(summary.result) }}</div>
      <p>
        {{
          Number(summary.result) < 0
            ? "Os compromissos superam as entradas registradas. Vamos rever as prioridades."
            : "A diferença entre entradas e despesas registradas. Ainda vale conferir os próximos compromissos."
        }}
      </p>
      <div class="hero-bottom">
        <span :class="['status', { negative: Number(summary.result) < 0 }]"
          ><span class="tiny-dot"></span
          >{{
            Number(summary.result) < 0 ? "Mês no vermelho" : "Mês em equilíbrio"
          }}</span
        ><button @click="page = 'entries'">
          Ver movimentações <ArrowUpRight :size="16" />
        </button>
      </div>
    </section>
    <section class="card intention">
      <div class="icon-tile lavender"><Lightbulb :size="23" /></div>
      <div class="eyebrow">ANTES DA PRÓXIMA COMPRA</div>
      <h2>É necessidade<br />ou vontade?</h2>
      <p>O que pode esperar para abrir espaço para o que realmente importa?</p>
      <button class="text-button" @click="page = 'budgets'">
        Revisar meu planejamento <ChevronRight :size="16" />
      </button>
    </section>
  </div>
  <div class="stats-grid">
    <div class="card stat">
      <span class="stat-icon green"><ArrowDownRight :size="20" /></span
      ><span>Entradas do mês</span><strong>{{ money(summary.income) }}</strong
      ><small>Recebidas + previstas · dinheiro</small>
    </div>
    <div class="card stat">
      <span class="stat-icon coral"><ArrowUpRight :size="20" /></span
      ><span>Saídas do mês</span><strong>{{ money(summary.expense) }}</strong
      ><small>Pagas + previstas · dinheiro</small>
    </div>
    <div class="card stat">
      <span class="stat-icon lavender"><Wallet :size="20" /></span
      ><span>Saldo em dinheiro hoje</span
      ><strong>{{ money(cashBalance) }}</strong
      ><small>Saldo inicial + registros efetivados</small>
    </div>
    <div class="card stat">
      <span class="stat-icon gold"><Leaf :size="20" /></span
      ><span>Benefício alimentação</span
      ><strong>{{ money(benefitBalance) }}</strong
      ><small>Separado do dinheiro livre</small>
    </div>
  </div>
  <div class="two-col">
    <section class="card">
      <div class="section-heading">
        <div>
          <h2>Últimas movimentações</h2>
          <p>Um olhar sobre {{ monthLabel }}.</p>
        </div>
        <button class="text-button" @click="page = 'entries'">
          Ver todas <ChevronRight :size="16" />
        </button>
      </div>
      <div v-if="!latest.length" class="empty">
        <ArrowLeftRight />
        <h3>Seu primeiro registro faz diferença.</h3>
        <p>Comece pelo salário líquido recebido, depois pelas contas.</p>
        <button class="secondary" @click="open('entries')">
          Adicionar lançamento
        </button>
      </div>
      <div v-for="e in latest" :key="e.id" class="transaction-row">
        <span
          :class="[
            'transaction-icon',
            e.kind === 'income' ? 'green' : 'neutral',
          ]"
          ><component
            :is="e.kind === 'income' ? ArrowDownRight : ArrowUpRight"
            :size="18"
        /></span>
        <div>
          <b>{{ e.description }}</b
          ><small>{{ e.category }} · {{ accountName(e.account) }}</small>
        </div>
        <div class="amount">
          <b :class="{ 'text-green': e.kind === 'income' }"
            >{{ e.kind === "income" ? "+" : "−" }} {{ money(e.amount) }}</b
          ><small
            >{{ e.paid ? "Efetivado" : "Previsto" }} · {{ e.date.slice(8) }}/{{
              e.date.slice(5, 7)
            }}</small
          >
        </div>
      </div>
    </section>
    <section class="card">
      <div class="section-heading">
        <div>
          <h2>Para onde está indo?</h2>
          <p>Despesas em dinheiro por categoria.</p>
        </div>
        <span class="icon-tile neutral"><TrendingUp :size="20" /></span>
      </div>
      <div v-if="!categoryTotals.length" class="empty compact">
        <p>As categorias aparecem após seu primeiro lançamento de despesa.</p>
      </div>
      <div
        v-for="(c, i) in categoryTotals.slice(0, 5)"
        :key="c.name"
        class="category"
      >
        <div>
          <span>{{ c.name }}</span
          ><b>{{ money(c.value) }}</b>
        </div>
        <div class="track">
          <span
            :style="{
              width: percent(c.value, summary.expense) + '%',
              background: [
                '#246c5c',
                '#7c9b6a',
                '#c3aa78',
                '#a298b6',
                '#a8b9af',
              ][i],
            }"
          ></span>
        </div>
      </div>
      <div class="subtle-note">
        {{ money(summary.pending) }} em contas ainda não efetivadas no mês.
      </div>
    </section>
  </div>
  <div class="two-col lower">
    <section class="card dream-callout">
      <span class="icon-tile lavender"><Heart /></span>
      <div>
        <h2>O futuro também entra no plano.</h2>
        <p>Uma reserva para a família, a chegada da filha, um novo começo.</p>
      </div>
      <button class="secondary" @click="page = 'goals'">
        Ver metas <ArrowUpRight :size="17" />
      </button>
    </section>
    <section class="card debt-callout">
      <div>
        <p>Saldo de dívidas informado</p>
        <h2>{{ money(summary.debt_total) }}</h2>
      </div>
      <button class="text-button" @click="page = 'debts'">
        Organizar dívidas <ArrowUpRight :size="17" />
      </button>
    </section>
  </div>
  <div class="footnote">
    <ShieldCheck :size="15" /> Os indicadores dependem dos registros do círculo.
    Não representam o saldo consultado no banco.
  </div>
</template>
