"use client";

import { useT, useI18n } from "@/lib/i18n/context";
import { timeAgo } from "@/lib/utils";

export interface TimelineProps {
  createdAt: string;
  sentAt: string | null;
  paidAt: string | null;
  status: string;
}

export function InvoiceTimeline({ createdAt, sentAt, paidAt, status }: TimelineProps) {
  const t = useT();
  const { locale } = useI18n();

  const events: { at: string; label: string; color: string; icon: string }[] = [
    {
      at: createdAt,
      label: t.timeline.created,
      color: "bg-slate-300",
      icon: "M12 4v16m8-8H4",
    },
  ];
  if (sentAt) {
    events.push({
      at: sentAt,
      label: t.timeline.sent,
      color: "bg-blue-500",
      icon: "M3 12l18-9-9 18-2-7-7-2z",
    });
  }
  if (paidAt) {
    events.push({
      at: paidAt,
      label: t.timeline.paid,
      color: "bg-emerald-500",
      icon: "M5 13l4 4L19 7",
    });
  } else if (status === "overdue") {
    events.push({
      at: new Date().toISOString(),
      label: t.timeline.overdue,
      color: "bg-rose-500",
      icon: "M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z",
    });
  }

  return (
    <ul className="space-y-4">
      {events.map((e, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${e.color}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={e.icon} />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">{e.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{timeAgo(e.at, locale)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
