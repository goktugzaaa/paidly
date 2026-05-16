import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listInvoices } from "@/services/invoices";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { getDict } from "@/lib/i18n/server";
import { InvoiceTable } from "./InvoiceTable";
import type { InvoiceStatus } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { user } = await requireUser();
  const t = await getDict();
  const status = (sp.status as InvoiceStatus | "all" | undefined) ?? "all";
  const page = Number(sp.page ?? 1);

  const { invoices, total, pageSize } = await listInvoices(user.id, {
    q: sp.q,
    status,
    page,
  });

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
          description={sp.q || status !== "all" ? t.invoices.cleanFilters : t.invoices.createFirst}
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
            query={{ q: sp.q, status: sp.status }}
          />
        </div>
      )}
    </div>
  );
}
