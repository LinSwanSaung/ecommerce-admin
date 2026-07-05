"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useQueryParams } from "@/hooks/use-query-params";

// Search box for the ?search= param; local state while typing, URL debounced.
export function SearchInput({ placeholder = "Search…" }: { placeholder?: string }) {
  const { get, setParams } = useQueryParams();
  const [term, setTerm] = useState(() => get("search"));
  const debounced = useDebouncedValue(term, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the mount run so refreshing a deep link (?search=x&page=3) doesn't
    // reset the page; only a real keystroke pushes a new search.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setParams({ search: debounced || null, page: null });
    // setParams is stable enough here; we only want this to run on new input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-8"
      />
    </div>
  );
}
