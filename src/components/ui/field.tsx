import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  /** Optional value shown on the right of the label row. */
  trailing?: React.ReactNode;
}

/** Consistent labelled form row used across input panels. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
  trailing,
}: FieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
