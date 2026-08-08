"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Shield } from "lucide-react";

export default function HudHeader() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format to 12-hour AM/PM string, e.g., "09:05 PM"
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTime(timeString);
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="relative w-full p-4 md:p-6 border-b border-hud-cyan/20 bg-space-black/80 backdrop-blur-sm z-10 font-mono">
      {/* Decorative Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-red opacity-80" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hud-cyan opacity-80" />

      {/* Top Row: Title + Clock */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center space-x-3 text-hud-cyan">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Shield size={26} className="text-cyber-red" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold tracking-widest uppercase drop-shadow-md">
              E.D.I.T.H. <span className="text-cyber-red">Tactical Command</span>
            </h1>
            <p className="text-xs text-hud-cyan/70 tracking-wide hidden md:block">
              Engine for Diff Investigation & Tracking the Hub
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          {/* Memory Indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cyber-red tracking-widest uppercase">
              Memory Sync
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-cyber-red animate-glow-pulse" />
          </div>

          {/* Live Clock */}
          <div className="px-3 py-1 bg-hud-cyan/10 border border-hud-cyan/30 rounded shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <span className="text-sm text-hud-cyan font-bold tracking-widest">
              {time || "--:-- --"}
            </span>
          </div>
        </div>
      </div>

      {/* Concept Tagline for Judges */}
      <motion.div
        className="mt-3 flex items-center space-x-2 text-xs text-white/50 tracking-wide"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Terminal size={12} className="text-cyber-red/60" />
        <p>
          <span className="text-white/70">Concept:</span>{" "}
          An autonomous AI agent that monitors the GitHub firehose, filters noise with LLM batch-processing, and surfaces only the architectural shifts that matter — hands-free.
        </p>
      </motion.div>

      {/* Decorative Bottom Brackets */}
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hud-cyan opacity-80" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-red opacity-80" />
    </header>
  );
}
