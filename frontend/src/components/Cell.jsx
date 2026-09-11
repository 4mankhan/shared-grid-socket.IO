"use client";

import { memo } from "react";
import { motion } from "framer-motion";

const Cell = memo(function Cell({
  row,
  column,
  owner,
  color,
  isRecentlyUpdated,
  isOwnedByCurrentUser,
  onClaim,
  disabled,
}) {
  const isEmpty = !owner;

  const handleClick = () => {
    if (disabled || !isEmpty) {
      return;
    }

    onClaim(row, column);
  };

  return (
    <motion.button
      type="button"
      aria-label={`Cell ${row}, ${column}${owner ? ` owned by ${owner}` : ""}`}
      onClick={handleClick}
      disabled={disabled || !isEmpty}
      initial={false}
      animate={
        isRecentlyUpdated
          ? { scale: [1, 1.35, 1], opacity: [1, 0.85, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={[
        "relative aspect-square w-full rounded-[3px] border transition-all duration-200",
        isEmpty
          ? "cursor-pointer border-white/5 bg-zinc-800/80 hover:border-violet-400/50 hover:bg-zinc-700/90 hover:shadow-[0_0_12px_rgba(139,92,246,0.35)]"
          : "cursor-default border-white/10",
        isOwnedByCurrentUser ? "ring-1 ring-white/40" : "",
        disabled && isEmpty ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
      style={
        !isEmpty
          ? {
              backgroundColor: color || "#52525b",
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 10px ${color || "#52525b"}33`,
            }
          : undefined
      }
      title={
        isEmpty
          ? `Claim cell (${row}, ${column})`
          : `${owner} • (${row}, ${column})`
      }
    />
  );
});

export default Cell;
