"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

interface LikeButtonProps {
    blogId: string;
    initialLikes: number;
    initialLiked: boolean;
    isAuthenticated: boolean;
    userId: string | null;
    isBanned?: boolean;
}

export default function LikeButton({
    blogId,
    initialLikes,
    initialLiked,
    isAuthenticated,
    userId,
    isBanned = false,
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setLiked(initialLiked);
    }, [initialLiked]);

    const handleLike = async () => {
        if (liked || busy || isBanned) return;

        if (!isAuthenticated) {
            window.location.href = "/blogs/dashboard";
            return;
        }

        setBusy(true);
        setLiked(true);
        setLikeCount((c) => c + 1);

        try {
            const res = await fetch("/api/blogs/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "like", blogId }),
            });

            if (!res.ok) {
                // Revert on failure
                setLiked(false);
                setLikeCount((c) => c - 1);
            }
        } catch (err) {
            console.error("Failed to register like", err);
            setLiked(false);
            setLikeCount((c) => c - 1);
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked || busy || isBanned}
            aria-label={isBanned ? "Account Banned" : liked ? "Bookmarked" : "Bookmark this post"}
            className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-dmsans
        transition-all duration-300 select-none
        ${liked
                    ? "bg-indigo-500/20 text-indigo-400 cursor-default"
                    : isBanned
                        ? "bg-red-500/10 text-red-400/50 cursor-not-allowed border border-red-500/20"
                        : isAuthenticated
                            ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-indigo-400 cursor-pointer"
                            : "bg-white/5 text-white/30 cursor-pointer"
                }
      `}
        >
            <Bookmark
                className={`w-4 h-4 transition-all duration-300 ${liked ? "fill-indigo-400 text-indigo-400 scale-110" : ""} ${isBanned ? "text-red-400/40" : ""}`}
            />
            <span>{likeCount}</span>
        </button>
    );
}
