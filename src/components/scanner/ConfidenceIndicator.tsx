import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { ConfidenceReport } from "@/lib/foodAnalysis";
import { cn } from "@/lib/utils";

const STYLES = {
  high: { dot: "🟢", tw: "text-macro-fiber", bg: "bg-macro-fiber/12", icon: ShieldCheck, label: "High confidence" },
  medium: { dot: "🟡", tw: "text-macro-fat", bg: "bg-macro-fat/12", icon: ShieldQuestion, label: "Medium confidence" },
  low: { dot: "🔴", tw: "text-macro-calories", bg: "bg-macro-calories/12", icon: ShieldAlert, label: "Low confidence" },
} as const;

export function ConfidenceBadge({ report }: { report: ConfidenceReport }) {
  const s = STYLES[report.level];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.bg, s.tw)}>
      <Icon className="h-3.5 w-3.5" />
      {report.score}% · {report.level}
    </span>
  );
}

export function ConfidenceDetail({ report }: { report: ConfidenceReport }) {
  const s = STYLES[report.level];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={cn("flex items-center gap-2 text-sm font-semibold", s.tw)}>
          {s.dot} {s.label}
        </span>
        <span className="tabular text-sm font-semibold">{report.score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all")}
          style={{
            width: `${report.score}%`,
            background:
              report.level === "high"
                ? "hsl(var(--macro-fiber))"
                : report.level === "medium"
                  ? "hsl(var(--macro-fat))"
                  : "hsl(var(--macro-calories))",
          }}
        />
      </div>
      <ul className="space-y-1">
        {report.reasons.map((r, i) => (
          <li key={i} className="flex gap-2 text-xs text-muted-foreground">
            <span className="text-muted-foreground/60">•</span>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
