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

/* ---------- TYPES ---------- */

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
    height: "2rem",
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

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 })

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
    const xPct = (mouseX / width) - 0.5
    const yPct = (mouseY / height) - 0.5
    x.set(xPct)
    y.set(yPct)
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
        rotateX,
        rotateY,
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
          )`
        }}
      />
      {children}
    </motion.div>
  )
}

/* ---------- LEADER CARD COMPONENT ---------- */

function LeaderCard({ leader }: { leader: Leader }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const showExpanded = isExpanded || isHovered

  const handleClick = () => setIsExpanded(!isExpanded)
  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  const currentRadius = showExpanded ? '55px' : '24px'

  // Responsive dimensions
  const cardWidth = isMobile ? (showExpanded ? 280 : 180) : (showExpanded ? 320 : 200)
  const cardHeight = isMobile ? (showExpanded ? 380 : 260) : (showExpanded ? 420 : 280)

  return (
    <div
  style={{
    background: "rgba(0,0,0,0.20)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderRadius: currentRadius,
  }}
>
<HolographicCard
  onClick={handleClick}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  className="group cursor-pointer"
  borderRadius={currentRadius}
>
  <motion.article
    variants={itemFade}
    className="relative overflow-hidden"
    animate={{
      width: cardWidth,
      height: cardHeight,
      borderRadius: currentRadius,
    }}
    transition={{ duration: 0.4, ease: easeSoft }}
  >

    {/* CONTENT */}
    <motion.div
      className="relative z-10 flex flex-col items-center h-full"
      animate={{
        gap: showExpanded ? "12px" : "16px",
        padding: isMobile
          ? "16px"
          : showExpanded
          ? "20px"
          : "20px",
      }}
      transition={{ duration: 0.4, ease: easeSoft }}
    >
      <motion.div
        className="relative z-20 flex flex-col items-center text-center w-full"
        animate={{ gap: "12px" }}
      >
        <div
          className="border border-white/20 shadow-inner flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-white/5"
          style={{
            width: isMobile ? "100px" : "120px",
            height: isMobile ? "100px" : "120px",
          }}
        >
          <img
            src={leader.avatar}
            alt={leader.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-center gap-1 w-full">
          <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
            {leader.name}
          </h2>
          <p className="text-[10px] md:text-xs font-medium text-purple-300 uppercase tracking-wider">
            {leader.title}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="overflow-hidden w-full"
        animate={{
          opacity: showExpanded ? 1 : 0,
          height: showExpanded ? "auto" : 0,
        }}
        transition={{
          duration: 0.3,
          ease: easeSoft,
          delay: showExpanded ? 0.1 : 0,
        }}
      >
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-3" />
        <p className="text-xs md:text-sm leading-relaxed font-light text-center text-gray-200">
          {leader.description}
        </p>
      </motion.div>
    </motion.div>
  </motion.article>
</HolographicCard>
</div>
  )
}

/* ---------- HIERARCHY LEVEL (Recursive) ---------- */

function HierarchyLevel({ leader }: { leader: Leader }) {
  const hasChildren = leader.children && leader.children.length > 0
  const childCount = leader.children?.length || 0

  return (
    <motion.div
      className="flex flex-col items-center"
      variants={treeVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <LeaderCard leader={leader} />

      {hasChildren && (
        <>
          <motion.div
            variants={lineDrawVertical}
            className="w-0.5 bg-gradient-to-b from-white/70 to-white/40 origin-top"
          />

          <div className="flex flex-col md:flex-row justify-center gap-y-8">
            {leader.children!.map((child, idx) => {
              const isFirst = idx === 0
              const isLast = idx === childCount - 1
              const isOnly = childCount === 1

              return (
                <div
                  key={child.name}
                  className="relative flex flex-col items-center px-4 md:px-[30px]"
                >
                  {!isOnly && (
                    <>

                      {!isFirst && (
                        <motion.div
                          variants={lineDrawHorizontal}
                          className="absolute top-0 right-1/2 w-1/2 h-[2px] bg-white/40 origin-left hidden md:block"
                        />
                      )}
                      {!isLast && (
                        <motion.div
                          variants={lineDrawHorizontal}
                          className="absolute top-0 left-1/2 w-1/2 h-[2px] bg-white/40 origin-right hidden md:block"
                        />
                      )}
                    </>
                  )}

                  <motion.div
                    variants={lineDrawVertical}
                    className="w-0.5 bg-gradient-to-b from-white/40 to-white/70 origin-top"
                  />

                  <HierarchyLevel leader={child} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ---------- MAIN COMPONENT ---------- */

export default function Leadership() {
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-4 text-white">
            Our Leadership
          </h1>

          <p className="text-sm md:text-base lg:text-lg leading-relaxed max-w-[470px] text-zinc-300">
            Meet the team leading the organisation, who keep both speed and quality at the top of their priorities.
          </p>
        </motion.div>

        <div className="w-full max-w-7xl mx-auto pb-10 md:pb-20">
          <HierarchyLevel leader={organizationHierarchy} />
        </div>
      </div>
    </div>
  )
}