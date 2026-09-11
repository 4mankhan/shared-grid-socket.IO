"use client";

export default function GridSkeleton() {
  return (
    <div className="glass-card animate-pulse p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-4 w-20 rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-10 gap-1 sm:grid-cols-15 md:grid-cols-20">
        {Array.from({ length: 100 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-[3px] bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}
