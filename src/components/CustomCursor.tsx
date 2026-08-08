"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if we are hovering over an interactive element
      if (
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Main Cursor (Glassmorphism 3D effect) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 35,
          mass: 0.1,
        }}
      >
        <div 
          className="relative w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(226, 54, 54, 0.4), rgba(59, 130, 246, 0.2))",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)"
          }}
        >
          {/* Inner dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>
      </motion.div>

      {/* Trailing Ghost (Glassmorphism glow) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] w-12 h-12 rounded-full"
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          scale: isHovering ? 1.3 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
          mass: 0.8,
        }}
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(226, 54, 54, 0.05) 70%, transparent 100%)",
          filter: "blur(8px)"
        }}
      />
    </>
  );
}
