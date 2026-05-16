"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Brand } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { getCountry } from "@/lib/countries";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { saveOnboardingAction, skipOnboardingAction } from "./actions";

interface State {
  country: string;
  business_name: string;
  email: string;
  tax_id: string;
  bank_name: string;
  bank_iban: string;
  bank_swift: string;
  bank_account: string;
}

const TOTAL_STEPS = 3;

export function OnboardingWizard({ initial }: { initial: State }) {
  const t = useT();
  const [step, setStep] = useState(1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<State>(initial);
  const preset = getCountry(data.country);

  function update(k: keyof State, v: string) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function persist(complete = false) {
    setError(null);
    start(async () => {
      const r = await saveOnboardingAction(data, complete);
      if (r && "ok" in r && r.ok === false) {
        setError(r.error);
      } else if (complete) {
        setDone(true);
      }
    });
  }

  function onContinue() {
    if (step < TOTAL_STEPS) {
      persist(false);
      setStep((s) => s + 1);
    } else {
      persist(true);
    }
  }

  function onBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  if (done) {
    return <Done />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f7f4] text-slate-900">
      {/* atmospheric blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-brand-200/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-tl from-cyan-200/40 to-transparent blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Brand size="md" href="/dashboard" />
        <button
          type="button"
          onClick={() => skipOnboardingAction()}
          className="text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-slate-900"
        >
          {t.onboarding.skip} →
        </button>
      </header>

      <div className="relative mx-auto max-w-2xl px-6 py-10 sm:py-16">
        {/* Eyebrow + title */}
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-slate-500">
          — {t.onboarding.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          {t.onboarding.title}{" "}
          <span className="font-serif italic text-slate-500">{t.onboarding.titleAccent}</span>
        </h1>
        <p className="mt-3 text-sm text-slate-600">{t.onboarding.sub}</p>

        {/* Progress */}
        <div className="mt-10 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "todo";
            return (
              <div
                key={n}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  state === "done" && "bg-slate-900",
                  state === "active" && "bg-slate-900",
                  state === "todo" && "bg-slate-200"
                )}
              />
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          {t.onboarding.stepLabel(step, TOTAL_STEPS)}
        </p>

        {/* Step content */}
        <div className="mt-10 space-y-5">
          {step === 1 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{t.onboarding.step1Title}</h2>
                <p className="mt-1 text-sm text-slate-600">{t.onboarding.step1Sub}</p>
              </div>
              <CountrySelect
                name="country"
                label={t.onboarding.step1CountryLabel}
                value={data.country}
                onChange={(v) => update("country", v)}
                hint={t.onboarding.step1CountryHint}
                required
              />
              {preset && (
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                  <Meta label="Currency" value={preset.currency} />
                  <Meta label="Tax label" value={preset.taxLabel} />
                  <Meta label="Invoice word" value={preset.invoiceWord} />
                  <Meta label="Tax ID label" value={preset.taxIdLabel} />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{t.onboarding.step2Title}</h2>
                <p className="mt-1 text-sm text-slate-600">{t.onboarding.step2Sub}</p>
              </div>
              <Input
                label={t.onboarding.step2NameLabel}
                value={data.business_name}
                onChange={(e) => update("business_name", e.target.value)}
                placeholder={t.onboarding.step2NamePh}
                required
              />
              <Input
                label={t.onboarding.step2EmailLabel}
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder={t.onboarding.step2EmailPh}
              />
              <Input
                label={preset ? `${t.onboarding.step2TaxLabel} (${preset.taxIdLabel})` : t.onboarding.step2TaxLabel}
                value={data.tax_id}
                onChange={(e) => update("tax_id", e.target.value)}
                placeholder={t.onboarding.step2TaxPh}
              />
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{t.onboarding.step3Title}</h2>
                <p className="mt-1 text-sm text-slate-600">{t.onboarding.step3Sub}</p>
              </div>
              <Input
                label={t.onboarding.step3BankNameLabel}
                value={data.bank_name}
                onChange={(e) => update("bank_name", e.target.value)}
                placeholder="—"
              />
              <Input
                label={t.onboarding.step3IbanLabel}
                value={data.bank_iban}
                onChange={(e) => update("bank_iban", e.target.value)}
                placeholder="—"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label={t.onboarding.step3SwiftLabel}
                  value={data.bank_swift}
                  onChange={(e) => update("bank_swift", e.target.value)}
                  placeholder="—"
                />
                <Input
                  label={t.onboarding.step3AccountLabel}
                  value={data.bank_account}
                  onChange={(e) => update("bank_account", e.target.value)}
                  placeholder="—"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-10 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={step === 1 || pending}
            className={cn(step === 1 && "invisible")}
          >
            ← {t.onboarding.back}
          </Button>
          <Button
            type="button"
            onClick={onContinue}
            loading={pending}
            disabled={(step === 1 && !data.country) || (step === 2 && !data.business_name)}
          >
            {step === TOTAL_STEPS ? t.onboarding.finish : t.onboarding.next} →
          </Button>
        </div>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Done() {
  const t = useT();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-slate-500">
          — {t.onboarding.eyebrow}
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.025em]">
          {t.onboarding.doneTitle}
        </h1>
        <p className="mt-3 text-sm text-slate-600">{t.onboarding.doneSub}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/invoices/new">
            <Button>{t.onboarding.doneCreateInvoice}</Button>
          </Link>
          <Link href="/clients/new">
            <Button variant="outline">{t.onboarding.doneAddClient}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
