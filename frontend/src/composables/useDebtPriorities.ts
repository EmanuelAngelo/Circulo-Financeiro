import { computed, ref, type Ref } from "vue";
import type { Debt } from "../types/finance";
export function useDebtPriorities(debts: Ref<Debt[]>) {
  const strategy = ref("rate");
  const debtOrder = computed(() =>
    [...debts.value]
      .filter((d) => Number(d.balance) > 0)
      .sort((a, b) =>
        a.priority !== b.priority
          ? a.priority === "urgent"
            ? -1
            : 1
          : strategy.value === "balance"
            ? Number(a.balance) - Number(b.balance)
            : (b.monthly_rate === null ? -1 : Number(b.monthly_rate)) -
              (a.monthly_rate === null ? -1 : Number(a.monthly_rate)),
      ),
  );
  return { strategy, debtOrder };
}
