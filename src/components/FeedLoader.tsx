"use client";

import { motion } from "framer-motion";

export default function FeedLoader() {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-hud-cyan opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
        />
        
        {/* Inner reverse rotating ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-cyber-red opacity-50"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        />
        
        {/* Core pulse */}
        <motion.div
          className="w-4 h-4 rounded-full bg-hud-cyan"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              "0 0 10px rgba(0, 240, 255, 0.2)",
              "0 0 30px rgba(0, 240, 255, 0.8)",
              "0 0 10px rgba(0, 240, 255, 0.2)",
            ]
          }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
      
      <motion.div 
        className="text-hud-cyan font-mono text-sm tracking-[0.3em] uppercase animate-pulse"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        Establishing Uplink...
      </motion.div>
    </div>
  );
}
