"use client";

import { Grid3x3, Radio } from "lucide-react";

export default function Navbar({ onlineCount }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004aad] shadow-lg shadow-violet-500/30">
            <Grid3x3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              PixelTerritory
            </h1>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Real-time collaborative grid
            </p>
          </div>
        </div>

       <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
  </span>

  <Radio className="h-4 w-4 text-white/60" />

  <span className="font-medium tracking-tight">
    {onlineCount} online
  </span>
</div>
      </div>
    </header>
  );
}
