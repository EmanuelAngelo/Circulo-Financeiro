import { watch } from "vue";
import { createHttpClient } from "../services/http";
import { createAuthService } from "../services/auth.service";
import { createCircleService } from "../services/circle.service";
import { createFinanceService } from "../services/finance.service";
import { useFeedback } from "../composables/useFeedback";
import { useAuth } from "../composables/useAuth";
import { useCircles } from "../composables/useCircles";
import { useFinance } from "../composables/useFinance";
import { useRecordEditor } from "../composables/useRecordEditor";
import { usePwa } from "../composables/usePwa";
export function createApplication() {
  const http = createHttpClient(),
    feedback = useFeedback();
  const circleService = createCircleService(http),
    financeService = createFinanceService(http);
  const auth = useAuth(createAuthService(http));
  const circles = useCircles(circleService);
  const finance = useFinance(financeService, circleService, circles, feedback);
  const editor = useRecordEditor(financeService, finance, circles, feedback);
  const pwa = usePwa(feedback);
  watch(auth.user, () => {
    circles.clear();
    finance.clear();
    editor.close();
    if (auth.user.value)
      void circles
        .refresh()
        .catch(
          (e) =>
            (feedback.error.value =
              e instanceof Error ? e.message : "Falha ao carregar círculos."),
        );
  });
  return { auth, circles, finance, editor, pwa, feedback };
}
