'use client';

import Button from "@/shared/ui/Button";

export default function HubHero({ title, tagline, cta, subtle }) {
  return (
    <div className="card p-8 flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-zinc-300 max-w-2xl">{tagline}</p>
      {subtle && <p className="text-xs text-zinc-500">{subtle}</p>}
      {cta && (
        <div className="flex gap-3">
          <Button>{cta.primaryLabel}</Button>
          {cta.secondaryLabel && (
            <Button variant="outline">{cta.secondaryLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
