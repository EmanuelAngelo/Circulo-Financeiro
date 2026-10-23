<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";
import { reactive } from "vue";
import type { Credentials } from "@/types/finance";

defineProps<{
  mode: "login" | "register";
  busy: boolean;
  online: boolean;
  error: string;
}>();
const emit = defineEmits<{ submit: [credentials: Credentials] }>();
const auth = reactive<Credentials>({ name: "", username: "", password: "" });
function submit() {
  emit("submit", { ...auth });
  auth.password = "";
}
</script>
<template>
  <form @submit.prevent="submit">
    <label v-if="mode === 'register'"
      >Seu nome<input
        v-model="auth.name"
        required
        maxlength="80"
        autocomplete="name"
        placeholder="Como podemos te chamar?" /></label
    ><label
      >Usuário<input
        v-model="auth.username"
        required
        autocomplete="username"
        placeholder="seu.usuario" /></label
    ><label
      >Senha<input
        v-model="auth.password"
        type="password"
        required
        :autocomplete="
          mode === 'register' ? 'new-password' : 'current-password'
        "
        :minlength="mode === 'register' ? 8 : 1"
        placeholder="Sua senha"
    /></label>
    <p v-if="mode === 'register'" class="hint">
      Use ao menos 8 caracteres. Evite senhas comuns ou apenas números.
    </p>
    <div v-if="error" role="alert" class="alert danger">{{ error }}</div>
    <button class="primary full" :disabled="busy || !online">
      {{
        busy
          ? "Aguarde…"
          : mode === "register"
            ? "Criar minha conta"
            : "Entrar no meu círculo"
      }}<ArrowUpRight :size="18" />
    </button>
  </form>
</template>
