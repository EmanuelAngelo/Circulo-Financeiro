import type { Money } from "../types/finance";
export const money = (value: Money | null | undefined) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const percent = (a: Money, b: Money) =>
  Math.min(100, Math.max(0, (Number(a) / Number(b || 1)) * 100));
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Falha de conexão. Tente novamente.";
