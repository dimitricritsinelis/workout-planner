import type { Exercise } from "@/lib/types";

export function ExerciseTile({
  exercise,
  onAdd,
}: {
  exercise: Exercise;
  onAdd?: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm transition hover:border-neutral-300">
      <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.image}
          alt={exercise.name}
          className="h-full w-full object-contain p-1"
          loading="lazy"
        />
      </div>

      <div className="mt-2 min-h-[2.5rem]">
        <div className="line-clamp-2 text-xs font-medium text-neutral-900">{exercise.name}</div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
          <span>{exercise.category}</span>
          <span className="font-mono">{exercise.defaultRx}</span>
        </div>
      </div>

      {onAdd ? (
        <button
          className="mt-2 w-full rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800"
          onClick={onAdd}
        >
          Add
        </button>
      ) : (
        <div className="mt-2 w-full rounded-xl bg-neutral-100 px-3 py-2 text-center text-xs text-neutral-600">
          View
        </div>
      )}
    </div>
  );
}
