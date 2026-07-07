"use client";

import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

// route error boundary, reset() re-renders the failed segment
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card>
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description={error.message || "An unexpected error occurred."}
        action={{ label: "Try again", onClick: reset }}
      />
    </Card>
  );
}
