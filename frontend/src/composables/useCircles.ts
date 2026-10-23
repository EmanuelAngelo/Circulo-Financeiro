import { computed, ref } from "vue";
import type { Circle, Member } from "../types/finance";
import type { createCircleService } from "../services/circle.service";
export function useCircles(service: ReturnType<typeof createCircleService>) {
  const circles = ref<Circle[]>([]),
    circleId = ref(""),
    members = ref<Member[]>([]),
    invite = ref("");
  const circle = computed(() =>
    circles.value.find((c) => String(c.id) === circleId.value),
  );
  let generation = 0;
  async function refresh() {
    const version = ++generation;
    const result = await service.list();
    if (version !== generation) return;
    circles.value = result;
    if (!circles.value.some((c) => String(c.id) === circleId.value))
      circleId.value = String(circles.value[0]?.id || "");
  }
  async function create(name: string) {
    const version = ++generation;
    const result = await service.create(name);
    if (version !== generation) return;
    circles.value = result;
    circleId.value = String(circles.value.at(-1)?.id || "");
  }
  async function join(token: string) {
    await service.join(token);
    await refresh();
  }
  async function inviteMember() {
    const id = circleId.value;
    const result = await service.invite(id);
    if (circleId.value === id) invite.value = result.token;
  }
  async function removeMember(user: number) {
    const id = circleId.value;
    await service.removeMember(id, user);
    const result = await service.members(id);
    if (circleId.value === id) members.value = result;
  }
  function clear() {
    generation++;
    circles.value = [];
    circleId.value = "";
    members.value = [];
    invite.value = "";
  }
  return {
    circles,
    circleId,
    circle,
    members,
    invite,
    refresh,
    create,
    join,
    inviteMember,
    removeMember,
    clear,
  };
}
export type CircleState = ReturnType<typeof useCircles>;
