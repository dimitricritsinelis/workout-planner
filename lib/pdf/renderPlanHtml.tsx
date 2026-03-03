import fs from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Plan, PlanDay, PlanSection } from "@/lib/types";

type RenderOptions = {
  inlineImages?: boolean;
};

function css() {
  return `
    @page { size: Letter; margin: 0.4in; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; }
    .page { page-break-after: always; }
    .header { margin-bottom: 10px; }
    .nameLine { font-size: 14px; font-weight: 700; }
    .subtitle { margin-top: 2px; font-size: 12px; }
    .sectionHeader { font-weight: 700; padding: 6px 8px; border: 1px solid #333; border-bottom: 0; }
    .movement { background: #b7aedf; } /* close to sample PDF */
    .strength { background: #f0c38c; }
    .regen { background: #b8d8a4; }

    .tileTable { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .tileCell { border: 1px solid #333; vertical-align: top; padding: 6px; height: 125px; }
    .tileName { font-size: 11px; font-weight: 700; text-align: center; margin-bottom: 6px; }
    .tileImgWrap { display: flex; justify-content: center; align-items: center; height: 90px; }
    .tileImg { max-width: 100%; max-height: 90px; object-fit: contain; }

    .detailsTable { width: 100%; border-collapse: collapse; }
    .detailsTable th, .detailsTable td { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
    .detailsTable th { background: #f5f5f5; text-align: left; font-size: 11px; }
    .muted { color: #555; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  `;
}

function chunkInto<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sectionClass(id: string) {
  if (id === "movement") return "movement";
  if (id === "strength") return "strength";
  if (id === "regen") return "regen";
  return "movement";
}

function TileGrid({ section }: { section: PlanSection }) {
  const rows = chunkInto(section.items, 4);
  // ensure at least 1 row for consistent look
  const safeRows = rows.length ? rows : [[]];

  return (
    <div style={{ marginBottom: 12 }}>
      <div className={`sectionHeader ${sectionClass(section.id)}`}>{section.title}</div>
      <table className="tileTable">
        <tbody>
          {safeRows.map((r, idx) => (
            <tr key={idx}>
              {Array.from({ length: 4 }).map((_, col) => {
                const item = r[col];
                return (
                  <td key={col} className="tileCell">
                    {item ? (
                      <>
                        <div className="tileName">{item.name}</div>
                        <div className="tileImgWrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="tileImg" src={item.image} alt={item.name} />
                        </div>

                      </>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TilePage({ plan, day }: { plan: Plan; day: PlanDay }) {
  return (
    <div className="page">
      <div className="header">
        <div className="nameLine">Name: {plan.clientName || "Client"}</div>
        <div className="subtitle">
          <strong>{plan.planTitle || "Workout Plan"}</strong>
        </div>
      </div>

      {day.sections.map((sec) => (
        <TileGrid key={sec.id} section={sec} />
      ))}
    </div>
  );
}

function DetailsPage({ plan, day }: { plan: Plan; day: PlanDay }) {
  return (
    <div className="page">
      <div className="header">
        <div className="nameLine">Name: {plan.clientName || "Client"}</div>
        <div className="subtitle">
          <strong>{plan.planTitle || "Workout Plan"}</strong>
        </div>
        <div className="subtitle muted">{day.title}</div>
      </div>

      <table className="detailsTable">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Exercise</th>
            <th style={{ width: "20%" }}>Rx</th>
            <th style={{ width: "40%" }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {day.sections.flatMap((sec) =>
            sec.items.map((it) => (
              <tr key={it.instanceId}>
                <td>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div className="muted" style={{ fontSize: 10 }}>{sec.title}</div>
                </td>
                <td className="mono">{it.rx}</td>
                <td className="muted"> </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PdfDocument({ plan }: { plan: Plan }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>{css()}</style>
      </head>
      <body>
        {/* Tile pages first */}
        {plan.days.map((day) => (
          <TilePage key={day.id} plan={plan} day={day} />
        ))}

        {/* Then details pages */}
        {plan.days.map((day) => (
          <DetailsPage key={day.id + "-details"} plan={plan} day={day} />
        ))}
      </body>
    </html>
  );
}

async function inlinePublicImages(plan: Plan): Promise<Plan> {
  const publicDir = path.join(process.cwd(), "public");
  const clone: Plan = JSON.parse(JSON.stringify(plan));

  for (const day of clone.days) {
    for (const sec of day.sections) {
      for (const it of sec.items) {
        if (!it.image.startsWith("/")) continue;
        const abs = path.join(publicDir, it.image);
        const buf = await fs.readFile(abs);
        const ext = path.extname(abs).slice(1) || "png";
        const b64 = buf.toString("base64");
        it.image = `data:image/${ext};base64,${b64}`;
      }
    }
  }
  return clone;
}

export async function renderPlanHtml(plan: Plan, options: RenderOptions) {
  const safePlan = options.inlineImages ? await inlinePublicImages(plan) : plan;
  const html = "<!doctype html>" + renderToStaticMarkup(<PdfDocument plan={safePlan} />);
  return html;
}
