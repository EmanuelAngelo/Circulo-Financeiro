import { ref, watch } from "vue";
import type {
  Resource,
  ResourceMap,
  Draft,
  EditorState,
} from "../types/finance";
import type { FinanceState } from "./useFinance";
import type { CircleState } from "./useCircles";
import type { Feedback } from "./useFeedback";
import type { createFinanceService } from "../services/finance.service";
import { today } from "../utils/format";
export function useRecordEditor(
  service: ReturnType<typeof createFinanceService>,
  finance: FinanceState,
  circles: CircleState,
  feedback: Feedback,
) {
  const state = ref<EditorState | null>(null);
  function open<K extends Resource>(type: K, row?: ResourceMap[K]) {
    feedback.error.value = "";
    const defaults: { [P in Resource]: Draft<ResourceMap[P]> } = {
      entries: {
        description: "",
        amount: "",
        kind: "expense",
        account: finance.accounts.value[0]?.id ?? 0,
        category: "Alimentação",
        date: today(),
        paid: true,
        essential: false,
        note: "",
      },
      debts: {
        name: "",
        balance: "",
        installment: "",
        monthly_rate: null,
        payroll: false,
        priority: "normal",
        note: "",
      },
      goals: { name: "", target: "", saved: "0" },
      accounts: { name: "", kind: "cash", opening_balance: "0" },
      budgets: {
        category: "Alimentação",
        month: finance.month.value + "-01",
        limit: "",
      },
    };
    // The resource discriminant and its mapped draft are paired at this boundary.
    state.value = {
      type,
      circleId: circles.circleId.value,
      data: { ...(row ?? defaults[type]) },
    } as EditorState;
  }
  function close() {
    if (!feedback.busy.value) state.value = null;
  }
  watch(circles.circleId, () => {
    state.value = null;
  });
  async function save() {
    const current = state.value;
    if (!current) return;
    if (current.circleId !== circles.circleId.value) {
      state.value = null;
      return;
    }
    if (current.type === "entries") delete current.data.author_name;
    if (current.type === "debts" && current.data.monthly_rate === "")
      current.data.monthly_rate = null;
    await feedback.run(async () => {
      await service.save(current);
      state.value = null;
      await finance.load();
      feedback.notice.value = "Salvo. Mais um passo para organizar a vida.";
    });
  }
  return { state, open, close, save };
}
