import { ref, onMounted, onUnmounted } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";
import type { Feedback } from "./useFeedback";
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}
export function usePwa(feedback: Feedback) {
  const online = ref(navigator.onLine),
    installPrompt = ref<InstallEvent | null>(null);
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const connection = () => (online.value = navigator.onLine);
  function onInstall(event: Event) {
    event.preventDefault();
    installPrompt.value = event as InstallEvent;
  }
  async function install() {
    if (installPrompt.value) {
      await installPrompt.value.prompt();
      installPrompt.value = null;
    } else
      feedback.notice.value =
        "No navegador, procure “Instalar aplicativo”. No Safari do iPhone/iPad: Compartilhar → Adicionar à Tela de Início. Requer HTTPS.";
  }
  onMounted(() => {
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    window.addEventListener("beforeinstallprompt", onInstall);
  });
  onUnmounted(() => {
    window.removeEventListener("online", connection);
    window.removeEventListener("offline", connection);
    window.removeEventListener("beforeinstallprompt", onInstall);
  });
  return { online, needRefresh, updateServiceWorker, install };
}
