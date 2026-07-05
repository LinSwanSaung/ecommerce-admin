"use client";

import { Columns3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Show/hide table columns. Visibility is view-local state (not URL); the page
// filters its columns array before passing it to DataTable.
export function ColumnToggle({
  columns,
  hidden,
  onToggle,
}: {
  columns: { key: string; header: string }[];
  hidden: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" aria-label="Toggle columns" />}
      >
        <Columns3 />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={!hidden.includes(col.key)}
            onCheckedChange={() => onToggle(col.key)}
            closeOnClick={false} // keep the menu open while toggling several
          >
            {col.header}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
