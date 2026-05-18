import { requireUser } from "@/lib/auth";
import { getTopClients, getAgingReport, getMonthlyRevenue } from "@/services/reports";
import { getProfile } from "@/services/profile";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { TopClients } from "@/components/dashboard/TopClients";
import { RevenueBar } from "@/components/dashboard/Charts";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { user } = await requireUser();
  const [t, profile, monthly, top, aging] = await Promise.all([
    getDict(),
    getProfile(user.id),
    getMonthlyRevenue(user.id, 12),
    getTopClients(user.id, 10),
    getAgingReport(user.id),
  ]);
  const ccy = profile?.default_currency ?? "USD";
  const labelMap = {
    current: t.reports.agingCurrent,
    "30": t.reports.aging3060,
    "60": t.reports.aging6090,
    "90+": t.reports.aging90plus,
  };
  const totalUnpaid = aging.reduce((s, b) => s + b.amount, 0);

  const agingColors: Record<string, string> = {
    current: "bg-emerald-500",
    "30": "bg-amber-500",
    "60": "bg-orange-500",
    "90+": "bg-rose-500",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.reports.eyebrow}
        title={t.reports.title}
        description={t.reports.desc}
      />

      {/* Revenue by month */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.reports.revenueByMonth}</CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">{t.reports.revenueByMonthSub}</p>
          </div>
        </CardHeader>
        <CardBody>
          <RevenueBar data={monthly} currency={ccy} />
        </CardBody>
      </Card>

      {/* Aging + Top clients */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t.reports.aging}</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">{t.reports.agingSub}</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {formatCurrency(totalUnpaid, ccy)}
              </div>
              <p className="text-xs text-slate-500">Total outstanding</p>
            </div>
            <div className="space-y-3">
              {aging.map((b) => {
                const pct = totalUnpaid > 0 ? (b.amount / totalUnpaid) * 100 : 0;
                return (
                  <div key={b.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span className={`h-2 w-2 rounded-full ${agingColors[b.label]}`} />
                        {labelMap[b.label as keyof typeof labelMap]}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        <span className="font-medium text-slate-700">{b.count}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        {formatCurrency(b.amount, ccy)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${agingColors[b.label]} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t.reports.topClients}</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">{t.reports.topClientsSub}</p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <TopClients clients={top} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
