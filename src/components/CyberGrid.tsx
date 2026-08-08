"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CyberGrid() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-space-black pointer-events-none perspective-[1000px]">
      <motion.div
        className="absolute inset-[-50%] w-[200%] h-[200%]"
        animate={{
          rotateX: mousePosition.y * 5 + 60, // Base tilt of 60deg, shifting slightly
          rotateY: mousePosition.x * 5,
          z: -200,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
          backgroundImage: `
            linear-gradient(to right, rgba(0, 240, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "4rem 4rem",
          backgroundPosition: "center center",
          // Add a glowing fade out towards the edges
          maskImage: "radial-gradient(circle at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 20%, transparent 70%)",
        }}
      >
        {/* Moving scanline effect across the grid */}
        <motion.div 
          className="absolute inset-0 w-full h-[200%] bg-gradient-to-b from-transparent via-hud-cyan/10 to-transparent"
          animate={{
            y: ["-100%", "100%"]
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity
          }}
        />
      </motion.div>
      
      {/* Vignette overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#090A0F_100%)] opacity-80" />
    </div>
  );
}
