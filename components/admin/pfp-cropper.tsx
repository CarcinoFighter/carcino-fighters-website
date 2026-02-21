"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { X, ZoomIn, ZoomOut, Move } from "lucide-react";

interface ProfilePictureEditorProps {
    imageSrc: string;
    onCrop: (croppedFile: File) => void;
    onCancel: () => void;
}

export function ProfilePictureEditor({ imageSrc, onCrop, onCancel }: ProfilePictureEditorProps) {
    const [zoom, setZoom] = useState(1.2);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Position motion values for dragging
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleSave = async () => {
        if (!imageRef.current || !containerRef.current) return;

        const canvas = document.createElement("canvas");
        const size = 512; // High quality output
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const img = imageRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        const maskSize = 256; // Matching the UI circle size

        // Natural dimensions
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;

        // The image is centered in the container at zoom 1, pos 0,0
        // We need to find its displayed width/height at zoom 1
        // Since we removed object-cover, it's just its natural size scaled by whatever factor
        // it took to fit (though here it's just rendered normally).
        // Let's assume it's rendered at its natural size or restricted by CSS max-w if we had any.
        // With h-auto w-auto, it's nw, nh.

        const finalW = nw * zoom;
        const finalH = nh * zoom;

        // Current center of the image relative to container center
        const currX = x.get();
        const currY = y.get();

        // Position of mask (centered) relative to image center
        // Center of image is at containerCenter + currX
        // Center of mask is at containerCenter
        // So mask center is -currX relative to image center

        // top-left of mask relative to image center:
        const maskTL_rel_imgCenter_X = -currX - (maskSize / 2);
        const maskTL_rel_imgCenter_Y = -currY - (maskSize / 2);

        // top-left of mask relative to image top-left:
        const maskTL_rel_imgTL_X = maskTL_rel_imgCenter_X + (finalW / 2);
        const maskTL_rel_imgTL_Y = maskTL_rel_imgCenter_Y + (finalH / 2);

        // Convert to source coordinates
        const sourceX = (maskTL_rel_imgTL_X / finalW) * nw;
        const sourceY = (maskTL_rel_imgTL_Y / finalH) * nh;
        const sourceSize = (maskSize / finalW) * nw;

        ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, size, size
        );

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                onCrop(file);
            }
        }, "image/jpeg", 0.9);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[44px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative"
            >
                {/* Decorative glass elements */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <div className="glass-noise" />
                    <div className="cardGlass-shine" />
                </div>

                <div className="p-8 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white font-wintersolace">Profile Photo</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">Adjust and center your avatar</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div
                        ref={containerRef}
                        onWheel={(e) => {
                            const delta = e.deltaY * -0.001;
                            const newZoom = Math.min(Math.max(zoom + delta, 0.1), 4);
                            setZoom(newZoom);
                        }}
                        className="aspect-square w-full relative bg-black/20 rounded-[32px] overflow-hidden mb-8 shadow-inner border border-white/5 group touch-none"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop preview"
                                style={{ x, y, scale: zoom }}
                                drag
                                dragMomentum={false}
                                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }} // Very loose constraints
                                className="max-w-none w-auto h-auto cursor-move active:cursor-grabbing select-none"
                            />
                        </div>

                        {/* Guide Layers */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            {/* Darkened area outside the circle using radial gradient */}
                            <div className="absolute inset-0" style={{ background: "radial-gradient(circle 128px at center, transparent 127px, rgba(0,0,0,0.6) 128px)" }} />

                            {/* Circular border */}
                            <div className="w-64 h-64 rounded-full border border-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] active:border-white/60 transition-colors relative">
                                {/* 3x3 Square Grid */}
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                    <div className="border-r border-b border-white/10" />
                                    <div className="border-r border-b border-white/10" />
                                    <div className="border-b border-white/10" />
                                    <div className="border-r border-b border-white/10" />
                                    <div className="border-r border-b border-white/10" />
                                    <div className="border-b border-white/10" />
                                    <div className="border-r border-white/10" />
                                    <div className="border-r border-white/10" />
                                    <div />
                                </div>

                                {/* Center Crosshair */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-[1px] bg-white/40" />
                                    <div className="h-4 w-[1px] bg-white/40 absolute" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Move size={10} /> Drag to position
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <ZoomOut size={14} className="text-white/20" />
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full relative overflow-hidden group/slider">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="4"
                                    step="0.01"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute left-0 top-0 h-full bg-purple-500 transition-all" style={{ width: `${((zoom - 0.1) / 3.9) * 100}%` }} />
                            </div>
                            <ZoomIn size={14} className="text-white/20" />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest transition-all border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-[2] py-3.5 px-6 rounded-2xl bg-white text-black hover:bg-white/90 font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(255,255,255,0.1)] transition-all"
                            >
                                Update Avatar
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
