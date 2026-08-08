"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Link as LinkIcon, Cpu } from "lucide-react";
import type { Post } from "@/types/edith";

interface FeedCardProps {
  post: Post;
}

export default function FeedCard({ post }: FeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedTime, setFormattedTime] = useState("");
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Formatting timestamp locally on the client to avoid hydration mismatch
  useEffect(() => {
    try {
      const date = new Date(post.createdAt);
      setFormattedTime(
        date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch {
      setFormattedTime(post.createdAt);
    }
  }, [post.createdAt]);

  // ── 3D Tilt Logic ──────────────────────────────────────────────────────────
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse position to rotation (-10 to 10 degrees)
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Normalize coordinates from -0.5 to 0.5
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full max-w-3xl mb-8 group perspective-[1000px]"
    >
      {/* Background glass layer */}
      <div 
        className="absolute inset-0 bg-space-black/50 backdrop-blur-md rounded-lg border border-hud-cyan/20 shadow-[0_0_15px_rgba(0,240,255,0.05)] transition-colors duration-300 group-hover:border-hud-cyan/50 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
        style={{ transform: "translateZ(-10px)" }}
      />
      
      {/* Content layer */}
      <div 
        className="relative p-6 font-mono text-white flex flex-col"
        style={{ transform: "translateZ(20px)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b border-hud-cyan/20 pb-3">
          <div className="flex items-center space-x-3">
            <Cpu size={20} className="text-hud-cyan" />
            <span className="text-xs uppercase tracking-widest text-hud-cyan/70">
              Intelligence Brief
            </span>
          </div>
          <div className="text-xs text-hud-cyan opacity-80 tracking-wide bg-hud-cyan/10 px-2 py-1 rounded border border-hud-cyan/30">
            {formattedTime}
          </div>
        </div>

        {/* Intelligence Text */}
        <p className="text-sm md:text-base leading-relaxed text-white/90 mb-4 whitespace-pre-wrap">
          {post.text}
        </p>

        {/* Sources */}
        {post.sources && post.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.sources.map((source, idx) => (
              <a
                key={idx}
                href={source}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs text-hud-cyan hover:text-white transition-colors bg-hud-cyan/5 hover:bg-hud-cyan/20 px-2 py-1 rounded-sm border border-hud-cyan/20"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon size={12} />
                <span className="truncate max-w-[200px]">
                  {new URL(source).hostname}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Expandable Rationale Accordion */}
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-cyber-red/80 hover:text-cyber-red transition-colors focus:outline-none"
          >
            <span>Publishing Rationale</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 bg-cyber-red/10 border-l-2 border-cyber-red text-sm text-white/80 rounded-r-sm">
                  {post.rationale}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-hud-cyan" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-hud-cyan" />
      </div>
    </motion.div>
  );
}
