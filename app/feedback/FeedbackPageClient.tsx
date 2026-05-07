/* eslint react/no-unescaped-entities: "off" */
"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";

const easeSoft = [0.33, 1, 0.68, 1] as const;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeSoft },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: easeSoft },
  },
};

type FeedbackCategory = "bug" | "feature" | "improvement" | "general";

const categoryButtonStyles: Record<
  FeedbackCategory,
  {
    color: string;
    idleBg: string;
    activeBg: string;
    idleBorder: string;
    activeBorder: string;
    shadow: string;
  }
> = {
  general: {
    color: "#B88CFF",
    idleBg: "rgba(184, 140, 255, 0.08)",
    activeBg: "rgba(184, 140, 255, 0.18)",
    idleBorder: "rgba(184, 140, 255, 0.26)",
    activeBorder: "rgba(184, 140, 255, 0.72)",
    shadow: "0 0 24px rgba(184, 140, 255, 0.18)",
  },
  bug: {
    color: "#FF6B8A",
    idleBg: "rgba(255, 107, 138, 0.08)",
    activeBg: "rgba(255, 107, 138, 0.18)",
    idleBorder: "rgba(255, 107, 138, 0.26)",
    activeBorder: "rgba(255, 107, 138, 0.72)",
    shadow: "0 0 24px rgba(255, 107, 138, 0.18)",
  },
  feature: {
    color: "#42D6B5",
    idleBg: "rgba(66, 214, 181, 0.08)",
    activeBg: "rgba(66, 214, 181, 0.18)",
    idleBorder: "rgba(66, 214, 181, 0.26)",
    activeBorder: "rgba(66, 214, 181, 0.72)",
    shadow: "0 0 24px rgba(66, 214, 181, 0.18)",
  },
  improvement: {
    color: "#F4B84A",
    idleBg: "rgba(244, 184, 74, 0.08)",
    activeBg: "rgba(244, 184, 74, 0.18)",
    idleBorder: "rgba(244, 184, 74, 0.26)",
    activeBorder: "rgba(244, 184, 74, 0.72)",
    shadow: "0 0 24px rgba(244, 184, 74, 0.18)",
  },
};

const getCategoryLabel = (cat: FeedbackCategory) => {
  switch (cat) {
    case "bug":
      return "Bug Report";
    case "feature":
      return "Feature Request";
    case "improvement":
      return "Improvement";
    default:
      return "General";
  }
};

type FeedbackFormCardProps = {
  formRef: React.RefObject<HTMLDivElement | null>;
  name: string;
  email: string;
  message: string;
  category: FeedbackCategory;
  isSubmitting: boolean;
  submitSuccess: boolean;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setMessage: (value: string) => void;
  setCategory: (value: FeedbackCategory) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  className?: string;
};

