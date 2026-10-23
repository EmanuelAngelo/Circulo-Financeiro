export type Money = string | number;
export type Resource = "accounts" | "entries" | "debts" | "goals" | "budgets";
export type Page =
  | "overview"
  | "entries"
  | "debts"
  | "goals"
  | "budgets"
  | "circle";
export interface User {
  id: number;
  name: string;
  username: string;
}
export interface Credentials {
  name: string;
  username: string;
  password: string;
}
export interface Circle {
  id: number;
  name: string;
  owner_id: number;
}
export interface Member {
  user_id: number;
  user__first_name: string;
  user__username: string;
}
export interface Account {
  id: number;
  name: string;
  kind: "cash" | "benefit";
  opening_balance: Money;
}
export interface Entry {
  id: number;
  account: number;
  description: string;
  amount: Money;
  kind: "income" | "expense";
  category: string;
  date: string;
  paid: boolean;
  essential: boolean;
  note: string;
  author_name?: string;
}
export interface Debt {
  id: number;
  name: string;
  balance: Money;
  installment: Money;
  monthly_rate: Money | null;
  payroll: boolean;
  priority: "normal" | "urgent";
  note: string;
}
export interface Goal {
  id: number;
  name: string;
  target: Money;
  saved: Money;
}
export interface Budget {
  id: number;
  category: string;
  month: string;
  limit: Money;
}
export interface AccountBalance {
  id: number;
  name: string;
  kind: Account["kind"];
  balance: Money;
}
export interface Overview {
  income: Money;
  expense: Money;
  result: Money;
  pending: Money;
  benefit_income: Money;
  benefit_expense: Money;
  debt_total: Money;
  accounts: AccountBalance[];
}
export interface ResourceMap {
  accounts: Account;
  entries: Entry;
  debts: Debt;
  goals: Goal;
  budgets: Budget;
}
export type RecordEntity = ResourceMap[Resource];
export type Draft<T> = Omit<T, "id"> & { id?: number };
export type EditorState = {
  [K in Resource]: { type: K; circleId: string; data: Draft<ResourceMap[K]> };
}[Resource];
export const emptyOverview = (): Overview => ({
  income: 0,
  expense: 0,
  result: 0,
  pending: 0,
  benefit_income: 0,
  benefit_expense: 0,
  debt_total: 0,
  accounts: [],
});
