import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listInvoices, type InvoicePeriod } from "@/services/invoices";
import { getProfile } from "@/services/profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { PeriodToggle, type Period } from "@/components/ui/PeriodToggle";
import { getDict } from "@/lib/i18n/server";
import { formatCurrency } from "@/lib/utils";
import { InvoiceTable } from "./InvoiceTable";
import type { InvoiceStatus } from "@/types/db";

export const dynamic = "force-dynamic";

const VALID_PERIODS: InvoicePeriod[] = ["week", "month", "quarter", "year", "all"];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; period?: string }>;
}) {
  const sp = await searchParams;
  const { user } = await requireUser();
  const [t, profile] = await Promise.all([getDict(), getProfile(user.id)]);
  const status = (sp.status as InvoiceStatus | "all" | undefined) ?? "all";
  const page = Number(sp.page ?? 1);
  const period: InvoicePeriod = (VALID_PERIODS.includes(sp.period as InvoicePeriod)
    ? sp.period
    : "all") as InvoicePeriod;

  const { invoices, total, pageSize, summary } = await listInvoices(user.id, {
    q: sp.q,
    status,
    period,
    page,
  });

  const ccy = summary.currency || profile?.default_currency || "USD";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.landing.eyebrowBilling}
        title={t.invoices.title}
        description={t.invoices.desc}
        actions={
          <Link href="/invoices/new">
            <Button>{t.invoices.newInvoice}</Button>
          </Link>
        }
      />

      {/* Period + Summary strip */}
      <div className="space-y-3">
        <PeriodToggle value={period as Period} />
        <div className="grid grid-cols-2 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          <SummaryCell label={t.invoices.summaryCount(summary.count)} value={summary.count.toString()} mono />
          <SummaryCell label={t.invoices.summaryTotal} value={formatCurrency(summary.total, ccy)} />
          <SummaryCell label={t.invoices.summaryPaid} value={formatCurrency(summary.paid, ccy)} accent="emerald" />
          <SummaryCell label={t.invoices.summaryUnpaid} value={formatCurrency(summary.unpaid, ccy)} accent="amber" />
        </div>
      </div>

      <FilterBar
        searchPlaceholder={t.invoices.searchPh}
        statusOptions={[
          { value: "all", label: t.status.all },
          { value: "draft", label: t.status.draft },
          { value: "sent", label: t.status.sent },
          { value: "paid", label: t.status.paid },
          { value: "overdue", label: t.status.overdue },
        ]}
      />

      {invoices.length === 0 ? (
        <EmptyState
          variant="invoices"
          title={t.invoices.noneFound}
          description={sp.q || status !== "all" || period !== "all" ? t.invoices.cleanFilters : t.invoices.createFirst}
          action={
            <Link href="/invoices/new">
              <Button>{t.invoices.createBtn}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <InvoiceTable invoices={invoices} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            basePath="/invoices"
            query={{ q: sp.q, status: sp.status, period: sp.period }}
          />
        </div>
      )}
    </div>
  );
}

function SummaryCell({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber";
  mono?: boolean;
}) {
  const valueColor =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
        ? "text-amber-700 dark:text-amber-400"
        : "text-slate-900 dark:text-slate-100";
  return (
    <div className="p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${valueColor} ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
