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
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeSoft },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: easeSoft },
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
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);

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
      className="flex flex-col relative lg:block lg:h-screen w-full overflow-y-scroll overflow-x-hidden items-start gap-20 bg-background hide-scrollbar"
    >
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        className="relative w-full min-h-[50vh] lg:min-h-[60vh] flex items-center justify-center overflow-hidden"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Parallax background gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 py-20">
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-6"
          >
            <MessageSquare className="w-8 h-8 text-primary" />
            <span className="text-sm font-dmsans text-muted-foreground uppercase tracking-wider">
              Your Voice Matters
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-instrumentserifitalic bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary/70 mb-6"
          >
            Share Your Feedback
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg font-dmsans text-muted-foreground max-w-2xl leading-relaxed"
          >
            Help us improve The Carcino Foundation. Whether it's a bug, feature
            request, or just a thought—we're listening. Every piece of feedback
            shapes our future.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Feedback Form */}
          <motion.div
            ref={formRef}
            variants={fadeScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            <Card className="relative overflow-hidden p-8 sm:p-10 bg-card/50 backdrop-blur-sm border border-border/50">
              {/* Liquid glass effects */}
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
              <div className="cardGlass-borders pointer-events-none" />
              <div className="cardGlass-shine pointer-events-none" />
              <div className="glass-noise" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-instrumentserifitalic text-foreground">
                    Submit Feedback
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="font-dmsans text-sm text-muted-foreground"
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
                      className="bg-background/50 border-border/50 font-dmsans focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-dmsans text-sm text-muted-foreground"
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
                      className="bg-background/50 border-border/50 font-dmsans focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label className="font-dmsans text-sm text-muted-foreground">
                      Category
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        ["general", "bug", "feature", "improvement"] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2.5 rounded-lg border font-dmsans text-sm transition-all ${
                            category === cat
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 bg-background/30 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {getCategoryLabel(cat)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="font-dmsans text-sm text-muted-foreground"
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
                      className="bg-background/50 border-border/50 font-dmsans focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative px-6 py-6 rounded-full overflow-hidden backdrop-blur-sm transition-all duration-300 font-dmsans font-medium hover:scale-[102%]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <span className="animate-pulse">Submitting...</span>
                        </>
                      ) : submitSuccess ? (
                        <>
                          <span>✓ Submitted!</span>
                        </>
                      ) : (
                        <>
                          Submit Feedback <Send className="w-4 h-4" />
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

          {/* Recent Feedback Display */}
          <motion.div
            variants={fadeScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            <div className="sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-2xl font-instrumentserifitalic text-foreground">
                  Recent Submissions
                </h2>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
                {submissions.length === 0 ? (
                  <Card className="p-8 text-center bg-card/30 backdrop-blur-sm border border-border/30">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="font-dmsans text-muted-foreground">
                      No feedback yet. Be the first to share your thoughts!
                    </p>
                  </Card>
                ) : (
                  submissions.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                      <Card
                        className="relative overflow-hidden p-6 bg-card/40 backdrop-blur-sm border border-border/40 group hover:border-primary/50 transition-all duration-300"
                        style={
                          {
                            "--hover-card-bg": getCategoryColor(item.category),
                          } as React.CSSProperties
                        }
                      >
                        {/* Glass effects */}
                        <div className="absolute inset-0 liquidGlass-effect pointer-events-none" />
                        <div className="cardGlass-tint pointer-events-none" />
                        <div className="cardGlass-shine pointer-events-none" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-dmsans font-semibold text-foreground transition-colors">
                                  {item.name}
                                </h3>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-dmsans"
                                  style={{
                                    backgroundColor: `${getCategoryColor(item.category)}20`,
                                    color: getCategoryColor(item.category),
                                  }}
                                >
                                  {getCategoryLabel(item.category)}
                                </span>
                              </div>
                              <p className="text-xs font-dmsans text-muted-foreground">
                                {new Date(item.timestamp).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Delete feedback"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="font-dmsans text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {item.message}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {submissions.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-xs font-dmsans text-muted-foreground">
                    {submissions.length} submission
                    {submissions.length !== 1 ? "s" : ""} stored locally
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
