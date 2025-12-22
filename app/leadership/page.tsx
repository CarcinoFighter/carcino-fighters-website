"use client"
import { easeInOut, motion } from "framer-motion"
import Image from "next/image"
import Script from "next/script"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/* ---------- TYPES ---------- */

type Leader = {
  name: string
  title: string
  description: string
  avatar: string
}

/* ---------- DATA ---------- */

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
      "Fueled by curiosity and a love for new things, she dives headfirst into scientific discovery, artistic creation, and adrenaline-pumping adventures.",
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

/* ---------- MOTION ---------- */

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
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeSoft },
  },
}

const cardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: easeInOut },
  },
}

const MotionLabel = motion(Label)

/* ---------- COMPONENT ---------- */

export default function Leadership() {
  const leadershipSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Leadership – The Carcino Foundation",
    url: "https://thecarcinofoundation.org/leadership",
    about: {
      "@type": "NGO",
      name: "The Carcino Foundation",
    },
    mainEntity: leaders.map((leader) => ({
      "@type": "Person",
      name: leader.name,
      jobTitle: leader.title,
      description: leader.description,
      image: `https://thecarcinofoundation.org${leader.avatar}`,
      affiliation: {
        "@type": "NGO",
        name: "The Carcino Foundation",
      },
    })),
  }

  return (
    <>
      <Script
        id="leadership-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(leadershipSchema),
        }}
      />

      <div className="relative min-h-dvh w-full overflow-hidden text-white font-dmsans">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <Image
            src="/leadership-bg-new-2.jpg"
            alt="Leadership"
            width={1920}
            height={1080}
            className="
              fixed inset-0
              w-screen h-screen
              object-cover
              hidden dark:inline
              animate-fadeIn
            "
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-14 px-6 pb-20 pt-32 sm:px-10 lg:px-20">
          <motion.div
            className="flex flex-col items-center gap-6 text-center max-w-2xl"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
          >
            <motion.h1
              variants={fadeUp}
              className="text-3xl font-semibold mt-4 sm:text-4xl"
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
            className="
              grid w-full gap-6
              sm:max-w-2xl
              md:max-w-5xl
              lg:max-w-6xl
              xl:max-w-7xl
              md:grid-cols-3
              mx-auto
            "
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {leaders.map((leader) => (
              <motion.article
                key={leader.name}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-[55px] p-5 backdrop-blur-md bg-black/10 transition-[box-shadow] duration-300"
              >
                <div className="relative flex flex-col items-center gap-3 z-20 text-center">
                  <Avatar className="h-30 w-30 border border-white/15">
                    <AvatarImage src={leader.avatar} />
                    <AvatarFallback className="bg-white/10">
                      <LoaderCircle size={18} className="animate-spin text-white/50" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-lg font-semibold">{leader.name}</h2>
                    <p className="text-sm font-light">{leader.title}</p>
                  </div>

                  <p className="text-sm leading-relaxed p-6 font-light">
                    {leader.description}
                  </p>
                </div>

                <div className="divGlass-effect pointer-events-none z-0" />
                <div className="cardGlass-shine pointer-events-none z-0 overflow-hidden" />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  )
}
