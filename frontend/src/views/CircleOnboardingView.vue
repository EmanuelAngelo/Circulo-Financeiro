<script setup lang="ts">
import { useApplication } from "@/app/context";
import CircleCreateForm from "@/components/forms/CircleCreateForm.vue";
import CircleJoinForm from "@/components/forms/CircleJoinForm.vue";
import { useCircleActions } from "@/composables/useCircleActions";

const app = useApplication();
const { busy } = app.feedback;
const { createCircle, joinCircle } = useCircleActions();
</script>
<template>
  <div class="welcome card">
    <div class="eyebrow">O PRIMEIRO PASSO</div>
    <h1>Dinheiro é melhor<br />quando existe um plano.</h1>
    <p>
      Crie um círculo para sua família ou entre com o código de alguém.<br />Todos
      os membros poderão ver e editar os dados desse círculo.
    </p>
    <CircleCreateForm :busy="busy" @submit="createCircle" />
    <CircleJoinForm :busy="busy" @submit="joinCircle" />
  </div>
</template>
