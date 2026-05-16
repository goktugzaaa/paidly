import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/services/profile";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { MobileNav } from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  const profile = await getProfile(user.id);

  // First-time user — no business_name set yet → guide them to /onboarding
  if (!profile?.business_name) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={user.email ?? ""} businessName={profile?.business_name ?? null} />
        <MobileNav />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
