"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  Variants
} from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

/* ---------- TYPES ---------- */

type DBUser = {
  id: string
  username: string | null
  name: string | null
  position: string | null
  description: string | null
  profilePicture: string | null
}

type Leader = {
  name: string
  title: string
  description: string
  avatar: string
  children?: Leader[]
}

/* ---------- DATA ---------- */

const organizationHierarchy: Leader = {
  name: "Rajannya Das",
  title: "Founder & CEO",
  description:
    "A science enthusiast who's usually found lifting weights for peace, balancing deadlines with dopamine bike rides, travelling and learning languages. Mitosis deserves a standing ovation— biology said yes.",
  avatar: "/avatars/rajannya.png",
  children: [
    {
      name: "Agnihotra Nath",
      title: "Chief Operating Officer (COO)",
      description:
        "Loves designing and being autistic. This car enthusiast does not miss when it comes to perfection, efficiency and speed.",
      avatar: "/avatars/agni.png",
      children: [
        {
          name: "Adiya Roy",
          title: "Design Manager",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          avatar: "/avatars/adiya.jpeg",
        },
        {
          name: "Ariona Talukdar",
          title: "PR Manager",
          description:
            "A quick learner with strong communication and problem-solving skills, she handles tasks with focus, clarity, and confidence.",
          avatar: "/avatars/ariona.png",
        },
      ],
    },
    {
      name: "Anjishnu Dey",
      title: "Chief Technology Officer (CTO)",
      description:
        "Physicist by soul. Fights bugs, throws hands, hits gym. If it's complex, he's into it. If it's boring, he's out. Obsessed with clean design, clean lifts, and clean wins.",
      avatar: "/avatars/anjishnu.jpeg",
      children: [
        {
          name: "Naitik Chattaraj",
          title: "Development Manager",
          description:
            "Codes like it's gravity. Fueled by caffeine and thinking in systems while dreaming in space. Leads devs, ships ideas, and refuses to believe bugs aren't just undocumented features.",
          avatar: "/avatars/naitik.jpeg",
        },
      ],
    },
    {
      name: "Soushree Chakraborty",
      title: "Chief Research Officer (CRO)",
      description:
        "Fueled by curiosity and a love for new things, she dives headfirst into scientific discovery, artistic creation, and adrenaline-pumping adventures.",
      avatar: "/avatars/soushree-2.png",
      children: [
        {
          name: "Jiya Haldar",
          title: "Chief Editor",
          description:
            "This marine biology enthusiast is an impeccable photographer and multitasking pro, known for her incredible writing skills.",
          avatar: "/avatars/jiya.png",
          children: [
            {
              name: "Siran Pramanick",
              title: "Deputy Chief Editor",
              description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              avatar: "/avatars/siran.png",
            },
            {
              name: "Nishka Majumder",
              title: "Proofreading Manager",
              description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              avatar: "/avatars/nishka.png",
            },
          ],
        },
      ],
    },
  ],
}

/* ---------- ANIMATION CONSTANTS ---------- */

const easeSoft: [number, number, number, number] = [0.33, 1, 0.68, 1]

// Variants for the tree drawing effect - branching from center outward
const treeVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
}

const itemFade: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeSoft }
  },
}

const lineDrawVertical: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "3rem",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
}

const lineDrawHorizontal: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
}

/* ---------- HOLOGRAPHIC COMPONENT ---------- */

interface HolographicCardProps {
  children: React.ReactNode
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
  borderRadius?: string
}

