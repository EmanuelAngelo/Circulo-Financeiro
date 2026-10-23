import type { HttpClient } from "./http";
import type {
  Resource,
  ResourceMap,
  Overview,
  EditorState,
} from "../types/finance";
export const createFinanceService = (http: HttpClient) => ({
  list: <K extends Resource>(circle: string, resource: K) =>
    http.request<ResourceMap[K][]>(`circles/${circle}/${resource}/`),
  overview: (circle: string, month: string) =>
    http.request<Overview>(
      `circles/${circle}/overview/?month=${encodeURIComponent(month)}`,
    ),
  save: (state: EditorState) =>
    http.request(
      `circles/${state.circleId}/${state.type}/${state.data.id ? state.data.id + "/" : ""}`,
      state.data.id ? "PATCH" : "POST",
      state.data,
    ),
  remove: (circle: string, resource: Resource, id: number) =>
    http.request(`circles/${circle}/${resource}/${id}/`, "DELETE"),
  setPaid: (circle: string, id: number, paid: boolean) =>
    http.request(`circles/${circle}/entries/${id}/`, "PATCH", { paid }),
});
