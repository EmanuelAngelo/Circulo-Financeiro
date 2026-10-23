import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  SlidersHorizontal,
  Target,
  Users,
} from "lucide-vue-next";
import type { Page } from "../types/finance";
export const nav = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "entries", label: "Lançamentos", icon: ArrowLeftRight },
  { id: "debts", label: "Minhas dívidas", icon: Wallet },
  { id: "budgets", label: "Planejamento", icon: SlidersHorizontal },
  { id: "goals", label: "Nossos sonhos", icon: Target },
  { id: "circle", label: "Meu círculo", icon: Users },
] satisfies Array<{ id: Page; label: string; icon: unknown }>;
