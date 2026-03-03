import fs from "node:fs/promises";
import path from "node:path";
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

function escapeHtml(raw: string) {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function renderTileGrid(section: PlanSection) {
  const rows = chunkInto(section.items, 4);
  const safeRows = rows.length ? rows : [[]];

  const cells = safeRows
    .map((row) => {
      const cols = Array.from({ length: 4 })
        .map((_, col) => {
          const item = row[col];
          if (!item) {
            return `<td class="tileCell"></td>`;
          }
          return `
            <td class="tileCell">
              <div class="tileName">${escapeHtml(item.name)}</div>
              <div class="tileImgWrap">
                <img class="tileImg" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
              </div>
            </td>
          `;
        })
        .join("");
      return `<tr>${cols}</tr>`;
    })
    .join("");

  return `
    <div style="margin-bottom:12px">
      <div class="sectionHeader ${sectionClass(section.id)}">${escapeHtml(section.title)}</div>
      <table class="tileTable">
        <tbody>${cells}</tbody>
      </table>
    </div>
  `;
}
function renderTilePage(plan: Plan, day: PlanDay) {
  return `
    <div class="page">
      <div class="header">
        <div class="nameLine">Name: ${escapeHtml(plan.clientName || "Client")}</div>
        <div class="subtitle"><strong>${escapeHtml(plan.planTitle || "Workout Plan")}</strong></div>
      </div>
      ${day.sections.map((sec) => renderTileGrid(sec)).join("")}
    </div>
  `;
}
function renderDetailsPage(plan: Plan, day: PlanDay) {
  const rows = day.sections.flatMap((sec) =>
    sec.items.map(
      (it) => `
        <tr>
          <td>
            <div style="font-weight:700">${escapeHtml(it.name)}</div>
            <div class="muted" style="font-size:10px">${escapeHtml(sec.title)}</div>
          </td>
          <td class="mono">${escapeHtml(it.rx)}</td>
          <td class="muted"> </td>
        </tr>
      `
    )
  );

  return `
    <div class="page">
      <div class="header">
        <div class="nameLine">Name: ${escapeHtml(plan.clientName || "Client")}</div>
        <div class="subtitle"><strong>${escapeHtml(plan.planTitle || "Workout Plan")}</strong></div>
        <div class="subtitle muted">${escapeHtml(day.title)}</div>
      </div>

      <table class="detailsTable">
        <thead>
          <tr>
            <th style="width:40%">Exercise</th>
            <th style="width:20%">Rx</th>
            <th style="width:40%">Notes</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
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
  const tilePages = safePlan.days.map((day) => renderTilePage(safePlan, day)).join("");
  const detailsPages = safePlan.days.map((day) => renderDetailsPage(safePlan, day)).join("");

  const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${css()}</style>
      </head>
      <body>
        ${tilePages}
        ${detailsPages}
      </body>
    </html>
  `;
  return html;
}
