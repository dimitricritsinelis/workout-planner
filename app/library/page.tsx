"use client";

import { useMemo, useState } from "react";
import exercisesSeed from "@/data/exercises.seed.json";
import type { Exercise } from "@/lib/types";
import { ExerciseTile } from "@/components/ExerciseTile";

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const exercises = exercisesSeed as Exercise[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }, [query, exercises]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-700">Exercise Library</div>
        <div className="text-xs text-neutral-500">{filtered.length} items</div>
      </div>

      <input
        className="mb-4 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        placeholder="Search exercises..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((ex) => (
          <ExerciseTile key={ex.id} exercise={ex} />
        ))}
      </div>
    </div>
  );
}
