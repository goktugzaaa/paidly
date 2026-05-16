import { createClient } from "@/lib/supabase/server";
import type {
  InvoiceWithClient,
  InvoiceWithItems,
  InvoiceItem,
  InvoiceStatus,
} from "@/types/db";

export type InvoicePeriod = "week" | "month" | "quarter" | "year" | "all";

export interface ListInvoicesParams {
  q?: string;
  status?: InvoiceStatus | "all";
  clientId?: string;
  period?: InvoicePeriod;
  page?: number;
  pageSize?: number;
}

export interface PeriodSummary {
  count: number;
  total: number;
  paid: number;
  unpaid: number;
  currency: string;
}

export interface ListInvoicesResult {
  invoices: InvoiceWithClient[];
  total: number;
  page: number;
  pageSize: number;
  summary: PeriodSummary;
}

function periodStartISO(p: InvoicePeriod): string | null {
  if (p === "all") return null;
  const d = new Date();
  if (p === "week") d.setDate(d.getDate() - 7);
  else if (p === "month") d.setMonth(d.getMonth() - 1);
  else if (p === "quarter") d.setMonth(d.getMonth() - 3);
  else if (p === "year") d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export async function listInvoices(
  userId: string,
  params: ListInvoicesParams = {}
): Promise<ListInvoicesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const periodSince = periodStartISO(params.period ?? "all");

  function applyFilters<T extends { ilike: Function; eq: Function; gte: Function }>(q: T): T {
    let out = q;
    if (params.q && params.q.trim()) {
      out = out.ilike("invoice_number", `%${params.q.trim()}%`) as T;
    }
    if (params.status && params.status !== "all") {
      out = out.eq("status", params.status) as T;
    }
    if (params.clientId) {
      out = out.eq("client_id", params.clientId) as T;
    }
    if (periodSince) {
      out = out.gte("issue_date", periodSince) as T;
    }
    return out;
  }

  const baseQuery = supabase
    .from("invoices")
    .select("*, client:clients(id,name,email,company)", { count: "exact" })
    .eq("user_id", userId)
    .order("issue_date", { ascending: false })
    .range(from, to);

  const summaryQuery = supabase
    .from("invoices")
    .select("total_amount, currency, status")
    .eq("user_id", userId);

  const [listRes, sumRes] = await Promise.all([
    applyFilters(baseQuery),
    applyFilters(summaryQuery),
  ]);

  if (listRes.error) throw listRes.error;
  if (sumRes.error) throw sumRes.error;

  const sumRows = sumRes.data ?? [];
  const summary: PeriodSummary = {
    count: sumRows.length,
    total: sumRows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0),
    paid: sumRows
      .filter((r) => r.status === "paid")
      .reduce((s, r) => s + Number(r.total_amount ?? 0), 0),
    unpaid: sumRows
      .filter((r) => ["sent", "overdue"].includes(r.status as string))
      .reduce((s, r) => s + Number(r.total_amount ?? 0), 0),
    currency: (sumRows[0]?.currency as string) || "USD",
  };

  return {
    invoices: (listRes.data ?? []) as InvoiceWithClient[],
    total: listRes.count ?? 0,
    page,
    pageSize,
    summary,
  };
}

export async function getInvoice(userId: string, id: string): Promise<InvoiceWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, client:clients(id,name,email,company), items:invoice_items(*)")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const items = ((data as { items?: InvoiceItem[] }).items ?? [])
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
  return { ...(data as InvoiceWithItems), items };
}

export async function getActiveClientsForSelect(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, company")
    .eq("user_id", userId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}
