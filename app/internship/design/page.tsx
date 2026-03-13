/* eslint react/no-unescaped-entities: "off" */
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowUpRight, LoaderCircle, Check, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { InternshipFooter } from "@/components/InternshipFooter";

export default function RegistrationPage() {
  const [experience, setExperience] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [age, setAge] = useState("");
  const [time, setTime] = useState("");
  const [styleFascination, setStyleFascination] = useState("");
  const [favoriteDesigns, setFavoriteDesigns] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [portfolio, setPortfolio] = useState<string[]>([""]);
  const [apps, setApps] = useState<string[]>([]);
  const [otherApp, setOtherApp] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [otherPlatform, setOtherPlatform] = useState("");

  const DRAFT_KEY = "design_internship_draft";

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.school) setSchool(parsed.school);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.age) setAge(parsed.age);
        if (parsed.time) setTime(parsed.time);
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.styleFascination) setStyleFascination(parsed.styleFascination);
        if (parsed.favoriteDesigns) setFavoriteDesigns(parsed.favoriteDesigns);
        if (parsed.proficiency) setProficiency(parsed.proficiency);
        if (parsed.portfolio) setPortfolio(parsed.portfolio);
        if (parsed.apps) setApps(parsed.apps);
        if (parsed.otherApp) setOtherApp(parsed.otherApp);
        if (parsed.platforms) setPlatforms(parsed.platforms);
        if (parsed.otherPlatform) setOtherPlatform(parsed.otherPlatform);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = { fullName, email, phone, school, grade, age, time, experience, styleFascination, favoriteDesigns, proficiency, portfolio, apps, otherApp, platforms, otherPlatform };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    toast.success("Draft saved locally!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/design-sheet", {
        Name: fullName,
        Email: email,
        Phone: phone,
        School: school,
        Grade: grade,
        Age: age,
        Time: time,
        Experience: experience,
        Style: styleFascination,
        FavoriteDesigns: favoriteDesigns,
        Proficiency: proficiency,
        Portfolio: portfolio.filter(p => p.trim() !== "").join("\n"),
        Apps: apps.map(a => a === "Other" && otherApp.trim() ? `Other: ${otherApp}` : a),
        Platforms: platforms.map(p => p === "Other" && otherPlatform.trim() ? `Other: ${otherPlatform}` : p),
      });

      if (response.status === 200) {
        toast.success("Submitted successfully!");
        setSubmitted(true);
        localStorage.removeItem(DRAFT_KEY);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Full error:", error);

      let errorMessage = "Failed to submit form";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage =
            error.response.data.message ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "No response from server - check network";
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white selection:bg-[#3373F2] selection:text-white">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-x-0 top-0 h-[100vh] bg-[radial-gradient(ellipse_95%_100%_at_50%_0%,#3373F299_0%,#3373F222_50%,transparent_100%)] pointer-events-none z-0"></div>
      <Toaster />

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center justify-start w-full h-fit lg:px-14 md:px-10 px-6 pt-[140px] pb-16 z-10">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-wintersolace bg-clip-text text-transparent bg-gradient-to-r from-[#3373F2] from-8% via-[#dfcbf0] to-white to-90% drop-shadow-[0_0_25px_rgba(59,130,246,0.3)] tracking-wide py-5 px-2">
          Join the Design Team
        </h1>
        <p className="text-sm sm:text-lg font-light text-white max-w-[40%] leading-[1.2]  mt-6">
          Become part of our growing community working to educate the world
          about cancer prevention and awareness through creative and impactful design.
        </p>
      </div>

      {/* Form Section */}
      <div className="w-full flex flex-col items-center justify-center bg-transparent z-10 pb-24">
        <div className="w-full lg:max-w-[75%] xl:max-w-[65%] h-fit lg:px-6">
          <Card className="w-full border-none bg-transparent relative overflow-hidden rounded-[40px] liquid-glass min-h-[600px]">
            {/* CardGlass Effects */}
            {/* <div className="liquidGlass-effect pointer-events-none"></div>
            <div className="liquidGlass-tint pointer-events-none bg-[#3373F208]"></div>
            <div className="glass-noise"></div> */}
            <div className="cardGlass-borders pointer-events-none"></div>
            <div className="cardGlass-shine pointer-events-none"></div>

            <CardContent className={`relative z-10 w-full p-4 md:p-8 lg:p-12 ${submitted ? 'hidden' : ''}`}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-10 lg:gap-12">
                {/* Top Section: Info */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-dmsans font-medium text-white tracking-tight">
                    Student Information
                  </h2>
                  <p className="text-muted-foreground font-dmsans font-light text-base leading-relaxed max-w-3xl">
                    Please fill out all fields to complete your registration. Your portfolio and creative vision are what we look for.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="fullName" className="font-dmsans font-medium text-white/80 text-sm">
                      Full Name*
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="font-dmsans font-medium text-white/80 text-sm">
                      Email Address*
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="font-dmsans font-medium text-white/80 text-sm">
                      Contact Number*
                    </Label>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 font-dmsans font-medium">+91</span>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="1234567890"
                        className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors"
                        required
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhone(val);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="school" className="font-dmsans font-medium text-white/80 text-sm">
                      School / Institution*
                    </Label>
                    <Input
                      id="school"
                      placeholder="Enter your school name"
                      className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="grade" className="font-dmsans font-medium text-white/80 text-sm">
                      Grade / Year*
                    </Label>
                    <Input
                      id="grade"
                      placeholder="e.g. 12th Grade"
                      className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors"
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="age" className="font-dmsans font-medium text-white/80 text-sm">
                      Age*
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Your age"
                      className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      How much experience do you have?*
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "1-2 years",
                        "2-3 years",
                        "3-4 years",
                        "5+ years",
                        "It depends, but I am interested.",
                      ].map((timeOption) => {
                        const isSelected = time === timeOption;
                        return (
                          <div
                            key={timeOption}
                            onClick={() => setTime(timeOption)}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#3373F222] border-[#3373F2] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#3373F2]' : 'border-white/30'}`}>
                              {isSelected && <div className="w-2 h-2 bg-[#3373F2] rounded-full" />}
                            </div>
                            <span className="text-sm font-dmsans">{timeOption}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="experience" className="font-dmsans font-medium text-white/80 text-sm">
                      Qualification or Past experience*
                    </Label>
                    <textarea
                      id="experience"
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#3373F2] transition-all"
                      placeholder="Tell us about your past experiences or link your portfolio..."
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="styleFascination" className="font-dmsans font-medium text-white/80 text-sm">
                      ⁠As a designer, what kind of Graphic or UX/UI Design style fascinates you?
                    </Label>
                    <textarea
                      id="styleFascination"
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#3373F2] transition-all"
                      placeholder="Tell us about the styles that inspire you..."
                      required
                      value={styleFascination}
                      onChange={(e) => setStyleFascination(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="favoriteDesigns" className="font-dmsans font-medium text-white/80 text-sm">
                      List 3 design styles or websites that you like for their design.*
                    </Label>
                    <textarea
                      id="favoriteDesigns"
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#3373F2] transition-all"
                      placeholder="1. Apple (Minimalism) 2. Stripe (Gradients)..."
                      required
                      value={favoriteDesigns}
                      onChange={(e) => setFavoriteDesigns(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      Rate your proficiency:*
                    </Label>
                    <div className="flex gap-6 flex-wrap">
                      {["Beginner", "Intermediate", "Advanced", "Expert"].map((option) => {
                        const isSelected = proficiency === option;
                        return (
                          <div
                            key={option}
                            onClick={() => setProficiency(option)}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#3373F222] border-[#3373F2] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#3373F2]' : 'border-white/30'}`}>
                              {isSelected && <div className="w-2 h-2 bg-[#3373F2] rounded-full" />}
                            </div>
                            <span className="text-sm font-dmsans">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      ⁠Please share links to your design portfolios if any.
                    </Label>
                    <div className="flex flex-col gap-3">
                      {portfolio.map((link, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            placeholder="https://behance.net/your-profile"
                            className="h-14 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 px-6 focus:bg-white/10 transition-colors flex-1"
                            value={link}
                            onChange={(e) => {
                              const newPortfolio = [...portfolio];
                              newPortfolio[index] = e.target.value;
                              setPortfolio(newPortfolio);
                            }}
                          />
                          {portfolio.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => {
                                const newPortfolio = portfolio.filter((_, i) => i !== index);
                                setPortfolio(newPortfolio);
                              }}
                              variant="ghost"
                              className="h-14 w-14 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-500 border border-white/10 hover:border-red-500/20 shrink-0"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={() => setPortfolio([...portfolio, ""])}
                      variant="outline"
                      className="w-full h-14 rounded-xl border-dashed border-white/20 bg-transparent hover:bg-white/5 text-white/70 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                      <Plus className="w-5 h-5" />
                      Add another link
                    </Button>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      Which Apps/Platforms are you familar with?*
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Procreate",
                        "Figma",
                        "Sketch",
                        "Adobe Illustrator",
                        "Canva",
                        "Blender",
                        "Affinity Designer",
                        "Other"
                      ].map((appOption) => {
                        const isSelected = apps.includes(appOption);
                        return (
                          <div
                            key={appOption}
                            onClick={() => {
                              setApps(prev => isSelected ? prev.filter(r => r !== appOption) : [...prev, appOption]);
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#3373F222] border-[#3373F2] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#3373F2] border-[#3373F2]' : 'border-white/30'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-dmsans whitespace-nowrap">{appOption}</span>
                            {appOption === "Other" && isSelected && (
                              <Input
                                placeholder="Please specify..."
                                className="h-8 rounded-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 px-3 focus:bg-white/10 ml-2"
                                value={otherApp}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setOtherApp(e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      What platform do you use?*
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "iOS",
                        "Android",
                        "Windows",
                        "MacOS",
                        "Linux",
                        "Other",
                      ].map((platformOption) => {
                        const isSelected = platforms.includes(platformOption);
                        return (
                          <div
                            key={platformOption}
                            onClick={() => {
                              setPlatforms(prev => isSelected ? prev.filter(r => r !== platformOption) : [...prev, platformOption]);
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#3373F222] border-[#3373F2] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#3373F2] border-[#3373F2]' : 'border-white/30'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-dmsans whitespace-nowrap">{platformOption}</span>
                            {platformOption === "Other" && isSelected && (
                              <Input
                                placeholder="Please specify..."
                                className="h-8 rounded-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 px-3 focus:bg-white/10 ml-2"
                                value={otherPlatform}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setOtherPlatform(e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-10 flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      className="flex-1 h-16 text-lg font-dmsans font-bold rounded-full bg-[#3373F2] hover:bg-[#3373F2]/90 text-black transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Submitting <LoaderCircle className="animate-spin ml-2" /></>
                      ) : (
                        <>Submit Your Application <ArrowUpRight className="ml-2 w-5 h-5" /></>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveDraft}
                      className="px-10 h-16 text-lg font-dmsans font-bold rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                      Save Draft
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>

            <CardContent className={`relative z-10 w-full py-32 text-center ${submitted ? '' : 'hidden'}`}>
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#3373F222] border border-[#3373F2] flex items-center justify-center">
                  <Check className="w-10 h-10 text-[#3373F2]" />
                </div>
                <div>
                  <h3 className="text-2xl font-wintersolace bg-clip-text text-transparent bg-gradient-to-r from-[#3373F2] from-8% to-[#ffffff] to-60% mb-4 tracking-wide">Thank You for Registering!</h3>
                  <p className="text-muted-foreground text-lg font-light max-w-md">We've received your application and will review it soon. Keep an eye on your email!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InternshipFooter
        iconPath="/icons/design.svg"
        departmentName="Department of Design"
        themeColor="#3373F2"
      />
    </div>
  );
}
