import { createClient } from "@/lib/supabase/server";

export type ActionKind = "send_draft" | "chase_overdue" | "due_soon" | "just_paid";

export interface ActionItem {
  kind: ActionKind;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string | null;
  days: number;
  amount: number;
  currency: string;
}

const DAY = 86_400_000;

export async function getActionItems(userId: string): Promise<ActionItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total_amount, currency, created_at, due_date, sent_at, paid_at, client:clients(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;

  const items: ActionItem[] = [];
  const now = Date.now();

  for (const row of data ?? []) {
    const client = (row as { client?: { name?: string | null } | { name?: string | null }[] }).client;
    const clientName = Array.isArray(client) ? client[0]?.name ?? null : client?.name ?? null;
    const base = {
      invoiceId: row.id as string,
      invoiceNumber: row.invoice_number as string,
      clientName,
      amount: Number(row.total_amount ?? 0),
      currency: (row.currency as string) || "USD",
    };

    if (row.status === "draft") {
      const days = Math.floor((now - new Date(row.created_at as string).getTime()) / DAY);
      if (days >= 3) items.push({ ...base, kind: "send_draft", days });
    } else if (row.status === "overdue" || (row.status === "sent" && row.due_date && new Date(row.due_date as string).getTime() < now)) {
      const due = row.due_date ? new Date(row.due_date as string).getTime() : now;
      const days = Math.max(1, Math.floor((now - due) / DAY));
      items.push({ ...base, kind: "chase_overdue", days });
    } else if (row.status === "sent" && row.due_date) {
      const due = new Date(row.due_date as string).getTime();
      const days = Math.ceil((due - now) / DAY);
      if (days >= 0 && days <= 7) items.push({ ...base, kind: "due_soon", days });
    } else if (row.status === "paid" && row.paid_at) {
      const days = Math.floor((now - new Date(row.paid_at as string).getTime()) / DAY);
      if (days <= 3) items.push({ ...base, kind: "just_paid", days });
    }
  }

  // Sort: overdue > due_soon > send_draft > just_paid
  const order: Record<ActionKind, number> = {
    chase_overdue: 0,
    send_draft: 1,
    due_soon: 2,
    just_paid: 3,
  };
  items.sort((a, b) => order[a.kind] - order[b.kind] || b.days - a.days);

  return items.slice(0, 6);
}

export async function getRevenueDelta(userId: string, rangeDays: number): Promise<number | null> {
  const supabase = await createClient();
  const now = new Date();
  const curStart = new Date(now.getTime() - rangeDays * DAY).toISOString().slice(0, 10);
  const prevStart = new Date(now.getTime() - 2 * rangeDays * DAY).toISOString().slice(0, 10);
  const prevEnd = new Date(now.getTime() - rangeDays * DAY - DAY).toISOString().slice(0, 10);

  const [curRes, prevRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("total_amount")
      .eq("user_id", userId)
      .eq("status", "paid")
      .gte("issue_date", curStart),
    supabase
      .from("invoices")
      .select("total_amount")
      .eq("user_id", userId)
      .eq("status", "paid")
      .gte("issue_date", prevStart)
      .lte("issue_date", prevEnd),
  ]);

  const cur = (curRes.data ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  const prev = (prevRes.data ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  if (prev === 0) return cur > 0 ? 100 : null;
  return ((cur - prev) / prev) * 100;
}
