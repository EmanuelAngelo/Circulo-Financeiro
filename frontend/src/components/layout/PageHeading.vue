<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { useApplication } from "@/app/context";
import { usePageNavigation } from "@/composables/usePageNavigation";

const app = useApplication();
const { user } = app.auth;
const { loading } = app.finance;
const { circle } = app.circles;
const { busy } = app.feedback;
const { online } = app.pwa;
const { page, nav } = usePageNavigation();
function openPrimary() {
  const target = page.value;
  if (target !== "circle")
    app.editor.open(target === "overview" ? "entries" : target);
}
</script>
<template>
  <div class="page-heading">
    <div>
      <div class="eyebrow">
        {{
          page === "overview"
            ? "UM PASSO MAIS PERTO DO EQUILÍBRIO"
            : circle?.name
        }}
      </div>
      <h1>
        {{
          page === "overview"
            ? `Seu dinheiro, com clareza.`
            : nav.find((n) => n.id === page)?.label
        }}
      </h1>
      <p>
        {{
          page === "overview"
            ? `Olá, ${user?.name.split(" ")[0]}. Vamos cuidar do presente e dos próximos planos?`
            : page === "debts"
              ? "Troque a preocupação por um plano possível."
              : page === "entries"
                ? "Cada registro ajuda a entender para onde o dinheiro vai."
                : page === "goals"
                  ? "Transforme o que importa em uma conquista."
                  : page === "budgets"
                    ? "Defina limites que fazem sentido para a sua realidade."
                    : "Um espaço de confiança para construir juntos."
        }}
      </p>
    </div>
    <button
      v-if="page !== 'circle'"
      class="primary"
      :disabled="busy || loading || !online"
      @click="openPrimary()"
    >
      <Plus :size="18" />{{
        page === "debts"
          ? "Nova dívida"
          : page === "goals"
            ? "Nova meta"
            : page === "budgets"
              ? "Novo limite"
              : "Novo lançamento"
      }}
    </button>
  </div>
</template>
