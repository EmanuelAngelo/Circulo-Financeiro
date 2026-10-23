import type { HttpClient } from "./http";
import type { User, Credentials } from "../types/finance";
export const createAuthService = (http: HttpClient) => ({
  async session() {
    const result = await http.request<{ csrf: string; user: User | null }>(
      "session/",
    );
    http.setCsrf(result.csrf);
    return result.user;
  },
  login: (credentials: Credentials) =>
    http.request("login/", "POST", credentials),
  register: (credentials: Credentials) =>
    http.request("register/", "POST", credentials),
  logout: () => http.request("logout/", "POST", {}),
});
