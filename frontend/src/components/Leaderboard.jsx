"use client";

import { Trophy } from "lucide-react";

export default function Leaderboard({ entries, currentUsername }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004aad]">
          <Trophy className="h-4.5 w-4.5 text-white" />
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-white">
          Leaderboard
        </h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No territories claimed yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.username}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all",
                entry.username === currentUsername
                  ? "border-[#004aad]/50 bg-[#004aad]/10"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-medium text-zinc-500">
                  {index + 1}
                </span>

                <span
                  className="h-3 w-3 rounded-full ring-2 ring-white/10"
                  style={{ backgroundColor: entry.color || "#71717a" }}
                />

                <span className="text-sm font-medium text-zinc-100">
                  {entry.username}
                </span>
              </div>

              <span className="text-sm font-semibold text-white/80">
                {entry.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}