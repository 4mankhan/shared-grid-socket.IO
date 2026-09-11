"use client";

import { Palette, User, Users } from "lucide-react";

const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];

export default function UserPanel({
  user,
  selectedColor,
  onColorChange,
  onlineUsers,
  claimedCount,
  cooldownRemaining,
}) {
  if (!user) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <div className="space-y-5">
        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#004aad]">
            <User className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Playing as
            </p>
            <p className="text-lg font-semibold tracking-tight text-white">
              {user.username}
            </p>
          </div>
        </div>

        {/* Color */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
            <Palette className="h-4 w-4" />
            <span>Your color</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select color ${color}`}
                onClick={() => onColorChange(color)}
                className={[
                  "h-8 rounded-full border transition-all hover:scale-105",
                  selectedColor === color
                    ? "border-white ring-2 ring-[#004aad]"
                    : "border-white/10",
                ].join(" ")}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs text-zinc-500">Cells claimed</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {claimedCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs text-zinc-500">Cooldown</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {cooldownRemaining > 0 ? `${cooldownRemaining}s` : "Ready"}
            </p>
          </div>
        </div>

        {/* Online users */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
            <Users className="h-4 w-4" />
            <span>Online users ({onlineUsers.length})</span>
          </div>

          <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
            {onlineUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No other users online
              </p>
            ) : (
              onlineUsers.map((onlineUser) => (
                <div
                  key={onlineUser.username}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm transition hover:bg-white/[0.07]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                    style={{
                      backgroundColor: onlineUser.color || "#71717a",
                    }}
                  />

                  <span className="text-zinc-200">
                    {onlineUser.username}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}