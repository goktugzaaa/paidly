"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCountry } from "@/lib/countries";

interface StepData {
  country?: string;
  business_name?: string;
  email?: string;
  tax_id?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_swift?: string;
  bank_account?: string;
}

export async function saveOnboardingAction(data: StepData, complete = false) {
  const { supabase, user } = await requireUser();

  // derive default currency from country if provided
  const country = data.country ? data.country.toUpperCase() : undefined;
  const preset = country ? getCountry(country) : null;
  const default_currency = preset?.currency ?? undefined;

  const patch: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (country !== undefined) patch.country = country || null;
  if (default_currency) patch.default_currency = default_currency;
  if (data.business_name !== undefined) patch.business_name = data.business_name || null;
  if (data.email !== undefined) patch.email = data.email || null;
  if (data.tax_id !== undefined) patch.tax_id = data.tax_id || null;
  if (data.bank_name !== undefined) patch.bank_name = data.bank_name || null;
  if (data.bank_iban !== undefined) patch.bank_iban = data.bank_iban || null;
  if (data.bank_swift !== undefined) patch.bank_swift = data.bank_swift || null;
  if (data.bank_account !== undefined) patch.bank_account = data.bank_account || null;

  const { error } = await supabase
    .from("profiles")
    .upsert(patch, { onConflict: "user_id" });

  if (error) return { ok: false as const, error: error.message };

  if (complete) {
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    redirect("/dashboard?flash=profileSaved");
  }

  return { ok: true as const };
}

export async function skipOnboardingAction() {
  const { supabase, user } = await requireUser();
  // Mark as onboarded by setting a minimal business_name placeholder if empty,
  // so the auto-redirect doesn't keep bouncing them back.
  const { data } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data?.business_name) {
    await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          business_name: user.email?.split("@")[0] ?? "My business",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
  }
  redirect("/dashboard");
}
