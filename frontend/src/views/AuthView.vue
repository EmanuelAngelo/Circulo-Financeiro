<script setup lang="ts">
import {
  CircleDot,
  Target,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Heart,
} from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { ref, computed } from "vue";
import AuthForm from "@/components/forms/AuthForm.vue";
import type { Credentials } from "@/types/finance";

const app = useApplication();
const { busy, error } = app.feedback;
const { online } = app.pwa;
const authMode = ref<"login" | "register">("login");
const authDescription = computed(() =>
  authMode.value === "register"
    ? "Crie sua conta e reúna seu círculo financeiro."
    : "Entre para cuidar dos seus planos.",
);
async function authenticate(credentials: Credentials) {
  await app.feedback.run(() => app.auth.signIn(authMode.value, credentials));
}
</script>
<template>
  <div class="auth-shell">
    <section class="auth-story">
      <div class="brand light">
        <CircleDot :size="34" /> círculo<span>FINANCEIRO</span>
      </div>
      <div>
        <div class="eyebrow">MENOS PESO. MAIS FUTURO.</div>
        <h1>Uma vida mais leve<br />começa em <em>círculo.</em></h1>
        <p>
          Organize o presente. Cuide de quem importa.<br />Construa o próximo
          capítulo, juntos.
        </p>
        <div class="orbit">
          <div class="orb one"><Leaf /></div>
          <div class="orb two"><Heart /></div>
          <div class="orbit-center">
            <TrendingUp :size="48" /><span>Um passo de cada vez.</span>
          </div>
          <div class="orb three"><Target /></div>
        </div>
      </div>
      <small>Seu dinheiro com clareza. Suas escolhas com propósito.</small>
    </section>
    <section class="auth-form">
      <div class="brand mobile-brand"><CircleDot /> círculo</div>
      <div class="eyebrow">BEM-VINDO AO SEU RECOMEÇO</div>
      <h2>
        {{ authMode === "register" ? "Vamos começar?" : "Bom ter você aqui." }}
      </h2>
      <p>{{ authDescription }}</p>
      <AuthForm
        :mode="authMode"
        :busy="busy"
        :online="online"
        :error="error"
        @submit="authenticate"
      />
      <button
        class="text-button auth-switch"
        @click="
          authMode = authMode === 'register' ? 'login' : 'register';
          error = '';
        "
      >
        {{
          authMode === "register"
            ? "Já tenho conta. Entrar"
            : "Primeira vez aqui? Criar conta"
        }}
      </button>
      <div class="privacy">
        <ShieldCheck :size="19" /> Sem conexão bancária ou pedido de senha de
        banco.
      </div>
      <p v-if="!online" class="alert">
        Você está offline. Conecte-se para entrar.
      </p>
    </section>
  </div>
</template>
