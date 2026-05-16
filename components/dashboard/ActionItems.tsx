"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import type { ActionItem } from "@/services/actions";

const KIND_META: Record<
  ActionItem["kind"],
  { dot: string; bg: string }
> = {
  chase_overdue: { dot: "bg-rose-500", bg: "bg-rose-50" },
  send_draft: { dot: "bg-amber-500", bg: "bg-amber-50" },
  due_soon: { dot: "bg-blue-500", bg: "bg-blue-50" },
  just_paid: { dot: "bg-emerald-500", bg: "bg-emerald-50" },
};

export function ActionItems({ items }: { items: ActionItem[] }) {
  const t = useT();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-sm font-medium text-slate-700">{t.actions.empty}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((it) => {
        const meta = KIND_META[it.kind];
        let text = "";
        if (it.kind === "send_draft") text = t.actions.sendDraft(it.invoiceNumber, it.days);
        else if (it.kind === "chase_overdue") text = t.actions.chaseOverdue(it.invoiceNumber, it.clientName ?? "—", it.days);
        else if (it.kind === "due_soon") text = t.actions.dueSoon(it.invoiceNumber, it.clientName ?? "—", it.days);
        else if (it.kind === "just_paid") text = t.actions.justPaid(it.invoiceNumber, it.clientName ?? "—");
        return (
          <li key={`${it.kind}-${it.invoiceId}`}>
            <Link
              href={`/invoices/${it.invoiceId}`}
              className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
            >
              <span className={`mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-slate-800">{text}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {formatCurrency(it.amount, it.currency)}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-brand-600">
                {t.actions.open} →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