function FeedbackFormCard({
  formRef,
  name,
  email,
  message,
  category,
  isSubmitting,
  submitSuccess,
  setName,
  setEmail,
  setMessage,
  setCategory,
  onSubmit,
  className = "relative",
}: FeedbackFormCardProps) {
  return (
    <motion.div ref={formRef} variants={fadeScale} className={className}>
      <Card className="relative overflow-hidden p-6 sm:p-8 bg-card/40 backdrop-blur-md border border-border/40">
        <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
        <div className="cardGlass-borders pointer-events-none" />
        <div className="cardGlass-shine pointer-events-none" />
        <div className="glass-noise" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-border/30">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-wintersolace text-foreground leading-tight">
                Submit Feedback
              </h2>
              <p className="text-xs font-dmsans text-muted-foreground mt-0.5">
                All fields required
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="bg-background/40 border-border/40 font-dmsans focus:border-primary/70 transition-colors h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="bg-background/40 border-border/40 font-dmsans focus:border-primary/70 transition-colors h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Category
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                {(["general", "bug", "feature", "improvement"] as const).map(
                  (cat) => {
                    const tone = categoryButtonStyles[cat];
                    const isSelected = category === cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        aria-pressed={isSelected}
                        style={{
                          backgroundColor: isSelected
                            ? tone.activeBg
                            : tone.idleBg,
                          borderColor: isSelected
                            ? tone.activeBorder
                            : tone.idleBorder,
                          boxShadow: isSelected ? tone.shadow : "none",
                          color: tone.color,
                        }}
                        className="px-4 py-2.5 rounded-lg border font-dmsans text-xs font-medium tracking-wide transition-all duration-200 hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                      >
                        {getCategoryLabel(cat)}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="message"
                className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Your Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                required
                rows={5}
                className="bg-background/40 border-border/40 font-dmsans focus:border-primary/70 transition-colors resize-none text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative px-6 py-5 rounded-full overflow-hidden backdrop-blur-sm transition-all duration-300 font-dmsans font-medium text-sm tracking-wide hover:scale-[101.5%] active:scale-[99%]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <span className="animate-pulse">Submitting...</span>
                ) : submitSuccess ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base leading-none">✓</span>{" "}
                    Submitted Successfully
                  </span>
                ) : (
                  <>
                    Submit Feedback <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-primary opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
              <div className="liquidGlass-shine relative w-[101%] h-[100%] !top-[0px] !left-[-1px]" />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}

export function FeedbackPageClient() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const formRef = React.useRef<HTMLDivElement | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [category, setCategory] = React.useState<FeedbackCategory>("general");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setName("");
    setEmail("");
    setMessage("");
    setCategory("general");
    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const getCategoryLabel = (cat: FeedbackCategory) => {
    switch (cat) {
      case "bug":
        return "Bug Report";
      case "feature":
        return "Feature Request";
      case "improvement":
        return "Improvement";
      default:
        return "General";
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col relative lg:block lg:h-screen w-full overflow-y-scroll overflow-x-hidden items-start gap-0 bg-background hide-scrollbar"
    >
      {/* Hero Section — full-bleed dark, TCF-style */}
      <motion.div
        ref={heroRef}
        className="relative w-full min-h-screen flex items-center justify-start overflow-hidden bg-[#0a0a0f]"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Parallax background layer */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y }}
        >
          {/* Deep dark base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0e0b18] to-[#0a0a0f]" />
          {/* Subtle orbs — restrained, not garish */}
          <div className="absolute top-1/3 -left-32 w-[480px] h-[480px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-purple-700/6 rounded-full blur-[100px]" />
          {/* Fine grain noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }}
          />
        </motion.div>

        {/* Hero content — left-aligned, TCF style */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-28 pb-16 lg:pt-32 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)] gap-10 lg:gap-14 items-center">
            <div>
          {/* Eyebrow tag */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 mb-7"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-dmsans text-white/40 uppercase tracking-[0.2em] font-medium">
              Your Voice Matters
            </span>
          </motion.div>

          {/* Large editorial headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-wintersolace text-white leading-[1.02] mb-6 max-w-3xl"
          >
            Share Your
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary/60">
              Feedback.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg font-dmsans text-white/45 max-w-xl leading-relaxed"
          >
            Help us improve The Carcino Foundation. Whether it's a bug, a
            feature request, or just a thought—we're listening. Every piece of
            feedback shapes our future.
          </motion.p>
            </div>

            <FeedbackFormCard
              formRef={formRef}
              name={name}
              email={email}
              message={message}
              category={category}
              isSubmitting={isSubmitting}
              submitSuccess={submitSuccess}
              setName={setName}
              setEmail={setEmail}
              setMessage={setMessage}
              setCategory={setCategory}
              onSubmit={handleSubmit}
              className="relative w-full max-w-xl lg:ml-auto"
            />
          </div>
        </div>

        {/* Bottom border fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.div>

      {/* Divider rule */}
      <div className="w-full h-px bg-border/30" />

      {false && (
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-start">
          {/* Left copy */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:sticky lg:top-10"
          >
            <div className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-dmsans text-muted-foreground uppercase tracking-[0.2em] font-medium">
                Tell us what to improve
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-instrumentserifitalic text-foreground leading-[1.05] mb-6 max-w-xl">
              Your experience helps shape what we build next.
            </h2>

            <div className="space-y-5 max-w-xl font-dmsans text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                Share anything that would make The Carcino Foundation more
                useful, welcoming, or easier to navigate.
              </p>
              <p>
                Bug reports, feature ideas, content suggestions, and general
                thoughts are all welcome. We review every message with care.
              </p>
            </div>
          </motion.div>

          {/* Feedback Form */}
          <motion.div
            ref={formRef}
            variants={fadeScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            <Card className="relative overflow-hidden p-8 sm:p-10 bg-card/40 backdrop-blur-md border border-border/40">
              {/* Glass layering */}
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
              <div className="cardGlass-borders pointer-events-none" />
              <div className="cardGlass-shine pointer-events-none" />
              <div className="glass-noise" />

              <div className="relative z-10">
                {/* Form header */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/30">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-instrumentserifitalic text-foreground leading-tight">
                      Submit Feedback
                    </h2>
                    <p className="text-xs font-dmsans text-muted-foreground mt-0.5">
                      All fields required
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email side by side on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="name"
                        className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide"
                      >
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="bg-background/40 border-border/40 font-dmsans focus:border-primary/70 transition-colors h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="bg-background/40 border-border/40 font-dmsans focus:border-primary/70 transition-colors h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <Label className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Category
                    </Label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(
                        ["general", "bug", "feature", "improvement"] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2.5 rounded-lg border font-dmsans text-xs font-medium tracking-wide transition-all duration-200 ${
                            category === cat
                              ? "border-primary/60 bg-primary/10 text-primary"
                              : "border-border/40 bg-background/20 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {getCategoryLabel(cat)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="message"
                      className="font-dmsans text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      Your Message
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      required
                      rows={6}
                      className="bg-background/40 border-border/40 font-dmsans focus:border-primary/70 transition-colors resize-none text-sm"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative px-6 py-5 rounded-full overflow-hidden backdrop-blur-sm transition-all duration-300 font-dmsans font-medium text-sm tracking-wide hover:scale-[101.5%] active:scale-[99%]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <span className="animate-pulse">Submitting...</span>
                      ) : submitSuccess ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-base leading-none">✓</span>{" "}
                          Submitted Successfully
                        </span>
                      ) : (
                        <>
                          Submit Feedback <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-primary opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
                    <div className="liquidGlass-shine relative w-[101%] h-[100%] !top-[0px] !left-[-1px]" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
