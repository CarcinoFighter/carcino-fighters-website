"use client"
import { easeInOut, motion } from "framer-motion"
import Image from "next/image";
import { Label } from "@/components/ui/label"
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Leader = {
  name: string
  title: string
  description: string
  avatar: string
}

type BlobSpec = {
  top: string
  left: string
  size: number
  opacity: number
  duration: number
  delay: number
  focusX: string
  focusY: string
  tone: "primary" | "accent" | "secondary"
}

const leaders: Leader[] = [
  {
    name: "Rajannya Das",
    title: "Founder & CEO",
    description:
      "A science enthusiast who's usually found lifting weights for peace, balancing deadlines with dopamine bike rides, travelling and learning languages. Mitosis deserves a standing ovation— biology said yes.",
    avatar: "/avatars/rajannya.png",
  },
  {
    name: "Agnihotra Nath",
    title: "Chief Operating Officer (COO)",
    description:
      "Loves designing and being autistic. This car enthusiast does not miss when it comes to perfection, efficiency and speed.",
    avatar: "/avatars/agni.png",
  },
  {
    name: "Anjishnu Dey",
    title: "Chief Technology Officer (CTO)",
    description:
      "Physicist by soul. Fights bugs, throws hands, hits gym. If it's complex, he's into it. If it's boring, he's out. Obsessed with clean design, clean lifts, and clean wins.",
    avatar: "/avatars/anjishnu.png",
  },
  {
    name: "Soushree Chakraborty",
    title: "Chief Research Officer (CRO)",
    description:
      "Fueled by curiosity and a love for new things, she dives headfirst into scientific discovery, artistic creation, and adrenaline-pumping adventures. She's the perfect blend of brains, heart, and thrill-seeker!",
    avatar: "/avatars/soushree-2.png",
  },
    {
    name: "Jiya Haldar",
    title: "Chief Editor",
    description:
      "This marine biology enthusiast is an impeccable photographer and multitasking pro, known for her incredible writing skills.",
    avatar: "/avatars/jiya.png",
  },
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
    {
    name: "Adiya Roy",
    title: "Design Manager",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    avatar: "/avatars/flower.png",
  },
    {
    name: "Ariona Talukdar",
    title: "PR Manager",
    description:
      "A quick learner with strong communication and problem-solving skills, she handles tasks with focus, clarity, and confidence.",
    avatar: "/avatars/ariona.png",
  },
]

const blobSpecs: BlobSpec[] = [
  {
    top: "6%",
    left: "-18%",
    size: 500,
    opacity: 0.42,
    duration: 12,
    delay: 0,
    focusX: "35%",
    focusY: "35%",
    tone: "primary",
  },
  {
    top: "-8%",
    left: "48%",
    size: 420,
    opacity: 0.36,
  duration: 14,
    delay: 1.1,
    focusX: "55%",
    focusY: "45%",
    tone: "accent",
  },
  {
    top: "32%",
    left: "72%",
    size: 380,
    opacity: 0.3,
  duration: 15,
    delay: 0.6,
    focusX: "55%",
    focusY: "50%",
    tone: "primary",
  },
  {
    top: "64%",
    left: "-12%",
    size: 520,
    opacity: 0.38,
  duration: 16,
    delay: 1.8,
    focusX: "45%",
    focusY: "55%",
    tone: "secondary",
  },
  {
    top: "78%",
    left: "58%",
    size: 460,
    opacity: 0.34,
  duration: 18,
    delay: 2.1,
    focusX: "60%",
    focusY: "60%",
    tone: "primary",
  },
  {
    top: "14%",
    left: "8%",
    size: 280,
    opacity: 0.28,
  duration: 10,
    delay: 0.9,
    focusX: "50%",
    focusY: "48%",
    tone: "accent",
  },
]

const easeSoft = [0.33, 1, 0.68, 1] as const

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: easeSoft },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeInOut },
  },
}

const MotionLabel = motion(Label)

