"use client";

import React, { useEffect, useState, useMemo } from "react";

interface DynamicBackgroundHuesProps {
    containerRef: React.RefObject<HTMLElement | null>;
    baseColor?: string;
}

export function DynamicBackgroundHues({
    containerRef,
    baseColor,
}: DynamicBackgroundHuesProps) {
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateHeight = () => {
            const newHeight = container.scrollHeight;
            setHeight(prev => Math.abs(prev - newHeight) > 100 ? newHeight : prev);
        };

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(container);

        updateHeight();

        return () => resizeObserver.disconnect();
    }, [containerRef]);

    const hues = useMemo(() => {
        if (height === 0) return [];

        const result = [];
        const verticalStep = 1200;
        const margin = 800;

        // The primary color used for almost all hues
        const primaryColor = baseColor ? `${baseColor}55` : "#D5B0FF26";
        // Using the highly visible purple hue from the original survivor story page
        const finalPurpleHue = "#583B7A";

        // 1st Hue (Left, fixed at top)
        result.push({
            id: 0,
            side: "left",
            offset: -800,
            top: -700,
            width: 1600,
            height: 1600,
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 60%)`,
        });

        // 2nd Hue (Right, fixed slightly below top)
        result.push({
            id: 1,
            side: "right",
            offset: -900,
            top: -300,
            width: 1800,
            height: 1800,
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 50%)`,
        });

        let currentTop = -300 + verticalStep;
        let i = 2;

        // Calculate how many total hues we will have to know which one is the last
        const totalFutureHues = Math.max(0, Math.ceil((height - margin - currentTop) / verticalStep));
        const totalHues = 2 + totalFutureHues;

        while (currentTop + 900 < height - margin) {
            const isRight = i % 2 !== 0; // i=2 is left, i=3 is right

            result.push({
                id: i,
                side: isRight ? "right" : "left",
                offset: isRight ? -900 : -800,
                top: currentTop,
                width: isRight ? 1800 : 1600,
                height: isRight ? 1800 : 1600,
                background: `radial-gradient(circle, ${primaryColor} 0%, transparent ${isRight ? "50%" : "60%"})`,
            });

            currentTop += verticalStep;
            i++;
        }

        // Always ensure the absolute last hue is at the very bottom right and is purple
        // We anchor it using 'bottom' instead of 'top' to guarantee visibility
        result.push({
            id: "final-purple",
            side: "right",
            offset: -600,
            top: "auto", // Tell CSS to ignore top
            bottom: -1200, // Anchor relative to bottom of container exactly as original
            width: 1800,
            height: 1800,
            background: `radial-gradient(circle, ${finalPurpleHue} 0%, transparent 60%)`,
        });

        return result;
    }, [height, baseColor]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {hues.map((hue) => {
                const positionStyles: React.CSSProperties = hue.side === 'left'
                    ? { left: hue.offset }
                    : { right: hue.offset };

                if (hue.top === "auto") {
                    positionStyles.bottom = hue.bottom;
                } else {
                    positionStyles.top = hue.top;
                }

                return (
                    <div
                        key={hue.id}
                        style={{
                            position: "absolute",
                            width: hue.width,
                            height: hue.height,
                            borderRadius: "50%",
                            background: hue.background,
                            zIndex: 0,
                            ...positionStyles,
                        }}
                    />
                );
            })}
        </div>
    );
}
