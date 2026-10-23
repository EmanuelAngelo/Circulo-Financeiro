<script setup lang="ts">
import { computed } from "vue";
import { Check } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import BaseModal from "@/components/common/BaseModal.vue";
import EntryForm from "@/components/forms/EntryForm.vue";
import DebtForm from "@/components/forms/DebtForm.vue";
import GoalForm from "@/components/forms/GoalForm.vue";
import AccountForm from "@/components/forms/AccountForm.vue";
import BudgetForm from "@/components/forms/BudgetForm.vue";

const { editor, finance, feedback, pwa } = useApplication();
const { state, save, close } = editor;
const { accounts, monthLabel } = finance;
const { busy, error } = feedback;
const { online } = pwa;
const labels = {
  entries: "lançamento",
  debts: "dívida",
  goals: "meta",
  accounts: "conta",
  budgets: "limite",
};
const title = computed(() =>
  state.value
    ? `${state.value.data.id ? "Editar" : "Adicionar"} ${labels[state.value.type]}`
    : "",
);
</script>
<template>
  <BaseModal v-if="state" :title="title" :busy="busy" @close="close"
    ><form @submit.prevent="save">
      <EntryForm
        v-if="state.type === 'entries'"
        v-model="state.data"
        :accounts="accounts"
      />
      <DebtForm v-else-if="state.type === 'debts'" v-model="state.data" />
      <GoalForm v-else-if="state.type === 'goals'" v-model="state.data" />
      <AccountForm v-else-if="state.type === 'accounts'" v-model="state.data" />
      <BudgetForm
        v-else-if="state.type === 'budgets'"
        v-model="state.data"
        :month-label="monthLabel"
      />
      <div v-if="error" class="alert danger" role="alert">{{ error }}</div>
      <div class="modal-footer">
        <button type="button" class="secondary" :disabled="busy" @click="close">
          Cancelar</button
        ><button class="primary" :disabled="busy || !online">
          {{ busy ? "Salvando…" : "Salvar" }} <Check :size="18" />
        </button>
      </div></form
  ></BaseModal>
</template>
