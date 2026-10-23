<script setup lang="ts">
import {
  Wallet,
  Users,
  Plus,
  X,
  Trash2,
  Pencil,
  Leaf,
  Download,
  Copy,
} from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { money } from "@/utils/format";
import CircleCreateForm from "@/components/forms/CircleCreateForm.vue";
import CircleJoinForm from "@/components/forms/CircleJoinForm.vue";
import { useCircleActions } from "@/composables/useCircleActions";

const app = useApplication();
const { user } = app.auth;
const { accounts, summary, remove, exportData } = app.finance;
const { circle, members, invite } = app.circles;
const { busy } = app.feedback;
const { open } = app.editor;
const { createCircle, joinCircle, inviteMember, copyInvite, removeMember } =
  useCircleActions();
</script>
<template>
  <div class="two-col">
    <section class="card">
      <div class="section-heading">
        <div>
          <h2>{{ circle?.name }}</h2>
          <p>Todos aqui podem ver e editar as finanças do círculo.</p>
        </div>
        <Users />
      </div>
      <div class="member-row" v-for="m in members" :key="m.user_id">
        <span class="avatar">{{ m.user__first_name[0] }}</span>
        <div>
          <b>{{ m.user__first_name }}</b
          ><small
            >{{ m.user_id === circle?.owner_id ? "Responsável" : "Membro" }} ·
            {{ m.user__username }}</small
          >
        </div>
        <button
          v-if="user?.id === circle?.owner_id && m.user_id !== user?.id"
          class="icon"
          @click="removeMember(m)"
          :disabled="busy"
          aria-label="Remover membro"
        >
          <X :size="17" />
        </button>
      </div>
      <button
        v-if="user?.id === circle?.owner_id"
        class="secondary full"
        @click="inviteMember"
        :disabled="busy"
      >
        Gerar convite <Plus :size="17" />
      </button>
      <div v-if="invite" class="invite">
        <p>
          Envie este código a uma pessoa de confiança. Uso único, válido por 7
          dias.
        </p>
        <code>{{ invite }}</code
        ><button class="text-button" @click="copyInvite">
          <Copy :size="16" /> Copiar código
        </button>
      </div>
    </section>
    <section class="card">
      <div class="section-heading">
        <div>
          <h2>Contas e benefícios</h2>
          <p>Saldos atuais pelos registros efetivados.</p>
        </div>
        <button
          class="icon"
          @click="open('accounts')"
          aria-label="Adicionar conta"
        >
          <Plus />
        </button>
      </div>
      <div v-for="a in accounts" :key="a.id" class="account-row">
        <span class="icon-tile neutral"
          ><component :is="a.kind === 'benefit' ? Leaf : Wallet" :size="19"
        /></span>
        <div>
          <b>{{ a.name }}</b
          ><small
            >{{ a.kind === "benefit" ? "Benefício restrito" : "Dinheiro" }}
            ·
            {{
              money(summary.accounts?.find((x) => x.id === a.id)?.balance)
            }}</small
          >
        </div>
        <div class="row-actions">
          <button
            class="icon"
            @click="open('accounts', a)"
            aria-label="Editar conta"
          >
            <Pencil :size="16" /></button
          ><button
            class="icon"
            @click="remove('accounts', a)"
            :disabled="busy"
            aria-label="Excluir conta"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
      <p class="hint">
        Saldo inicial é o saldo imediatamente anterior ao seu primeiro
        lançamento. Não inclua o mesmo dinheiro no saldo inicial e como entrada.
      </p>
    </section>
  </div>
  <div class="two-col">
    <section class="card">
      <h2>Outro círculo</h2>
      <p>Separe grupos e objetivos sem misturar os dados.</p>
      <CircleCreateForm :busy="busy" @submit="createCircle" />
    </section>
    <section class="card">
      <h2>Recebeu um convite?</h2>
      <CircleJoinForm :busy="busy" @submit="joinCircle" />
    </section>
  </div>
  <section class="card guidance">
    <h2>Seus dados, disponíveis para você.</h2>
    <p>
      Exporte os registros do círculo em JSON. O arquivo contém dados
      financeiros: guarde em local seguro. A importação desse arquivo ainda não
      faz parte desta versão.
    </p>
    <button class="secondary" @click="exportData">
      <Download :size="17" /> Exportar círculo
    </button>
  </section>
</template>
