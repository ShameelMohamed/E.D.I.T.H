"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FeedLoader from "@/components/FeedLoader";
import FeedCard from "@/components/FeedCard";
import type { FeedResponse } from "@/types/edith";

export default function FeedList() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") || process.env.NEXT_PUBLIC_EDITH_AGENT_ID;

  const [posts, setPosts] = useState<FeedResponse["posts"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/agent/feed?agentId=${agentId}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch feed data.");
        }
        
        const data = (await res.json()) as FeedResponse;
        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [agentId]);

  // Framer Motion variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
  };

  // ── Missing Agent ID State ────────────────────────────────────────────────
  if (!agentId) {
    return (
      <div className="w-full max-w-4xl bg-space-black/40 border border-hud-cyan/20 backdrop-blur-md rounded p-6 shadow-[0_0_15px_rgba(0,240,255,0.05)] font-mono text-center">
        <div className="inline-block px-3 py-1 mb-4 border border-cyber-red/50 text-cyber-red text-xs uppercase tracking-widest rounded animate-pulse">
          Agent Identity Required
        </div>
        <h2 className="text-xl md:text-2xl text-white mb-2">
          No Agent ID Provided
        </h2>
        <p className="text-sm text-hud-cyan/60 mb-6">
          Provide an agentId in the URL query parameters to view the intelligence feed.
        </p>
        <div className="text-xs text-white/40 bg-black/50 p-3 rounded overflow-x-auto">
          Example: <code>/?agentId=YOUR_AGENT_ID</code>
        </div>
      </div>
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return <FeedLoader />;
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full max-w-2xl bg-cyber-red/10 border border-cyber-red/30 backdrop-blur-md rounded p-6 font-mono text-center mx-auto">
        <div className="text-cyber-red text-sm uppercase tracking-widest mb-2">
          Uplink Failure
        </div>
        <p className="text-white/80 text-sm">{error}</p>
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────
  if (posts.length === 0) {
    return (
      <div className="w-full max-w-4xl bg-space-black/40 border border-hud-cyan/20 backdrop-blur-md rounded p-12 shadow-[0_0_15px_rgba(0,240,255,0.05)] font-mono text-center">
        <div className="inline-block px-3 py-1 mb-4 border border-hud-cyan/50 text-hud-cyan text-xs uppercase tracking-widest rounded opacity-70">
          Feed Empty
        </div>
        <h2 className="text-lg text-white mb-2">
          No Intelligence Reports Found
        </h2>
        <p className="text-sm text-hud-cyan/50">
          E.D.I.T.H. has not yet published any intelligence briefs for this agent.
        </p>
      </div>
    );
  }

  // ── Success State ─────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl flex flex-col items-center px-4 md:px-0"
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={itemVariants} className="w-full flex justify-center">
          <FeedCard post={post as any} />
        </motion.div>
      ))}
    </motion.div>
  );
}
