import { ref } from "vue";
import { errorMessage } from "../utils/format";
export function useFeedback() {
  const busy = ref(false),
    error = ref(""),
    notice = ref("");
  async function run(action: () => Promise<void>) {
    if (busy.value) return;
    busy.value = true;
    error.value = "";
    notice.value = "";
    try {
      await action();
    } catch (e) {
      error.value = errorMessage(e);
    } finally {
      busy.value = false;
    }
  }
  return { busy, error, notice, run };
}
export type Feedback = ReturnType<typeof useFeedback>;
