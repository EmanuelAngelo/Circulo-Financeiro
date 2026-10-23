import { ref } from "vue";
export const useRegisterSW = () => ({
  needRefresh: ref(false),
  offlineReady: ref(false),
  updateServiceWorker: async () => {},
});