function HolographicCard({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  borderRadius
}: HolographicCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, { stiffness: 150, damping: 30 })
  const ySpring = useSpring(y, { stiffness: 150, damping: 30 })

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["7deg", "-7deg"])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-7deg", "7deg"])

  // Holographic sheen gradient position
  const sheenX = useTransform(xSpring, [-0.5, 0.5], ["0%", "100%"])
  const sheenY = useTransform(ySpring, [-0.5, 0.5], ["0%", "100%"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Only update if mouse is within bounds to prevent edge jitter
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      const xPct = (mouseX / width) - 0.5
      const yPct = (mouseY / height) - 0.5

      // Add threshold to prevent micro-movements
      const threshold = 0.02
      const currentX = x.get()
      const currentY = y.get()

      if (Math.abs(xPct - currentX) > threshold || Math.abs(yPct - currentY) > threshold) {
        x.set(xPct)
        y.set(yPct)
      }
    }
  }

  const handleMouseLeaveWrapper = () => {
    x.set(0)
    y.set(0)
    if (onMouseLeave) onMouseLeave()
  }

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeaveWrapper}
      className={`relative z-10 preserve-3d ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      initial={{ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" }}
    >
      {/* Dynamic Shine Layer - Reduced Intensity */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-50 mix-blend-overlay transition-opacity duration-300"
        style={{
          borderRadius: borderRadius,
          background: useMotionTemplate`radial-gradient(
            circle at ${sheenX} ${sheenY},
            rgba(255,255,255,0.2), 
            transparent 50%
          )`,
          pointerEvents: 'none'
        }}
      />
      {children}
    </motion.div>
  )
}

/* ---------- SKELETON COMPONENT ---------- */

function LeaderCardSkeleton({ isMobile }: { isMobile: boolean }) {
  const cardWidth = isMobile ? 180 : 200
  const cardHeight = isMobile ? 260 : 280
  const currentRadius = "24px"

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: currentRadius,
        width: cardWidth,
        height: cardHeight,
      }}
      className="animate-pulse relative overflow-hidden flex flex-col items-center gap-4 p-5 border border-white/5"
    >
      <div
        className="rounded-full bg-white/10"
        style={{ width: isMobile ? "100px" : "120px", height: isMobile ? "100px" : "120px" }}
      />
      <div className="h-4 w-3/4 bg-white/10 rounded-full" />
      <div className="h-3 w-1/2 bg-white/5 rounded-full" />
      <div className="mt-4 flex flex-col gap-2 w-full">
        <div className="h-2 w-full bg-white/5 rounded-full" />
        <div className="h-2 w-5/6 bg-white/5 rounded-full" />
        <div className="h-2 w-4/6 bg-white/5 rounded-full mx-auto" />
      </div>
    </div>
  )
}

/* ---------- LEADER CARD COMPONENT ---------- */

function LeaderCard({ leader, isLoading }: { leader: Leader; isLoading?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // Add delay before hiding to prevent jitter
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 100)
  }

  const showExpanded = isExpanded || isHovered
  const currentRadius = showExpanded ? '44px' : '24px'

  // Refined fluid dimensions
  const getCardWidth = () => {
    if (isMobile) return showExpanded ? 240 : 180
    // Desktop fluid scaling - More generous base widths for larger screens
    let base = 180
    if (windowWidth >= 1440) base = 240
    else if (windowWidth >= 1200) base = 220
    else if (windowWidth >= 1024) base = 200
    else base = 160

    return showExpanded ? base + 60 : base
  }

  const cardWidth = getCardWidth()
  const cardHeight = isMobile ? 260 : 280

  if (isLoading) return <LeaderCardSkeleton isMobile={isMobile} />

  return (
    <div className="relative z-0" style={{ borderRadius: currentRadius }}>
      <div
        style={{
          background: "rgba(0,0,0,0.20)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRadius: currentRadius,
        }}
      >
        <HolographicCard
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="group cursor-pointer"
          borderRadius={currentRadius}
        >
          <motion.article
            animate={{
              width: cardWidth,
              height: showExpanded ? "auto" : cardHeight,
              borderRadius: currentRadius,
            }}
            className="relative overflow-hidden"
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <motion.div
              className="relative z-10 flex flex-col items-center"
              animate={{
                padding: isMobile
                  ? (showExpanded ? "16px 12px 32px 12px" : "16px")
                  : (showExpanded ? "20px 16px 48px 16px" : "20px"),
              }}
              transition={{ duration: 0.4, ease: easeSoft }}
            >
              <div
                className="border border-white/20 shadow-inner flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-white/5"
                style={{
                  width: isMobile ? "100px" : "120px",
                  height: isMobile ? "100px" : "120px",
                }}
              >
                <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col items-center gap-1 w-full text-center mt-4">
                <h2 className="text-sm md:text-base font-dmsans font-bold text-white tracking-wide leading-tight">
                  {leader.name}
                </h2>
                <p className="text-[10px] md:text-[11px] font-dmsans font-medium text-purple-300 uppercase tracking-widest px-2">
                  {leader.title}
                </p>
              </div>

              <motion.div
                className="overflow-hidden w-full mt-4"
                animate={{ opacity: showExpanded ? 1 : 0, height: showExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: easeSoft }}
              >
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-3" />
                <p className="text-xs md:text-sm leading-relaxed font-dmsans font-light text-center text-gray-200 px-2 pb-2">
                  {leader.description}
                </p>
              </motion.div>
            </motion.div>
          </motion.article>
        </HolographicCard>
      </div>
    </div>
  )
}

function HierarchyLevel({ leader, isLoading }: { leader: Leader; isLoading?: boolean }) {
  const hasChildren = leader.children && leader.children.length > 0
  const childCount = leader.children?.length || 0

  return (
    <motion.div
      className="flex flex-col items-center"
      variants={treeVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.05 }}
    >
      <LeaderCard leader={leader} isLoading={isLoading} />

      {hasChildren && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical line down from parent */}
          <motion.div variants={lineDrawVertical} className="w-[2px] h-10 bg-white/20 z-20 relative" />

          <div className="flex flex-col md:flex-row justify-center w-full">
            {leader.children!.map((child, idx) => {
              const isFirst = idx === 0
              const isLast = idx === childCount - 1
              const isOnly = childCount === 1

              return (
                <div key={child.name} className="relative flex flex-col items-center flex-1 md:px-4">
                  {/* Branching system (Desktop) */}
                  {!isOnly && (
                    <div className="hidden md:block absolute top-0 left-0 right-0 h-6 z-20 pointer-events-none">
                      {/* Horizontal segment - Adjusted to not overlap curves */}
                      <div className={cn(
                        "absolute top-0 h-[2px] bg-white/20 transition-all duration-300",
                        isFirst ? "left-[calc(50%+24px)] right-0" :
                          isLast ? "left-0 right-[calc(50%+24px)]" :
                            "left-0 right-0"
                      )} />

                      {/* Rounded corner overlays */}
                      {isFirst && (
                        <div className="absolute top-0 left-1/2 -translate-x-[1px] w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-[24px]" />
                      )}
                      {isLast && (
                        <div className="absolute top-0 right-1/2 translate-x-[1px] w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-[24px]" />
                      )}
                    </div>
                  )}

                  {/* Child stem - Offset lower for first/last to align with curves */}
                  <motion.div
                    variants={lineDrawVertical}
                    className={cn(
                      "w-[2px] bg-white/20 z-20 relative h-6",
                      (isFirst || isLast) && !isOnly ? "mt-6" : "mt-0"
                    )}
                  />

                  <HierarchyLevel leader={child} isLoading={isLoading} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ---------- MAIN COMPONENT ---------- */

export default function Leadership() {
  const [hierarchy, setHierarchy] = useState<Leader>(organizationHierarchy)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeadership() {
      try {
        const response = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_leadership" }),
        })
        const data = await response.json()

        if (response.ok && data.users) {
          const users: DBUser[] = data.users

          const mergeData = (leader: Leader): Leader => {
            const dbUser = users.find(u =>
              u.name?.toLowerCase() === leader.name.toLowerCase() ||
              u.username?.toLowerCase() === leader.name.toLowerCase()
            )

            return {
              ...leader,
              title: dbUser?.position || leader.title,
              description: dbUser?.description || leader.description,
              avatar: dbUser?.profilePicture || leader.avatar,
              children: leader.children && leader.children.length > 0
                ? leader.children.map(mergeData)
                : leader.children
            }
          }

          setHierarchy(mergeData(organizationHierarchy))
        }
      } catch (error) {
        console.error("Failed to fetch leadership data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeadership()
  }, [])

  const [isMobile, setIsMobile] = useState(false)
  const [treeScale, setTreeScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const treeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !treeRef.current || isMobile) {
        setTreeScale(1)
        return
      }

      const containerWidth = containerRef.current.offsetWidth
      const treeWidth = treeRef.current.scrollWidth

      if (treeWidth > containerWidth) {
        // Add a small buffer (px-10 on each side is 80px total)
        const scale = (containerWidth - 40) / treeWidth
        setTreeScale(Math.max(0.4, scale))
      } else {
        setTreeScale(1)
      }
    }

    const resizeObserver = new ResizeObserver(updateScale)
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    // Initial update and update after loading
    updateScale()
    const timer = setTimeout(updateScale, 500)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timer)
    }
  }, [isLoading, isMobile])

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src="/leadership-bg-new-2.jpg"
          alt="Leadership"
          className="fixed inset-0 w-screen h-screen object-cover animate-fadeIn"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-14 px-4 sm:px-6 pb-20 pt-20 md:pt-32 lg:px-20">

        <motion.div
          className="flex flex-col items-center gap-4 md:gap-6 text-center max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeSoft }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl leading-[0.9] text-center font-wintersolace text-white py-4 px-4 sm:px-10">
            Our Leadership
          </h1>

          <p className="text-sm md:text-base lg:text-lg leading-relaxed max-w-[470px] text-zinc-300 font-dmsans">
            Meet the team leading the organisation, who keep both speed and quality at the top of their priorities.
          </p>
        </motion.div>

        <div className="w-full max-w-full flex justify-center pb-10 md:pb-20" ref={containerRef}>
          <div
            ref={treeRef}
            className="transition-transform duration-500 ease-out flex flex-col items-center shrink-0"
            style={{
              transform: `scale(${treeScale})`,
              transformOrigin: "top center",
              width: "max-content",
              minWidth: "100%"
            }}
          >
            <HierarchyLevel
              key={isLoading ? 'loading' : 'loaded'}
              leader={hierarchy}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
