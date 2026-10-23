<script setup lang="ts">
import { X, WifiOff } from "lucide-vue-next";
import { useApplication } from "@/app/context";

const app = useApplication();
const { error, notice } = app.feedback;
const { online, needRefresh, updateServiceWorker } = app.pwa;
</script>
<template>
  <div v-if="!online" class="alert">
    <WifiOff :size="18" /> Sem conexão. Alterações precisam de internet; dados
    financeiros não ficam salvos no cache offline.
  </div>
  <div v-if="needRefresh" class="alert">
    Uma atualização está disponível. Salve o que estiver preenchendo antes de
    atualizar.<button @click="updateServiceWorker()">Atualizar</button>
  </div>
  <div v-if="error" role="alert" class="alert danger">
    {{ error
    }}<button class="icon" @click="error = ''" aria-label="Fechar aviso">
      <X :size="16" />
    </button>
  </div>
  <div v-if="notice" role="status" class="alert success">
    {{ notice
    }}<button class="icon" @click="notice = ''" aria-label="Fechar aviso">
      <X :size="16" />
    </button>
  </div>
</template>
