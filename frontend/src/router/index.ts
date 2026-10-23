import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "overview",
    component: () => import("../views/OverviewView.vue"),
  },
  {
    path: "/lancamentos",
    name: "entries",
    component: () => import("../views/EntriesView.vue"),
  },
  {
    path: "/dividas",
    name: "debts",
    component: () => import("../views/DebtsView.vue"),
  },
  {
    path: "/planejamento",
    name: "budgets",
    component: () => import("../views/BudgetsView.vue"),
  },
  {
    path: "/metas",
    name: "goals",
    component: () => import("../views/GoalsView.vue"),
  },
  {
    path: "/circulo",
    name: "circle",
    component: () => import("../views/CircleView.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];
export const router = createRouter({ history: createWebHashHistory(), routes });
