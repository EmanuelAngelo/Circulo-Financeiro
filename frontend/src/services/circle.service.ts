import type { HttpClient } from "./http";
import type { Circle, Member } from "../types/finance";
export const createCircleService = (http: HttpClient) => ({
  list: () => http.request<Circle[]>("circles/"),
  create: (name: string) =>
    http.request<Circle[]>("circles/", "POST", { name }),
  join: (token: string) => http.request("join/", "POST", { token }),
  members: (id: string) => http.request<Member[]>(`circles/${id}/members/`),
  invite: (id: string) =>
    http.request<{ token: string; expires_at: string }>(
      `circles/${id}/members/`,
      "POST",
      {},
    ),
  removeMember: (id: string, user: number) =>
    http.request(`circles/${id}/members/`, "DELETE", { user }),
});
