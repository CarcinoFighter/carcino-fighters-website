"use client"

import { motion, MotionProps, useScroll } from "framer-motion"

import { cn } from "@/lib/utils"

interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  ref?: React.Ref<HTMLDivElement>
  color?: string
}

export function ScrollProgress({
  className,
  color,
  ref,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-px origin-left pointer-events-none",
        !color && "bg-gradient-to-r from-purple-500 to-white",
        className
      )}
      style={{
        scaleX: scrollYProgress,
        ...(color ? { backgroundImage: `linear-gradient(to right, ${color}, white)` } : {})
      }}
      {...props}
    />
  )
}
