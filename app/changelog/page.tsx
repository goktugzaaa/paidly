import Link from "next/link";
import { Brand } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDict } from "@/lib/i18n/server";

export const metadata = {
  title: "Changelog",
  description: "What shipped, when, and why.",
};

interface Entry {
  date: string;
  version: string;
  title: string;
  items: string[];
}

const ENTRIES: Entry[] = [
  {
    date: "2026-05-16",
    version: "v0.6",
    title: "Built in public",
    items: [
      "Killed fake testimonials. Replaced with a real story (47-day overdue invoice).",
      "Stats panel is honest now: 0 paying users, MIT license, public beta.",
      "Added /about and /changelog. Footer gets GitHub + X links.",
    ],
  },
  {
    date: "2026-05-16",
    version: "v0.5",
    title: "Inside-app got teeth",
    items: [
      "Reports page: monthly revenue, top clients, 0-30/30-60/60-90/90+ aging.",
      "⌘K command palette — fuzzy search for clients, invoices, pages.",
      "Bulk actions on invoices (mark paid/sent/delete).",
      "Invoice detail timeline (created → sent → paid).",
      "Profile avatar dropdown in topbar.",
    ],
  },
  {
    date: "2026-05-16",
    version: "v0.4",
    title: "First-run onboarding",
    items: [
      "Country → business name → bank info wizard. ~2 minutes.",
      "Auto-redirects new signups before they hit a blank dashboard.",
    ],
  },
  {
    date: "2026-05-16",
    version: "v0.3",
    title: "Real PDF, real countries",
    items: [
      "Inter font embedded — full Turkish/extended-Latin support (İ, ğ, ç, ş, ü, ö).",
      "Locale-aware PDF: tax label and date format follow seller's country.",
      "Trimmed country list to 23 — only places where casual PDF works as a real invoice.",
    ],
  },
  {
    date: "2026-05-16",
    version: "v0.2",
    title: "Editorial landing",
    items: [
      "Instrument Serif italic for accent. Off-white #f8f7f4 canvas.",
      "Manifesto section, marquee, scroll-reveal, command-style mono labels.",
    ],
  },
  {
    date: "2026-05-15",
    version: "v0.1",
    title: "First commit",
    items: [
      "Next.js 15 + Supabase + Tailwind. Auth, clients, invoices, dashboard, PDF.",
      "Multi-tenant RLS on every table.",
      "Deployed to Vercel. Demo workspace live.",
    ],
  },
];

export default async function ChangelogPage() {
  const t = await getDict();
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-900/10 bg-[#f8f7f4]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Brand size="md" href="/" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="hidden text-xs font-medium uppercase tracking-widest text-slate-700 hover:text-slate-900 sm:inline-block">
              {t.landing.signIn}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-slate-500">
          — Changelog
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-6xl">
          What shipped,
          <span className="block font-serif italic text-slate-500">when, and why.</span>
        </h1>
        <p className="mt-6 max-w-xl text-slate-600">
          Public log. Every commit isn&apos;t here — only the things you&apos;d notice.
        </p>

        <ol className="mt-14 space-y-12">
          {ENTRIES.map((e) => (
            <li key={e.version} className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500">{e.date}</p>
                <p className="mt-1 font-serif text-2xl italic text-slate-900">{e.version}</p>
              </div>
              <div className="border-t border-slate-900/15 pt-4 sm:col-span-9">
                <h2 className="text-2xl font-semibold tracking-tight">{e.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
                  {e.items.map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 text-slate-400">—</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex gap-4 font-mono text-[11px] uppercase tracking-widest">
          <Link href="/" className="border-b border-slate-300 pb-0.5 text-slate-600 hover:text-slate-900">
            ← Back home
          </Link>
          <Link href="/about" className="border-b border-slate-900 pb-0.5 text-slate-900 hover:opacity-70">
            About →
          </Link>
        </div>
      </section>
    </main>
  );
}
