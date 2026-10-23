import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import App from "../src/App.vue";
import { routes } from "../src/router";
import { emptyOverview, type Entry } from "../src/types/finance";
vi.mock("virtual:pwa-register/vue", () => ({
  useRegisterSW: () => ({
    needRefresh: ref(false),
    offlineReady: ref(false),
    updateServiceWorker: vi.fn(),
  }),
}));
let wrapper: VueWrapper | undefined;
afterEach(() => {
  wrapper?.unmount();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});
async function settle() {
  for (let n = 0; n < 5; n++) {
    await flushPromises();
    await nextTick();
  }
}
function setupApi(loggedIn = true) {
  const entries: Entry[] = [];
  const calls: Array<{
    url: string;
    method: string;
    body: Record<string, unknown>;
  }> = [];
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input),
        method = init?.method || "GET",
        body = init?.body ? JSON.parse(String(init.body)) : {};
      calls.push({ url, method, body });
      let result: unknown = [];
      if (url === "/api/session/")
        result = {
          csrf: "test-csrf",
          user: loggedIn ? { id: 1, name: "Teste", username: "teste" } : null,
        };
      else if (url === "/api/login/") {
        loggedIn = true;
        result = { ok: true };
      } else if (url === "/api/logout/") {
        loggedIn = false;
        result = { ok: true };
      } else if (url === "/api/circles/")
        result = [{ id: 1, name: "Família teste", owner_id: 1 }];
      else if (url.includes("overview/")) result = emptyOverview();
      else if (url.endsWith("/accounts/"))
        result = [{ id: 1, name: "Conta", kind: "cash", opening_balance: "0" }];
      else if (url.endsWith("/members/"))
        result = [
          { user_id: 1, user__first_name: "Teste", user__username: "teste" },
        ];
      else if (url.endsWith("/entries/")) {
        if (method === "POST")
          entries.push({ ...body, id: entries.length + 1 } as Entry);
        result = method === "POST" ? entries.at(-1) : entries;
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return { calls, entries };
}
async function start(path = "/") {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  await router.isReady();
  wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [router] },
  });
  await settle();
  return router;
}
describe("application composition", () => {
  it("authenticates through the form and renders the routed dashboard", async () => {
    const api = setupApi(false);
    await start();
    expect(wrapper!.text()).toContain("Bom ter você aqui.");
    await wrapper!.get('input[autocomplete="username"]').setValue("teste");
    await wrapper!.get('input[type="password"]').setValue("SenhaDeTeste123!");
    await wrapper!.get("form").trigger("submit");
    await settle();
    expect(api.calls.find((c) => c.url === "/api/login/")?.body.username).toBe(
      "teste",
    );
    expect(wrapper!.text()).toContain("Seu dinheiro, com clareza.");
    expect(wrapper!.find("aside").exists()).toBe(true);
  });
  it("saves an entry from its typed form and navigates through all six routes", async () => {
    const api = setupApi();
    const router = await start("/lancamentos");
    const add = wrapper!
      .findAll("button")
      .find((b) => b.text().includes("Novo lançamento"))!;
    await add.trigger("click");
    await settle();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    const description = dialog.querySelector<HTMLInputElement>(
      'input[placeholder="Ex.: Energia, salário líquido, farmácia"]',
    )!;
    description.value = "Energia teste";
    description.dispatchEvent(new Event("input", { bubbles: true }));
    const amount = dialog.querySelector<HTMLInputElement>(
      'input[type="number"]',
    )!;
    amount.value = "123.45";
    amount.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    dialog
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await settle();
    expect(api.entries[0].description).toBe("Energia teste");
    expect(Number(api.entries[0].amount)).toBe(123.45);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(wrapper!.text()).toContain("Energia teste");
    for (const path of [
      "/",
      "/dividas",
      "/planejamento",
      "/metas",
      "/circulo",
      "/lancamentos",
    ]) {
      await router.push(path);
      await settle();
      expect(wrapper!.find("main").exists()).toBe(true);
    }
  });
  it("clears the authenticated layout when signing out", async () => {
    setupApi();
    await start();
    await wrapper!.get('button[aria-label="Sair"]').trigger("click");
    await settle();
    expect(wrapper!.find("aside").exists()).toBe(false);
    expect(wrapper!.text()).toContain("Bom ter você aqui.");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
