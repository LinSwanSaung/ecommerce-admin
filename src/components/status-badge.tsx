import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";

// One badge for every status type; colors/labels come from constants.ts.
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", STATUS_BADGE[status])}
    >
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
