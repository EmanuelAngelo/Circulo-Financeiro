import { computed } from "vue";
import type { FinanceState } from "./useFinance";
import { categories } from "../constants/categories";
export function useDashboard(finance: FinanceState) {
  const { summary, monthEntries, accounts } = finance;
  const latest = computed(() =>
    [...monthEntries.value]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .slice(0, 5),
  );
  const cashBalance = computed(() =>
    summary.value.accounts
      .filter((a) => a.kind === "cash")
      .reduce((s, a) => s + Number(a.balance), 0),
  );
  const benefitBalance = computed(() =>
    summary.value.accounts
      .filter((a) => a.kind === "benefit")
      .reduce((s, a) => s + Number(a.balance), 0),
  );
  const categoryTotals = computed(() =>
    categories
      .map((name) => ({
        name,
        value: monthEntries.value
          .filter(
            (e) =>
              e.kind === "expense" &&
              e.category === name &&
              accounts.value.find((a) => a.id === e.account)?.kind === "cash",
          )
          .reduce((s, e) => s + Number(e.amount), 0),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value),
  );
  return { latest, cashBalance, benefitBalance, categoryTotals };
}
