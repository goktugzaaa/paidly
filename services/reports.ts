import { createClient } from "@/lib/supabase/server";
import type { InvoiceStatus } from "@/types/db";

export interface TopClient {
  id: string;
  name: string;
  company: string | null;
  total: number;
  invoiceCount: number;
  currency: string;
}

export async function getTopClients(userId: string, limit = 5): Promise<TopClient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("client_id, total_amount, currency, client:clients(id,name,company)")
    .eq("user_id", userId)
    .eq("status", "paid");
  if (error) throw error;

  const map = new Map<string, TopClient>();
  for (const row of data ?? []) {
    if (!row.client_id) continue;
    const client = (row as { client?: { id?: string; name?: string; company?: string | null } | { id?: string; name?: string; company?: string | null }[] }).client;
    const c = Array.isArray(client) ? client[0] : client;
    if (!c?.id || !c?.name) continue;
    const cur = map.get(c.id) ?? {
      id: c.id,
      name: c.name,
      company: c.company ?? null,
      total: 0,
      invoiceCount: 0,
      currency: (row.currency as string) || "USD",
    };
    cur.total += Number(row.total_amount ?? 0);
    cur.invoiceCount += 1;
    map.set(c.id, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export interface AgingBucket {
  label: "current" | "30" | "60" | "90+";
  amount: number;
  count: number;
}

export async function getAgingReport(userId: string): Promise<AgingBucket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("total_amount, due_date, status")
    .eq("user_id", userId)
    .in("status", ["sent", "overdue"] as InvoiceStatus[]);
  if (error) throw error;

  const buckets: Record<AgingBucket["label"], AgingBucket> = {
    current: { label: "current", amount: 0, count: 0 },
    "30": { label: "30", amount: 0, count: 0 },
    "60": { label: "60", amount: 0, count: 0 },
    "90+": { label: "90+", amount: 0, count: 0 },
  };

  const today = new Date();
  for (const row of data ?? []) {
    const amt = Number(row.total_amount ?? 0);
    const due = row.due_date ? new Date(row.due_date as string) : null;
    const daysOver = due
      ? Math.floor((today.getTime() - due.getTime()) / 86_400_000)
      : -1;

    let key: AgingBucket["label"];
    if (daysOver < 30) key = "current";
    else if (daysOver < 60) key = "30";
    else if (daysOver < 90) key = "60";
    else key = "90+";

    buckets[key].amount += amt;
    buckets[key].count += 1;
  }

  return [buckets.current, buckets["30"], buckets["60"], buckets["90+"]];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export async function getMonthlyRevenue(userId: string, months = 12): Promise<MonthlyRevenue[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  const sinceISO = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("invoices")
    .select("issue_date, total_amount, status")
    .eq("user_id", userId)
    .eq("status", "paid")
    .gte("issue_date", sinceISO);
  if (error) throw error;

  const now = new Date();
  const labels: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    labels.push({ key, label: d.toLocaleDateString("en-US", { month: "short" }) });
  }
  const bucket = new Map(labels.map((m) => [m.key, 0]));
  for (const r of data ?? []) {
    const key = (r.issue_date as string).slice(0, 7);
    if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + Number(r.total_amount ?? 0));
  }
  return labels.map((m) => ({
    month: m.label,
    revenue: Number((bucket.get(m.key) ?? 0).toFixed(2)),
  }));
}
