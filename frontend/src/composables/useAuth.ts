import { ref } from "vue";
import type { createAuthService } from "../services/auth.service";
import type { Credentials, User } from "../types/finance";
export function useAuth(service: ReturnType<typeof createAuthService>) {
  const user = ref<User | null>(null);
  const ready = ref(false);
  async function restore() {
    try {
      user.value = await service.session();
    } finally {
      ready.value = true;
    }
  }
  async function signIn(mode: "login" | "register", credentials: Credentials) {
    await service[mode](credentials);
    await restore();
  }
  async function signOut() {
    await service.logout();
    user.value = null;
    await restore();
  }
  return { user, ready, restore, signIn, signOut };
}
