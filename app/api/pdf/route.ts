import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
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

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const html = await renderPlanHtml(plan, { inlineImages: true });

    browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
    });

    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "letter",
      printBackground: true,
      margin: {
        top: "0.4in",
        right: "0.4in",
        bottom: "0.4in",
        left: "0.4in",
      },
    });

    const file = new Uint8Array(pdfBuffer);
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(plan.clientName || "client")
          .toLowerCase()
          .replace(/\s+/g, "-")}-workout-plan.pdf"`,
      },
    });
  } catch (e: any) {
    return new NextResponse(`PDF generation failed: ${e?.message ?? String(e)}`, { status: 500 });
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}
