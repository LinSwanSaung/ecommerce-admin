"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

// hero + thumbnail strip, so 1, 2 or 3 photos all look intentional
export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;
  const hero = images[selected] ?? images[0];

  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border bg-muted">
        <Image
          key={hero} // remount so the old photo never lingers while the next loads
          src={hero}
          alt={`${name} image ${selected + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, 448px"
          priority
          // uploaded images are data URLs; skip the optimizer for those
          unoptimized={hero.startsWith("data:")}
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={index === selected}
              onClick={() => setSelected(index)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border bg-muted transition-opacity",
                index === selected
                  ? "ring-2 ring-ring"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                unoptimized={src.startsWith("data:")}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
