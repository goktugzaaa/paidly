import { requireUser } from "@/lib/auth";
import { getActionItems } from "@/services/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ActionItems } from "@/components/dashboard/ActionItems";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AttentionPage() {
  const { user } = await requireUser();
  const [t, items] = await Promise.all([getDict(), getActionItems(user.id, 200)]);

  // Group by kind
  const grouped: Record<string, typeof items> = {
    chase_overdue: [],
    send_draft: [],
    due_soon: [],
    just_paid: [],
  };
  for (const it of items) grouped[it.kind].push(it);

  const groups: { kind: string; title: string; items: typeof items }[] = [
    { kind: "chase_overdue", title: "Overdue", items: grouped.chase_overdue },
    { kind: "send_draft", title: "Drafts (3+ days)", items: grouped.send_draft },
    { kind: "due_soon", title: "Due soon", items: grouped.due_soon },
    { kind: "just_paid", title: "Just paid", items: grouped.just_paid },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.nav.attention}
        title={t.actions.title}
        description={t.actions.sub}
      />

      {items.length === 0 ? (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 py-8 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-slate-600 dark:text-slate-400">{t.actions.empty}</span>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <Card key={g.kind}>
                <CardHeader>
                  <CardTitle>
                    {g.title}{" "}
                    <span className="ml-1 font-mono text-xs text-slate-400 dark:text-slate-500">
                      ({g.items.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardBody className="p-0">
                  <ActionItems items={g.items} />
                </CardBody>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
