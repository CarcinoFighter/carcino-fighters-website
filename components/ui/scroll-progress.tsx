"use client"

import { motion, MotionProps, useScroll } from "framer-motion"

import { cn } from "@/lib/utils"

interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  ref?: React.Ref<HTMLDivElement>
}

export function ScrollProgress({
  className,
  ref,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-px origin-left pointer-events-none bg-gradient-to-r from-purple-500 to-white",
        className
      )}
      style={{ scaleX: scrollYProgress }}
      {...props}
    />
  )
}
