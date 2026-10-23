<script setup lang="ts">
import { ref } from "vue";

defineProps<{ busy: boolean }>();
const emit = defineEmits<{ submit: [name: string] }>();
const name = ref("");
function submit() {
  emit("submit", name.value);
}
</script>
<template>
  <form @submit.prevent="submit" class="inline-form">
    <input
      v-model="name"
      required
      maxlength="80"
      placeholder="Nome do novo círculo"
      aria-label="Nome do círculo"
    /><button class="secondary" :disabled="busy">Criar círculo</button>
  </form>
</template>
