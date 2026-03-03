"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { DynamicBackgroundHues } from "@/components/ui/dynamic-background-hues";

export default function MaintenancePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden bg-[#0b0816] flex items-center justify-center text-white"
        >
            <DynamicBackgroundHues containerRef={containerRef} />

            <div className="relative z-10 px-4 text-center max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-tttravelsnext font-bold leading-none uppercase tracking-tighter flex flex-col items-center justify-center text-center">
                            <span>Maintenance</span>
                            <span className="text-white">Underway</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/50 font-dmsans max-w-xl mx-auto leading-relaxed">
                            We're currently fine-tuning our platform to bring you a better experience.
                            The Carcino Foundation will be back online shortly.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#6D54B5] to-transparent" />

                        <p className="text-sm font-michroma tracking-[0.2em] text-white/30 uppercase">
                            Coming Back Soon
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Subtle bottom text */}
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
                <p className="text-xs text-white/20 font-dmsans tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} The Carcino Foundation
                </p>
            </div>
        </div>
    );
}
