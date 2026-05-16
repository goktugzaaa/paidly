import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/services/profile";
import { OnboardingWizard } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { user } = await requireUser();
  const profile = await getProfile(user.id);

  // If already onboarded, send to dashboard
  if (profile?.business_name) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard
      initial={{
        country: profile?.country ?? "",
        business_name: profile?.business_name ?? "",
        email: profile?.email ?? user.email ?? "",
        tax_id: profile?.tax_id ?? "",
        bank_name: profile?.bank_name ?? "",
        bank_iban: profile?.bank_iban ?? "",
        bank_swift: profile?.bank_swift ?? "",
        bank_account: profile?.bank_account ?? "",
      }}
    />
  );
}
