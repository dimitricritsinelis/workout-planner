import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { renderPlanHtml } from "@/lib/pdf/renderPlanHtml";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let plan: Plan;
  try {
    plan = (await req.json()) as Plan;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  try {
    const html = await renderPlanHtml(plan, { inlineImages: true });

    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
    });

    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      margin: {
        top: "0.4in",
        right: "0.4in",
        bottom: "0.4in",
        left: "0.4in",
      },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(plan.clientName || "client")
          .toLowerCase()
          .replace(/\s+/g, "-")}-workout-plan.pdf"`,
      },
    });
  } catch (e: any) {
    return new NextResponse(`PDF generation failed: ${e?.message ?? String(e)}`, { status: 500 });
  }
}
