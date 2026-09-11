"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export default function LoginModal({ onSubmit, isLoading, error }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#004aad]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Join the Grid
            </h2>
            <p className="text-sm text-zinc-400">
              Pick a username and start claiming territory
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your name"
              minLength={2}
              maxLength={24}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-[#004aad]/70 focus:ring-4 focus:ring-[#004aad]/20"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || username.trim().length < 2}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004aad] px-4 py-3 font-medium text-white transition hover:bg-[#0057c7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating profile...
              </>
            ) : (
              "Enter Grid"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}