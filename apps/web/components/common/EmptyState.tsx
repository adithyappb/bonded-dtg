import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