const toneToColor: Record<BlobSpec["tone"], { inner: string; mid: string }> = {
  primary: { inner: "rgba(124, 58, 237, 0.85)", mid: "rgba(168, 85, 247, 0.25)" },
  accent: { inner: "rgba(93, 63, 211, 0.85)", mid: "rgba(129, 92, 255, 0.22)" },
  secondary: { inner: "rgba(76, 29, 149, 0.9)", mid: "rgba(129, 92, 255, 0.2)" },
}

export default function Leadership() {
  return (
    <div className="relative min-h-dvh w-full  overflow-hidden text-white font-dmsans">
      
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 pt-10 ">
        <Image
          src={"/leadership-bg-new.png"}
          alt="Leadership"
          width={1920}
          height={1080}
          quality={100}
          className="object-cover min-w-[100%] sm:min-w-[10%] sm:max-w-[70%] overflow-hidden hidden dark:inline animate-door-open animate-rad "
        />
        {/* <div className="sm:hidden absolute inset-0 bg-[#241836]/80" /> */}
      </div>
     

      <div className="pointer-events-none absolute inset-0 z-10">
        {blobSpecs.map((blob, index) => (
            <motion.span
              key={`blob-${index}`}
              className="absolute rounded-[999px] blur-[120px] mix-blend-screen saturate-150"
              style={{
                top: blob.top,
                left: blob.left,
                width: blob.size,
                height: blob.size,
                background: `radial-gradient(ellipse at ${blob.focusX} ${blob.focusY}, ${toneToColor[blob.tone].inner} 0%, ${toneToColor[blob.tone].mid} 40%, transparent 75%)`,
                opacity: blob.opacity,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [blob.opacity * 0.85, blob.opacity, blob.opacity * 0.9, blob.opacity * 0.82, blob.opacity * 0.85],
                scale: [0.92, 1.14, 0.98, 1.08, 0.92],
                x: [0, 110, -80, 45, 0],
                y: [0, -130, 80, -40, 0],
                rotate: [0, 18, -14, 6, 0],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: blob.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: blob.delay,
                repeatType: "loop",
              }}
            />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-14 px-6 pb-20 pt-32 sm:px-10 lg:px-20">
          <motion.div
            className="flex flex-col items-center gap-6 text-center max-w-2xl"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
          >
            {/* <MotionLabel
              variants={fadeUp}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm"
            >
              Meet the Team <ArrowUpRight size={18} />
            </MotionLabel> */}
            <motion.h1
              variants={fadeUp}
              className="text-3xl font-semibold mt-4 font-dmsans sm:text-4xl"
            >
              Our Leadership
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-base leading-relaxed max-w-[470px] text-zinc-300 sm:text-lg"
            >
             Meet the team leading the organisation, who keep both speed and quality at the top of their priorities.
            </motion.p>
          </motion.div>

          <motion.div
            className="    grid w-full gap-6
    sm:max-w-2xl
    md:max-w-5xl
    lg:max-w-6xl
    xl:max-w-7xl
    md:grid-cols-3
    mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {leaders.map((leader) => (
              <motion.article
                key={leader.name}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-[55px] p-5 transition-[box-shadow,transform] duration-300"
              >
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex flex-col items-center gap-3 z-20 text-center">
                  <Avatar className="h-30 w-30 border border-white/15">
                    <AvatarImage className="object-cover" src={leader.avatar} />
                    <AvatarFallback className="flex h-full w-full items-center justify-center bg-white/10">
                      <LoaderCircle size={18} className="animate-spin text-white/50" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-1 leading-1">
                    <h2 className="text-lg font-semibold">
                      {leader.name}
                    </h2>
                    <p className="text-sm font-[300] color-white leading-1">
                      {leader.title}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed p-6 text-white gap-4 font-dmsans font-light">
                    {leader.description}
                  </p>
                </div>
                <div className="divGlass-effect pointer-events-none z-0"></div>
          <div className=" cardGlass-shine pointer-events-none z-0 overflow-hidden "></div>
              </motion.article>
            ))}
          </motion.div>
        </div>          
      </div>
  );
}

/* <shape> */


/* Note: backdrop-filter has minimal browser support */
