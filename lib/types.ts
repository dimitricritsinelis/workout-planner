export type Exercise = {
  id: string;
  name: string;
  category: string;
  defaultRx: string;
  image: string;
};

export type PlanExerciseInstance = {
  instanceId: string;
  exerciseId: string;
  name: string;
  image: string;
  rx: string;
};

export type PlanSection = {
  id: "movement" | "strength" | "regen" | string;
  title: string;
  items: PlanExerciseInstance[];
};

export type PlanDay = {
  id: string;
  title: string;
  sections: PlanSection[];
};

export type Plan = {
  clientName: string;
  planTitle: string;
  days: PlanDay[];
};
