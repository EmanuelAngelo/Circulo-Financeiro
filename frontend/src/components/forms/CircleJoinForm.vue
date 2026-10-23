<script setup lang="ts">
import { ref } from "vue";

defineProps<{ busy: boolean }>();
const emit = defineEmits<{ submit: [token: string] }>();
const token = ref("");
</script>
<template>
  <form @submit.prevent="emit('submit', token.trim())" class="inline-form">
    <input
      v-model="token"
      required
      placeholder="Cole o código recebido"
      aria-label="Código do convite"
    /><button class="secondary" :disabled="busy">Participar</button>
  </form>
</template>
