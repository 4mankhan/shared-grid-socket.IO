"use client";

import { BarChart3 } from "lucide-react";

export default function StatsBar({
  totalCells,
  claimedCells,
  availableCells,
}) {
  const claimedPercent =
    totalCells > 0 ? Math.round((claimedCells / totalCells) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004aad]">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-white">
          Territory Stats
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatItem label="Total" value={totalCells} />
        <StatItem label="Claimed" value={claimedCells} />
        <StatItem label="Available" value={availableCells} />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Claimed progress</span>
          <span className="text-zinc-400">{claimedPercent}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#004aad] transition-all duration-500"
            style={{ width: `${claimedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center transition hover:bg-white/[0.07]">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-xl font-semibold tracking-tight text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}