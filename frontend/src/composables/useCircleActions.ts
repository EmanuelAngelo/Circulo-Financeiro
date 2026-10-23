import { useApplication } from "../app/context";
import type { Member } from "../types/finance";
export function useCircleActions() {
  const { circles, feedback } = useApplication();
  const createCircle = (name: string) =>
    feedback.run(() => circles.create(name));
  const joinCircle = (token: string) =>
    feedback.run(async () => {
      await circles.join(token);
      feedback.notice.value = "Você entrou no círculo. Selecione-o no menu.";
    });
  const inviteMember = () => feedback.run(circles.inviteMember);
  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(circles.invite.value);
      feedback.notice.value = "Código copiado.";
    } catch {
      feedback.notice.value = "Selecione o código e copie para compartilhar.";
    }
  }
  async function removeMember(member: Member) {
    if (confirm(`Remover o acesso de ${member.user__first_name}?`))
      await feedback.run(() => circles.removeMember(member.user_id));
  }
  return { createCircle, joinCircle, inviteMember, copyInvite, removeMember };
}
