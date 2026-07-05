"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";
import type { Option } from "@/lib/constants";

// A dropdown filter bound to a URL param. "all" clears the param (no filter).
export function FilterSelect({
  paramKey,
  label,
  options,
}: {
  paramKey: string;
  label: string;
  options: Option[];
}) {
  const { get, setParams } = useQueryParams();
  const value = get(paramKey) || "all";
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        setParams({
          [paramKey]: next && next !== "all" ? String(next) : null,
          page: null,
        })
      }
    >
      <SelectTrigger className="w-[150px]" aria-label={label}>
        <span className="truncate">{selected?.label ?? `All ${label}`}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
