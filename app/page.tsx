"use client";

import { useMemo, useState } from "react";
import { usePlanStore } from "@/lib/store";
import { ExerciseTile } from "@/components/ExerciseTile";
import exercisesSeed from "@/data/exercises.seed.json";
import type { Exercise } from "@/lib/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function BuilderPage() {
  const [query, setQuery] = useState("");
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState("movement");
  const { plan, setClientName, setPlanTitle, addExerciseToSection, updateRx, removeExercise } = usePlanStore();

  const exercises = exercisesSeed as Exercise[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }, [query, exercises]);

  const activeDay = plan.days[activeDayIndex];

  async function exportPdf() {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`PDF export failed: ${msg}`);
      return;
    }
    const blob = await res.blob();
    downloadBlob(blob, `${plan.clientName || "client"}-workout-plan.pdf`);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Library */}
      <aside className="col-span-12 lg:col-span-5">
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.slice(0, 60).map((ex) => (
              <ExerciseTile
                key={ex.id}
                exercise={ex}
                onAdd={() => addExerciseToSection(activeDayIndex, activeSectionId, ex)}
              />
            ))}
          </div>

          {filtered.length > 60 ? (
            <div className="mt-3 text-xs text-neutral-500">
              Showing first 60 results. Use a more specific search to narrow down.
            </div>
          ) : null}
        </div>
      </aside>

      {/* Right: Plan */}
      <main className="col-span-12 lg:col-span-7">
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Client name</label>
              <input
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                value={plan.clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Justin Jones"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Plan title</label>
              <input
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                value={plan.planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="e.g., 5 Day Strength Plan"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {plan.days.map((d, idx) => (
                <button
                  key={d.id}
                  className={[
                    "rounded-xl px-3 py-2 text-sm",
                    idx === activeDayIndex ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                  ].join(" ")}
                  onClick={() => setActiveDayIndex(idx)}
                >
                  Day {idx + 1}
                </button>
              ))}
            </div>

            <button
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              onClick={exportPdf}
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-neutral-700">{activeDay.title}</div>
            <div className="flex gap-2">
              {activeDay.sections.map((s) => (
                <button
                  key={s.id}
                  className={[
                    "rounded-xl px-3 py-1.5 text-xs",
                    s.id === activeSectionId ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                  ].join(" ")}
                  onClick={() => setActiveSectionId(s.id)}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {activeDay.sections.map((section) => (
              <section key={section.id} className="rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
                  <div className="text-xs font-semibold text-neutral-700">{section.title}</div>
                  <div className="text-[11px] text-neutral-500">
                    {section.items.length} exercise{section.items.length === 1 ? "" : "s"}
                  </div>
                </div>

                {section.items.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-neutral-500">
                    Select exercises from the library to add them here.
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-200">
                    {section.items.map((item) => (
                      <li key={item.instanceId} className="flex items-center gap-3 px-3 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-neutral-900">{item.name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-neutral-500">Rx</span>
                            <input
                              className="w-40 rounded-lg border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-neutral-400"
                              value={item.rx}
                              onChange={(e) => updateRx(activeDayIndex, section.id, item.instanceId, e.target.value)}
                            />
                          </div>
                        </div>

                        <button
                          className="rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                          onClick={() => removeExercise(activeDayIndex, section.id, item.instanceId)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Tip: pick a section tab (Movement Prep, Strength Blocks, Regeneration), then tap an exercise tile to add it.
        </div>
      </main>
    </div>
  );
}
