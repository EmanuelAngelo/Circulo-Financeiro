import { computed, ref, type Ref } from "vue";
import type { Entry } from "../types/finance";
export function useEntryFilters(entries: Ref<Entry[]>) {
  const search = ref(""),
    kindFilter = ref("all");
  const filtered = computed(() =>
    entries.value
      .filter(
        (e) =>
          (kindFilter.value === "all" || e.kind === kindFilter.value) &&
          e.description.toLowerCase().includes(search.value.toLowerCase()),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
  );
  return { search, kindFilter, filtered };
}
