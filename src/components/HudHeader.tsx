"use client";

import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

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
    <header className="relative w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-hud-cyan/20 bg-space-black/80 backdrop-blur-sm z-10 font-mono">
      {/* Decorative Top Left Corner Bracket */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hud-cyan opacity-80" />
      
      <div className="flex items-center space-x-3 text-hud-cyan">
        <Terminal size={24} className="animate-pulse" />
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-bold tracking-widest uppercase shadow-hud-cyan drop-shadow-md">
            E.D.I.T.H. Tactical Command
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

      {/* Decorative Bottom Right Corner Bracket */}
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-hud-cyan opacity-80" />
    </header>
  );
}
