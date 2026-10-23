<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { X } from "lucide-vue-next";

defineProps<{ title: string; busy?: boolean }>();
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
let previous: HTMLElement | null = null;
onMounted(async () => {
  previous = document.activeElement as HTMLElement;
  await nextTick();
  panel.value?.querySelector<HTMLElement>("input,select,button")?.focus();
});
onUnmounted(() => previous?.focus());
function trap(event: KeyboardEvent) {
  if (event.key !== "Tab") return;
  const fields = Array.from(
    panel.value?.querySelectorAll<HTMLElement>(
      "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])",
    ) ?? [],
  );
  const first = fields[0],
    last = fields.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
</script>
<template>
  <Teleport to="body"
    ><div
      class="modal-backdrop"
      @click.self="!busy && emit('close')"
      @keydown.esc="!busy && emit('close')"
    >
      <section
        ref="panel"
        class="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        @keydown="trap"
      >
        <div class="section-heading">
          <div>
            <div class="eyebrow">UM REGISTRO, MAIS CLAREZA</div>
            <h2 id="modal-title">{{ title }}</h2>
          </div>
          <button
            class="icon"
            :disabled="busy"
            aria-label="Fechar formulário"
            @click="emit('close')"
          >
            <X />
          </button>
        </div>
        <slot />
      </section></div
  ></Teleport>
</template>
