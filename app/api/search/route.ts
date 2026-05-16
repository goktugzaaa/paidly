import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const { supabase, user } = await requireUser();

  if (!q) {
    return NextResponse.json({ clients: [], invoices: [] });
  }

  const like = `%${q}%`;

  const [clientsRes, invoicesRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, company, email")
      .eq("user_id", user.id)
      .or(`name.ilike.${like},email.ilike.${like},company.ilike.${like}`)
      .limit(6),
    supabase
      .from("invoices")
      .select("id, invoice_number, status, total_amount, currency, client:clients(name)")
      .eq("user_id", user.id)
      .ilike("invoice_number", like)
      .limit(6),
  ]);

  return NextResponse.json({
    clients: clientsRes.data ?? [],
    invoices: (invoicesRes.data ?? []).map((i) => ({
      ...i,
      client: Array.isArray(i.client) ? i.client[0] : i.client,
    })),
  });
}
