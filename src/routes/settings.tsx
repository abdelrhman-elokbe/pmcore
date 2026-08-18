import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  FileText,
  Hexagon,
  ScrollText,
  BookOpen,
  Globe2,
  Braces,
  Workflow,
  BellRing,
  FileCog,
  Settings2,
  Download,
  Trash2,
  Palette,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Blackstone IT Platform" },
      {
        name: "description",
        content:
          "Configure branding, logos, favicon, primary and secondary colors, notifications, logging and product-level settings.",
      },
      { property: "og:title", content: "Settings | Blackstone IT Platform" },
      {
        property: "og:description",
        content: "Branding, colors, notifications, logging and per-product configuration.",
      },
    ],
  }),
  component: Settings,
});

const mainNav = [
  { label: "Branding", icon: Palette },
  { label: "Notification", icon: Bell },
  { label: "Files", icon: FileText },
  { label: "Logging", icon: ScrollText },
  { label: "Lookup & Content", icon: BookOpen },
  { label: "Regional Settings", icon: Globe2 },
  { label: "Dynamic Fields", icon: Braces },
  { label: "WF Simulator", icon: Workflow },
  { label: "Notification Simulator", icon: BellRing },
  { label: "File Simulator", icon: FileCog },
];

const generalSettings = [
  "Committte-QA",
  "Committte",
  "new product for story",
  "Product D",
  "amary",
  "Projects-QA",
  "Projects",
  "Innovation QA",
  "Innovation",
  "NEW 2026",
  "ProjectCore",
  "ama2",
  "Demo one",
  "new test",
  "p 20",
  "product BB",
];

const primarySwatches = ["#2563EB", "#7C3AED", "#0891B2", "#059669", "#D97706"];
const secondarySwatches = ["#BFDBFE", "#EC4899", "#9CA3AF", "#0EA5E9"];

function Settings() {
  const [section, setSection] = useState("Branding");
  const [primary, setPrimary] = useState("#7C3AED");
  const [secondary, setSecondary] = useState("#EC4899");

  return (
    <AppShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="space-y-1">
          {mainNav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setSection(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] transition-colors ${
                section === label
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-[18px]" />
              {label}
            </button>
          ))}

          <p className="px-3 pb-2 pt-6 text-xs font-semibold tracking-widest text-muted-foreground">
            GENERAL SETTINGS
          </p>
          {generalSettings.map((label) => (
            <button
              key={label}
              onClick={() => setSection(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] transition-colors ${
                section === label
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Settings2 className="size-[18px]" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          <section className="rounded-2xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Customer Logo & Favicon</h2>
              <button className="rounded-xl bg-secondary-soft px-5 py-2 text-sm font-semibold text-secondary">
                Save
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Platform Logo",
                  hint: "Shown in the app header. Recommended 160×40 px.",
                  wide: true,
                },
                {
                  title: "Browser Favicon",
                  hint: "Shown in browser tabs. Use 32×32 or 64×64 px.",
                  wide: false,
                },
              ].map((box) => (
                <div key={box.title}>
                  <p className="text-sm font-medium text-foreground">{box.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{box.hint}</p>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-border bg-surface px-6 py-8">
                    <span className="flex items-center gap-2">
                      <Hexagon className="size-6 fill-foreground text-foreground" strokeWidth={1.5} />
                      {box.wide && (
                        <span className="text-base font-extrabold tracking-[0.14em] text-foreground">
                          BLACKSTONE
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-4 text-muted-foreground">
                      <Download className="size-[18px]" />
                      <Trash2 className="size-[18px] text-destructive" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground">Primary & Secondary Colors</h2>
              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                  Reset to Default
                </button>
                <button className="rounded-xl bg-secondary-soft px-5 py-2 text-sm font-semibold text-secondary">
                  Save
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-foreground">Primary Color</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Main CTAs, active states, key UI elements
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-3 rounded-full border border-border py-1.5 pl-1.5 pr-6">
                    <span
                      className="size-8 rounded-full"
                      style={{ backgroundColor: primary }}
                    />
                    <span className="text-sm text-foreground">{primary}</span>
                  </span>
                  {primarySwatches.map((c) => (
                    <button
                      key={c}
                      aria-label={c}
                      onClick={() => setPrimary(c)}
                      className={`size-7 rounded-full ring-offset-2 ring-offset-card ${primary === c ? "ring-2 ring-foreground" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">Secondary Color</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Accents, badges, secondary buttons, highlights
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-3 rounded-full border border-border py-1.5 pl-1.5 pr-6">
                    <span
                      className="size-8 rounded-full"
                      style={{ backgroundColor: secondary }}
                    />
                    <span className="text-sm text-foreground">{secondary}</span>
                  </span>
                  {secondarySwatches.map((c) => (
                    <button
                      key={c}
                      aria-label={c}
                      onClick={() => setSecondary(c)}
                      className={`size-7 rounded-full ring-offset-2 ring-offset-card ${secondary === c ? "ring-2 ring-foreground" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl bg-surface p-6">
              <p className="font-semibold text-foreground">Live Preview</p>
              <button
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-primary-foreground"
                style={{ backgroundColor: primary }}
              >
                Primary button
              </button>
              <button
                className="rounded-lg border bg-card px-5 py-2.5 text-sm font-medium"
                style={{ borderColor: primary, color: primary }}
              >
                Outline button
              </button>
              <button className="text-sm" style={{ color: primary }}>
                Link text
              </button>
              <button
                className="rounded-lg px-5 py-2.5 text-sm font-medium"
                style={{ backgroundColor: `${secondary}33`, color: secondary }}
              >
                Secondary button
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
