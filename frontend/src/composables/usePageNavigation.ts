import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { Page } from "../types/finance";
import { nav } from "../constants/navigation";
export function usePageNavigation() {
  const route = useRoute(),
    router = useRouter();
  const page = computed<Page>({
    get: () => nav.find((n) => n.id === route.name)?.id ?? "overview",
    set: (value) => {
      void router.push({ name: value });
    },
  });
  return { page, nav };
}
