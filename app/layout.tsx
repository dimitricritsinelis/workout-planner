import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Planner",
  description: "Professional workout plan builder with PDF export.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-sm tracking-wide text-neutral-500">Workout Planner</div>
              <h1 className="text-xl font-semibold">Plan Builder</h1>
            </div>
            <nav className="flex gap-4 text-sm text-neutral-600">
              <a href="/">Builder</a>
              <a href="/library">Exercise Library</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
