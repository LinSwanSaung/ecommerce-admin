import { Skeleton } from "@/components/ui/skeleton";

// Route-level loading UI (Next file convention): shown inside the admin shell
// while a page in this group is server-rendering.
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
