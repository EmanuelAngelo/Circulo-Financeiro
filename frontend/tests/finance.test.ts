import { describe, it, expect, vi } from "vitest";
import { effectScope, ref, nextTick } from "vue";
import { useFinance } from "../src/composables/useFinance";
import { useCircles } from "../src/composables/useCircles";
import { useFeedback } from "../src/composables/useFeedback";
import { useRecordEditor } from "../src/composables/useRecordEditor";
import { useEntryFilters } from "../src/composables/useEntryFilters";
import { useDebtPriorities } from "../src/composables/useDebtPriorities";
import { createHttpClient } from "../src/services/http";
import { createFinanceService } from "../src/services/finance.service";
import { createCircleService } from "../src/services/circle.service";
import { emptyOverview, type Entry, type Debt } from "../src/types/finance";
import { flushPromises } from "@vue/test-utils";
function fixture() {
  const http = createHttpClient(),
    service = createFinanceService(http),
    circleService = createCircleService(http),
    feedback = useFeedback();
  const circles = useCircles(circleService);
  circles.circleId.value = "1";
  const finance = useFinance(service, circleService, circles, feedback);
  return { http, service, circleService, feedback, circles, finance };
}
describe("scope and record lifecycle", () => {
  it("ignores a delayed response from the previously selected circle", async () => {
    const scope = effectScope();
    const state = scope.run(fixture)!;
    let release: (value: ReturnType<typeof emptyOverview>) => void = () => {};
    vi.spyOn(state.service, "list").mockResolvedValue([]);
    vi.spyOn(state.circleService, "members").mockResolvedValue([]);
    vi.spyOn(state.service, "overview").mockImplementation((id) =>
      id === "1"
        ? new Promise((resolve) => {
            release = resolve;
          })
        : Promise.resolve({ ...emptyOverview(), income: "222" }),
    );
    const old = state.finance.load();
    state.circles.circleId.value = "2";
    await nextTick();
    await flushPromises();
    expect(state.finance.summary.value.income).toBe("222");
    release({ ...emptyOverview(), income: "111" });
    await old;
    expect(state.finance.summary.value.income).toBe("222");
    scope.stop();
  });
  it("invalidates responses and clears private state on reset", async () => {
    const scope = effectScope();
    const state = scope.run(fixture)!;
    let release: (value: ReturnType<typeof emptyOverview>) => void = () => {};
    vi.spyOn(state.service, "list").mockResolvedValue([]);
    vi.spyOn(state.circleService, "members").mockResolvedValue([]);
    vi.spyOn(state.service, "overview").mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const pending = state.finance.load();
    state.finance.clear();
    release({ ...emptyOverview(), income: "999" });
    await pending;
    expect(state.finance.summary.value.income).toBe(0);
    expect(state.finance.loaded.value).toBe(false);
    scope.stop();
  });
  it("edits a copy and closes the editor when changing circles", async () => {
    const scope = effectScope();
    const state = scope.run(fixture)!;
    vi.spyOn(state.service, "list").mockResolvedValue([]);
    vi.spyOn(state.circleService, "members").mockResolvedValue([]);
    vi.spyOn(state.service, "overview").mockResolvedValue(emptyOverview());
    const editor = scope.run(() =>
      useRecordEditor(
        state.service,
        state.finance,
        state.circles,
        state.feedback,
      ),
    )!;
    const row = { id: 1, name: "Reserva", target: "500", saved: "0" };
    editor.open("goals", row);
    if (editor.state.value?.type === "goals")
      editor.state.value.data.name = "Outro nome";
    expect(row.name).toBe("Reserva");
    state.circles.circleId.value = "2";
    await nextTick();
    expect(editor.state.value).toBeNull();
    await flushPromises();
    scope.stop();
  });
  it("does not show a success state after a failed request", async () => {
    const scope = effectScope();
    const state = scope.run(fixture)!;
    const editor = scope.run(() =>
      useRecordEditor(
        state.service,
        state.finance,
        state.circles,
        state.feedback,
      ),
    )!;
    vi.spyOn(state.service, "save").mockRejectedValue(
      new Error("Sem permissão"),
    );
    editor.open("goals");
    await editor.save();
    expect(editor.state.value?.type).toBe("goals");
    expect(state.feedback.error.value).toBe("Sem permissão");
    expect(state.feedback.notice.value).toBe("");
    scope.stop();
  });
});
describe("view-specific derived state", () => {
  it("filters and orders entries without mutating the source", () => {
    const common = {
      account: 1,
      kind: "expense" as const,
      category: "Outros",
      amount: "10",
      paid: false,
      essential: false,
      note: "",
    };
    const rows = ref<Entry[]>([
      { ...common, id: 1, date: "2026-10-01", description: "Mercado" },
      {
        ...common,
        id: 2,
        date: "2026-10-02",
        description: "Salário",
        kind: "income",
      },
    ]);
    const filters = useEntryFilters(rows);
    filters.search.value = "MER";
    expect(filters.filtered.value.map((e) => e.id)).toEqual([1]);
    filters.search.value = "";
    filters.kindFilter.value = "income";
    expect(filters.filtered.value.map((e) => e.id)).toEqual([2]);
    expect(rows.value[0].id).toBe(1);
  });
  it("prioritizes urgent debt and treats unknown rates explicitly", () => {
    const common = {
      installment: "10",
      payroll: false,
      note: "",
      priority: "normal" as const,
    };
    const rows = ref<Debt[]>([
      { ...common, id: 1, name: "A", balance: "100", monthly_rate: null },
      { ...common, id: 2, name: "B", balance: "500", monthly_rate: "5" },
      {
        ...common,
        id: 3,
        name: "C",
        balance: "1000",
        monthly_rate: "1",
        priority: "urgent",
      },
    ]);
    const { debtOrder, strategy } = useDebtPriorities(rows);
    expect(debtOrder.value.map((d) => d.id)).toEqual([3, 2, 1]);
    strategy.value = "balance";
    expect(debtOrder.value.map((d) => d.id)).toEqual([3, 1, 2]);
  });
});

// A logout must also invalidate a still-pending list of circles.
it("does not restore circles after their state has been cleared", async () => {
  const scope = effectScope();
  const state = scope.run(fixture)!;
  let release: (
    value: import("../src/types/finance").Circle[],
  ) => void = () => {};
  vi.spyOn(state.circleService, "list").mockImplementation(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const pending = state.circles.refresh();
  state.circles.clear();
  release([{ id: 1, name: "Anterior", owner_id: 1 }]);
  await pending;
  expect(state.circles.circles.value).toEqual([]);
  expect(state.circles.circleId.value).toBe("");
  scope.stop();
});
