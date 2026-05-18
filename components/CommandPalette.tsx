"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";
import { formatCurrency, cn } from "@/lib/utils";

interface ClientHit {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}
interface InvoiceHit {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  currency: string;
  client?: { name?: string } | null;
}
interface SearchResult {
  clients: ClientHit[];
  invoices: InvoiceHit[];
}

const PAGES = [
  { href: "/dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/clients", icon: "M16 14a4 4 0 10-8 0M12 14v6m-7 0h14" },
  { href: "/invoices", icon: "M7 4h10l3 4v12H4V8l3-4zM4 8h16M9 14h6" },
  { href: "/reports", icon: "M3 3v18h18M7 16V9m4 7V5m4 11v-3m4 3V11" },
  { href: "/settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { href: "/invoices/new", icon: "M12 4v16m8-8H4" },
  { href: "/clients/new", icon: "M12 4v16m8-8H4" },
];

const PAGE_LABEL_KEY: Record<string, "dashboard" | "clients" | "invoices" | "reports" | "settings" | "newInvoice" | "newClient"> = {
  "/dashboard": "dashboard",
  "/clients": "clients",
  "/invoices": "invoices",
  "/reports": "reports",
  "/settings": "settings",
  "/invoices/new": "newInvoice",
  "/clients/new": "newClient",
};

const NEW_LABEL_EN: Record<string, string> = { newInvoice: "New invoice", newClient: "New client" };
const NEW_LABEL_TR: Record<string, string> = { newInvoice: "Yeni fatura", newClient: "Yeni müşteri" };

export function CommandPaletteTrigger() {
  const t = useT();
  const [open, setOpen] = useState(false);

  // global shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500 transition-colors hover:bg-slate-50 md:inline-flex"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>{t.cmdk.open}</span>
        <kbd className="ml-2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">⌘K</kbd>
      </button>
      {open && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult>({ clients: [], invoices: [] });
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // debounced fetch
  useEffect(() => {
    if (!q.trim()) {
      setResults({ clients: [], invoices: [] });
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => setResults(data))
        .catch(() => {});
    }, 150);
    return () => {
      ctrl.abort();
      clearTimeout(id);
    };
  }, [q]);

  // build flat list of selectable items
  const filteredPages = PAGES.filter((p) => {
    if (!q) return true;
    const key = PAGE_LABEL_KEY[p.href];
    const labels: string[] = [];
    if (key === "newInvoice" || key === "newClient") {
      labels.push(NEW_LABEL_EN[key], NEW_LABEL_TR[key]);
    } else if (key) {
      labels.push(t.nav[key]);
    }
    return labels.some((l) => l.toLowerCase().includes(q.toLowerCase()));
  });

  const flat: { kind: "page" | "client" | "invoice"; href: string; label: string; sub?: string; icon?: string }[] = [];
  for (const p of filteredPages) {
    const key = PAGE_LABEL_KEY[p.href];
    let label = "";
    if (key === "newInvoice") label = t.invoices.newInvoice;
    else if (key === "newClient") label = t.clients.newClient;
    else if (key) label = t.nav[key];
    flat.push({ kind: "page", href: p.href, label, icon: p.icon });
  }
  for (const c of results.clients) {
    flat.push({ kind: "client", href: `/clients/${c.id}`, label: c.name, sub: c.company || c.email || undefined });
  }
  for (const inv of results.invoices) {
    flat.push({
      kind: "invoice",
      href: `/invoices/${inv.id}`,
      label: inv.invoice_number,
      sub: `${inv.client?.name ?? ""} · ${formatCurrency(inv.total_amount, inv.currency || "USD")}`,
    });
  }

  // keyboard nav
  const go = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(flat.length - 1, a + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const sel = flat[active];
        if (sel) go(sel.href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flat, active, go]);

  // reset active when results change
  useEffect(() => {
    setActive(0);
  }, [q, results]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 px-4 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.cmdk.placeholder}
            className="flex-1 border-0 bg-transparent py-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {flat.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">{t.cmdk.noResults}</div>
          ) : (
            <ul>
              {filteredPages.length > 0 && (
                <SectionLabel>{t.cmdk.sectionPages}</SectionLabel>
              )}
              {flat.map((item, idx) => {
                const isActive = idx === active;
                const isFirstClient =
                  item.kind === "client" &&
                  flat[idx - 1]?.kind !== "client";
                const isFirstInvoice =
                  item.kind === "invoice" &&
                  flat[idx - 1]?.kind !== "invoice";
                return (
                  <div key={`${item.kind}-${item.href}`}>
                    {isFirstClient && <SectionLabel>{t.cmdk.sectionClients}</SectionLabel>}
                    {isFirstInvoice && <SectionLabel>{t.cmdk.sectionInvoices}</SectionLabel>}
                    <li>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
                          isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {item.icon ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                        ) : (
                          <span className={cn("font-mono text-[10px] uppercase", isActive ? "text-brand-500" : "text-slate-400")}>
                            {item.kind === "client" ? "C" : "INV"}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          {item.sub && <span className="block truncate text-xs text-slate-500">{item.sub}</span>}
                        </span>
                        {isActive && <span className="text-xs text-slate-400">↵</span>}
                      </button>
                    </li>
                  </div>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-500">
          {t.cmdk.hint}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <li className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
      {children}
    </li>
  );
}
