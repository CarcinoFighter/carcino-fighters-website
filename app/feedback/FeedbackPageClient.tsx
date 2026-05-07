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
import { Send, MessageSquare, Sparkles, Trash2 } from "lucide-react";

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

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  category: "bug" | "feature" | "improvement" | "general";
}

const STORAGE_KEY = "carcino_feedback_submissions";

export function FeedbackPageClient() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const formRef = React.useRef<HTMLDivElement | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [category, setCategory] =
    React.useState<FeedbackItem["category"]>("general");
  const [submissions, setSubmissions] = React.useState<FeedbackItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);

  // localstorage temp.
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSubmissions(parsed);
      } catch (e) {
        console.error("Failed to parse stored feedback");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const newFeedback: FeedbackItem = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      category,
      timestamp: Date.now(),
    };

    const updated = [newFeedback, ...submissions];
    setSubmissions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setName("");
    setEmail("");
    setMessage("");
    setCategory("general");
    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getCategoryColor = (cat: FeedbackItem["category"]) => {
    switch (cat) {
      case "bug":
        return "#EC3C6E";
      case "feature":
        return "#39C69C";
      case "improvement":
        return "#ECA92B";
      default:
        return "#70429b";
    }
  };

  const getCategoryLabel = (cat: FeedbackItem["category"]) => {
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
        className="relative w-full min-h-[58vh] lg:min-h-[68vh] flex items-end justify-start overflow-hidden bg-[#0a0a0f]"
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
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-24 pb-16 lg:pb-20">
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
            className="text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-instrumentserifitalic text-white leading-[1.02] mb-6 max-w-3xl"
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

        {/* Bottom border fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.div>

      {/* Divider rule */}
      <div className="w-full h-px bg-border/30" />

      {/* Main Content Grid */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Feedback Form ── */}
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

          {/* ── Recent Submissions ── */}
          <motion.div
            variants={fadeScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            <div className="sticky top-8">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <h2 className="text-xl font-instrumentserifitalic text-foreground">
                    Recent Submissions
                  </h2>
                </div>
                {submissions.length > 0 && (
                  <span className="ml-auto text-xs font-dmsans text-muted-foreground bg-muted/40 border border-border/30 px-2.5 py-1 rounded-full">
                    {submissions.length}{" "}
                    {submissions.length !== 1 ? "entries" : "entry"}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 hide-scrollbar">
                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/30 rounded-xl bg-card/20">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/25 mb-4" />
                    <p className="font-dmsans text-sm text-muted-foreground/60">
                      No feedback yet.
                    </p>
                    <p className="font-dmsans text-xs text-muted-foreground/40 mt-1">
                      Be the first to share your thoughts.
                    </p>
                  </div>
                ) : (
                  submissions.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.4 }}
                    >
                      <Card
                        className="relative overflow-hidden p-5 bg-card/35 backdrop-blur-sm border border-border/35 group hover:border-border/60 transition-all duration-300"
                        style={
                          {
                            "--hover-card-bg": getCategoryColor(item.category),
                          } as React.CSSProperties
                        }
                      >
                        <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
                        <div className="cardGlass-tint pointer-events-none" />
                        <div className="cardGlass-shine pointer-events-none" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-dmsans font-semibold text-sm text-foreground truncate">
                                  {item.name}
                                </h3>
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-dmsans font-medium tracking-wide shrink-0"
                                  style={{
                                    backgroundColor: `${getCategoryColor(item.category)}18`,
                                    color: getCategoryColor(item.category),
                                    border: `1px solid ${getCategoryColor(item.category)}30`,
                                  }}
                                >
                                  {getCategoryLabel(item.category)}
                                </span>
                              </div>
                              <p className="text-[11px] font-dmsans text-muted-foreground/60">
                                {new Date(item.timestamp).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                              aria-label="Delete feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="font-dmsans text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">
                            {item.message}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}