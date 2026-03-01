"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
    blogId: string;
    initialLikes: number;
    isAuthenticated: boolean;
    userId: string | null;
}

function getLikedKey(blogId: string, userId: string | null) {
    // Scope the key to the user so different accounts have independent like state
    return userId ? `blog_liked_${blogId}_${userId}` : `blog_liked_${blogId}`;
}

export default function LikeButton({
    blogId,
    initialLikes,
    isAuthenticated,
    userId,
}: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(getLikedKey(blogId, userId));
            if (stored === "true") setLiked(true);
        } catch { }
    }, [blogId, userId]);

    const handleLike = async () => {
        if (liked || busy) return;

        if (!isAuthenticated) {
            window.location.href = "/blogs/dashboard";
            return;
        }

        setBusy(true);
        setLiked(true);
        setLikeCount((c) => c + 1);

        try {
            localStorage.setItem(getLikedKey(blogId, userId), "true");
        } catch { }

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
                try {
                    localStorage.removeItem(getLikedKey(blogId, userId));
                } catch { }
            }
        } catch (err) {
            console.error("Failed to register like", err);
            setLiked(false);
            setLikeCount((c) => c - 1);
            try {
                localStorage.removeItem(getLikedKey(blogId, userId));
            } catch { }
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked || busy}
            aria-label={liked ? "Liked" : "Like this post"}
            className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-dmsans
        transition-all duration-300 select-none
        ${liked
                    ? "bg-pink-500/20 text-pink-400 cursor-default"
                    : isAuthenticated
                        ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-pink-400 cursor-pointer"
                        : "bg-white/5 text-white/30 cursor-pointer"
                }
      `}
        >
            <Heart
                className={`w-4 h-4 transition-all duration-300 ${liked ? "fill-pink-400 text-pink-400 scale-110" : ""}`}
            />
            <span>{likeCount}</span>
        </button>
    );
}
