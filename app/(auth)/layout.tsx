import { Brand } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-transparent">
      {/* Brand gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-brand-200/50 to-transparent blur-3xl dark:from-brand-500/20" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-tl from-cyan-200/50 to-transparent blur-3xl dark:from-cyan-500/15" />
      </div>

      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand size="md" href="/" />
        </div>
        <div className="glass relative overflow-hidden rounded-2xl p-8 shadow-xl">
          {/* gradient strip */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" />
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          © 2026 Nib · <span className="text-slate-300 dark:text-slate-600">Built for the people who do the work.</span>
        </p>
      </div>
    </main>
  );
}
