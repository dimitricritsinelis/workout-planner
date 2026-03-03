import { create } from "zustand";
import type { Exercise, Plan } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

const initialPlan: Plan = {
  clientName: "",
  planTitle: "Workout Plan",
  days: Array.from({ length: 5 }).map((_, idx) => ({
    id: uid(),
    title: `Day ${idx + 1}`,
    sections: [
      { id: "movement", title: "Movement Prep", items: [] },
      { id: "strength", title: "Strength Blocks", items: [] },
      { id: "regen", title: "Regeneration", items: [] },
    ],
  })),
};

type PlanStore = {
  plan: Plan;
  setClientName: (name: string) => void;
  setPlanTitle: (title: string) => void;

  addExerciseToSection: (dayIndex: number, sectionId: string, ex: Exercise) => void;
  updateRx: (dayIndex: number, sectionId: string, instanceId: string, rx: string) => void;
  removeExercise: (dayIndex: number, sectionId: string, instanceId: string) => void;
};

export const usePlanStore = create<PlanStore>((set) => ({
  plan: initialPlan,

  setClientName: (clientName) =>
    set((s) => ({ plan: { ...s.plan, clientName } })),

  setPlanTitle: (planTitle) =>
    set((s) => ({ plan: { ...s.plan, planTitle } })),

  addExerciseToSection: (dayIndex, sectionId, ex) =>
    set((s) => {
      const days = s.plan.days.map((d, idx) => {
        if (idx !== dayIndex) return d;
        return {
          ...d,
          sections: d.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              items: [
                ...sec.items,
                {
                  instanceId: uid(),
                  exerciseId: ex.id,
                  name: ex.name,
                  image: ex.image,
                  rx: ex.defaultRx,
                },
              ],
            };
          }),
        };
      });
      return { plan: { ...s.plan, days } };
    }),

  updateRx: (dayIndex, sectionId, instanceId, rx) =>
    set((s) => {
      const days = s.plan.days.map((d, idx) => {
        if (idx !== dayIndex) return d;
        return {
          ...d,
          sections: d.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return {
              ...sec,
              items: sec.items.map((it) => (it.instanceId === instanceId ? { ...it, rx } : it)),
            };
          }),
        };
      });
      return { plan: { ...s.plan, days } };
    }),

  removeExercise: (dayIndex, sectionId, instanceId) =>
    set((s) => {
      const days = s.plan.days.map((d, idx) => {
        if (idx !== dayIndex) return d;
        return {
          ...d,
          sections: d.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            return { ...sec, items: sec.items.filter((it) => it.instanceId !== instanceId) };
          }),
        };
      });
      return { plan: { ...s.plan, days } };
    }),
}));
