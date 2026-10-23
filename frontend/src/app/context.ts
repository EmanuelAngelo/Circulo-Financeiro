import { inject, type InjectionKey } from "vue";
import type { createApplication } from "./createApplication";
export type Application = ReturnType<typeof createApplication>;
export const applicationKey: InjectionKey<Application> = Symbol(
  "circulo-application",
);
export function useApplication() {
  const app = inject(applicationKey);
  if (!app) throw new Error("Application provider not found");
  return app;
}
