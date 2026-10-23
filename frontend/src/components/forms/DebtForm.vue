<script setup lang="ts">
import type { Draft, Debt } from "@/types/finance";

const form = defineModel<Draft<Debt>>({ required: true });
</script>
<template>
  <label
    >Nome da dívida<input
      v-model="form.name"
      required
      maxlength="100"
      placeholder="Ex.: Empréstimo pessoal"
  /></label>
  <div class="form-grid">
    <label
      >Saldo devedor atual (R$)<input
        v-model="form.balance"
        required
        type="number"
        min="0"
        step="0.01" /></label
    ><label
      >Parcela (R$)<input
        v-model="form.installment"
        required
        type="number"
        min="0"
        step="0.01" /></label
    ><label
      >Juros mensais (%) · opcional<input
        v-model="form.monthly_rate"
        type="number"
        min="0"
        max="100"
        step="0.01"
        placeholder="Deixe vazio se não souber" /></label
    ><label
      >Prioridade<select v-model="form.priority">
        <option value="normal">Normal</option>
        <option value="urgent">Urgente</option>
      </select></label
    >
  </div>
  <label class="checkbox"
    ><input type="checkbox" v-model="form.payroll" /> Já é descontada em
    folha</label
  ><label
    >Próximo passo / negociação<textarea
      v-model="form.note"
      maxlength="500"
      placeholder="Ex.: solicitar saldo de quitação ao banco"
    ></textarea>
  </label>
  <p class="hint">
    Este cadastro não cria parcelas nem desconta dinheiro das contas. Atualize o
    saldo devedor manualmente.
  </p>
</template>
