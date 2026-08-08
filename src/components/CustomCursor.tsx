"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WebLine {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
}

let lineIdCounter = 0;

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [webLines, setWebLines] = useState<WebLine[]>([]);

  const shootWeb = useCallback((x: number, y: number) => {
    const newLines: WebLine[] = [];
    const numLines = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numLines; i++) {
      newLines.push({
        id: lineIdCounter++,
        x,
        y,
        angle: (360 / numLines) * i + (Math.random() * 20 - 10),
        length: 30 + Math.random() * 50,
      });
    }
    setWebLines((prev) => [...prev, ...newLines]);
    setTimeout(() => {
      setWebLines((prev) => prev.filter((l) => !newLines.some((n) => n.id === l.id)));
    }, 600);
  }, []);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      shootWeb(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [shootWeb]);

  return (
    <>
      {/* Spider-Web Burst on Click */}
      <AnimatePresence>
        {webLines.map((line) => (
          <motion.div
            key={line.id}
            className="fixed pointer-events-none z-[9997]"
            style={{
              left: line.x,
              top: line.y,
              width: `${line.length}px`,
              height: "1px",
              background: "linear-gradient(90deg, rgba(226,54,54,0.8), rgba(226,54,54,0))",
              transformOrigin: "0 0",
              rotate: `${line.angle}deg`,
            }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Main Cursor — Spider-Man Reticle */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isClicking ? 0.6 : isHovering ? 1.6 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 35,
          mass: 0.1,
        }}
      >
        {/* Spider-Web crosshair SVG */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          {/* Outer ring */}
          <circle
            cx="16" cy="16" r="14"
            stroke="rgba(226,54,54,0.6)" strokeWidth="1.5" fill="none"
          />
          {/* Inner ring */}
          <circle
            cx="16" cy="16" r="6"
            stroke="rgba(226,54,54,0.4)" strokeWidth="1" fill="none"
          />
          {/* Crosshair lines (web strands) */}
          <line x1="16" y1="2" x2="16" y2="10" stroke="rgba(226,54,54,0.5)" strokeWidth="1" />
          <line x1="16" y1="22" x2="16" y2="30" stroke="rgba(226,54,54,0.5)" strokeWidth="1" />
          <line x1="2" y1="16" x2="10" y2="16" stroke="rgba(226,54,54,0.5)" strokeWidth="1" />
          <line x1="22" y1="16" x2="30" y2="16" stroke="rgba(226,54,54,0.5)" strokeWidth="1" />
          {/* Diagonal web strands */}
          <line x1="5" y1="5" x2="11" y2="11" stroke="rgba(226,54,54,0.3)" strokeWidth="0.8" />
          <line x1="27" y1="5" x2="21" y2="11" stroke="rgba(226,54,54,0.3)" strokeWidth="0.8" />
          <line x1="5" y1="27" x2="11" y2="21" stroke="rgba(226,54,54,0.3)" strokeWidth="0.8" />
          <line x1="27" y1="27" x2="21" y2="21" stroke="rgba(226,54,54,0.3)" strokeWidth="0.8" />
          {/* Center dot */}
          <circle cx="16" cy="16" r="1.5" fill="rgba(226,54,54,0.9)" />
        </svg>
      </motion.div>

      {/* Trailing Ghost Glow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] w-14 h-14 rounded-full"
        animate={{
          x: mousePosition.x - 28,
          y: mousePosition.y - 28,
          scale: isHovering ? 1.3 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
          mass: 0.8,
        }}
        style={{
          background: "radial-gradient(circle, rgba(226, 54, 54, 0.2) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 100%)",
          filter: "blur(10px)",
        }}
      />
    </>
  );
}
