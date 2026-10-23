import { ref, computed, watch } from "vue";
import type { CircleState } from "./useCircles";
import type { Feedback } from "./useFeedback";
import type { createFinanceService } from "../services/finance.service";
import type { createCircleService } from "../services/circle.service";
import type {
  Account,
  Entry,
  Debt,
  Goal,
  Budget,
  Resource,
  RecordEntity,
} from "../types/finance";
import { emptyOverview } from "../types/finance";
import { today, errorMessage } from "../utils/format";
import { downloadJson } from "../services/export.service";
export function useFinance(
  service: ReturnType<typeof createFinanceService>,
  circleService: ReturnType<typeof createCircleService>,
  circles: CircleState,
  feedback: Feedback,
) {
  const accounts = ref<Account[]>([]),
    entries = ref<Entry[]>([]),
    debts = ref<Debt[]>([]),
    goals = ref<Goal[]>([]),
    budgets = ref<Budget[]>([]);
  const summary = ref(emptyOverview()),
    month = ref(today().slice(0, 7)),
    loading = ref(false),
    loaded = ref(false);
  let generation = 0;
  function clear() {
    generation++;
    accounts.value = [];
    entries.value = [];
    debts.value = [];
    goals.value = [];
    budgets.value = [];
    summary.value = emptyOverview();
    circles.members.value = [];
    loaded.value = false;
    loading.value = false;
  }
  async function load() {
    const id = circles.circleId.value;
    if (!id) return;
    const version = ++generation;
    loading.value = true;
    loaded.value = false;
    feedback.error.value = "";
    try {
      const [a, e, d, g, b, m, s] = await Promise.all([
        service.list(id, "accounts"),
        service.list(id, "entries"),
        service.list(id, "debts"),
        service.list(id, "goals"),
        service.list(id, "budgets"),
        circleService.members(id),
        service.overview(id, month.value),
      ]);
      if (version !== generation || id !== circles.circleId.value) return;
      accounts.value = a;
      entries.value = e;
      debts.value = d;
      goals.value = g;
      budgets.value = b;
      circles.members.value = m;
      summary.value = s;
      loaded.value = true;
    } catch (error) {
      if (version === generation) {
        clear();
        feedback.error.value = errorMessage(error);
      }
    } finally {
      if (version === generation) loading.value = false;
    }
  }
  watch([circles.circleId, month], () => {
    clear();
    circles.invite.value = "";
    if (circles.circleId.value && month.value) void load();
  });
  const monthEntries = computed(() =>
    entries.value.filter((e) => e.date.startsWith(month.value)),
  );
  const monthLabel = computed(() =>
    month.value
      ? new Date(month.value + "-02T12:00:00").toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      : "Selecione um mês",
  );
  const currentBudgets = computed(() =>
    budgets.value.filter((b) => b.month.startsWith(month.value)),
  );
  function spent(category: string) {
    return monthEntries.value
      .filter((e) => e.kind === "expense" && e.category === category)
      .reduce((s, e) => s + Number(e.amount), 0);
  }
  function accountName(id: number) {
    return accounts.value.find((a) => a.id === id)?.name || "Conta";
  }
  async function remove(type: Resource, row: RecordEntity) {
    const name =
      "description" in row
        ? row.description
        : "name" in row
          ? row.name
          : row.category;
    if (!confirm(`Excluir “${name}”? Essa ação não pode ser desfeita.`)) return;
    const id = circles.circleId.value;
    await feedback.run(async () => {
      await service.remove(id, type, row.id);
      await load();
    });
  }
  async function togglePaid(entry: Entry) {
    const id = circles.circleId.value;
    await feedback.run(async () => {
      await service.setPaid(id, entry.id, !entry.paid);
      await load();
    });
  }
  function exportData() {
    downloadJson({
      exported_at: new Date().toISOString(),
      circle: circles.circle.value,
      accounts: accounts.value,
      entries: entries.value,
      debts: debts.value,
      goals: goals.value,
      budgets: budgets.value,
    });
  }
  return {
    accounts,
    entries,
    debts,
    goals,
    budgets,
    summary,
    month,
    monthEntries,
    monthLabel,
    currentBudgets,
    loading,
    loaded,
    load,
    clear,
    spent,
    accountName,
    remove,
    togglePaid,
    exportData,
  };
}
export type FinanceState = ReturnType<typeof useFinance>;
