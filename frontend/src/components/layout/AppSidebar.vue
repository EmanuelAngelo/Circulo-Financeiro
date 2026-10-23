<script setup lang="ts">
import {
  CircleDot,
  ChevronRight,
  LogOut,
  X,
  Leaf,
  Download,
} from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { usePageNavigation } from "@/composables/usePageNavigation";

const app = useApplication();
const { user } = app.auth;
const { loading } = app.finance;
const { circles, circleId } = app.circles;
const { busy } = app.feedback;
const { install } = app.pwa;
const { page, nav } = usePageNavigation();
const mobile = defineModel<boolean>({ required: true });
const logout = () => app.feedback.run(app.auth.signOut);
</script>
<template>
  <aside :class="['sidebar', { shown: mobile }]">
    <div class="brand">
      <CircleDot :size="31" /> círculo<span>FINANCEIRO</span>
    </div>
    <button
      class="close-menu icon"
      @click="mobile = false"
      aria-label="Fechar menu"
    >
      <X />
    </button>
    <div class="circle-switch">
      <label>SEU ESPAÇO COMPARTILHADO</label
      ><select v-model="circleId" :disabled="loading">
        <option v-if="!circles.length" value="">Crie seu círculo</option>
        <option v-for="c in circles" :key="c.id" :value="String(c.id)">
          {{ c.name }}
        </option>
      </select>
    </div>
    <nav>
      <button
        v-for="n in nav"
        :key="n.id"
        :class="{ active: page === n.id }"
        @click="
          page = n.id;
          mobile = false;
        "
      >
        <component :is="n.icon" :size="20" />{{ n.label
        }}<ChevronRight v-if="page === n.id" :size="15" class="ml-auto" />
      </button>
    </nav>
    <div class="sidebar-note">
      <Leaf :size="25" /><strong>Progresso, não perfeição.</strong>
      <p>Pequenas escolhas hoje.<br />Mais tranquilidade amanhã.</p>
    </div>
    <button class="install" @click="install">
      <Download :size="17" /> Instalar aplicativo
    </button>
    <div class="profile">
      <span class="avatar">{{ user?.name?.[0]?.toUpperCase() }}</span>
      <div>
        <b>{{ user?.name }}</b
        ><small>Vamos juntos.</small>
      </div>
      <button class="icon" @click="logout" :disabled="busy" aria-label="Sair">
        <LogOut :size="18" />
      </button>
    </div>
  </aside>
</template>
