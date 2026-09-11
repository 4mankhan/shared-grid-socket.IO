"use client";

import { Activity } from "lucide-react";

export default function ActivityFeed({ activities }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004aad]">
          <Activity className="h-4 w-4 text-white" />
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-white">
          Live Activity
        </h2>
      </div>

      <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Waiting for grid activity...
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
            >
              {activity.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}