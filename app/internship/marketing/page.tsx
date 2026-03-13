/* eslint react/no-unescaped-entities: "off" */
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowUpRight, LoaderCircle, Check } from "lucide-react";
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
  const [role, setRole] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [otherSkill, setOtherSkill] = useState("");
  const [tools, setTools] = useState("");
  const [profSEO, setProfSEO] = useState("");
  const [profSocial, setProfSocial] = useState("");
  const [profData, setProfData] = useState("");
  const [profContent, setProfContent] = useState("");
  const [profOutreach, setProfOutreach] = useState("");
  const [campaignExperience, setCampaignExperience] = useState("");
  const [contactMedia, setContactMedia] = useState("");
  const [whyInvolved, setWhyInvolved] = useState("");
  const [promotedBefore, setPromotedBefore] = useState("");
  const [increaseReach, setIncreaseReach] = useState("");

  const DRAFT_KEY = "marketing_internship_draft";

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
        if (parsed.role) setRole(parsed.role);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.otherSkill) setOtherSkill(parsed.otherSkill);
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.profSEO) setProfSEO(parsed.profSEO);
        if (parsed.profSocial) setProfSocial(parsed.profSocial);
        if (parsed.profData) setProfData(parsed.profData);
        if (parsed.profContent) setProfContent(parsed.profContent);
        if (parsed.profOutreach) setProfOutreach(parsed.profOutreach);
        if (parsed.campaignExperience) setCampaignExperience(parsed.campaignExperience);
        if (parsed.contactMedia) setContactMedia(parsed.contactMedia);
        if (parsed.whyInvolved) setWhyInvolved(parsed.whyInvolved);
        if (parsed.promotedBefore) setPromotedBefore(parsed.promotedBefore);
        if (parsed.increaseReach) setIncreaseReach(parsed.increaseReach);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = { fullName, email, phone, school, grade, age, time, experience, role, skills, otherSkill, tools, profSEO, profSocial, profData, profContent, profOutreach, campaignExperience, contactMedia, whyInvolved, promotedBefore, increaseReach };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    toast.success("Draft saved locally!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/marketing-sheet", {
        Name: fullName,
        Email: email,
        Phone: phone,
        School: school,
        Grade: grade,
        Age: age,
        Time: time,
        Experience: experience,
        Role: role,
        Skills: skills.map(s => s === "Other (please specify)" && otherSkill.trim() ? `Other: ${otherSkill}` : s),
        Tools: tools,
        Proficiencies: {
          SEO: profSEO,
          Social: profSocial,
          Data: profData,
          Content: profContent,
          Outreach: profOutreach
        },
        CampaignExperience: campaignExperience,
        ContactMedia: contactMedia,
        WhyInvolved: whyInvolved,
        PromotedBefore: promotedBefore,
        IncreaseReach: increaseReach,
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
    <div className="flex flex-col items-center min-h-screen bg-black text-white selection:bg-[#EC3C6E] selection:text-white">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-x-0 top-0 h-[100vh] bg-[radial-gradient(ellipse_95%_100%_at_50%_0%,#EC3C6E99_0%,#EC3C6E22_50%,transparent_100%)] pointer-events-none z-0"></div>
      <Toaster />

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center justify-start w-full h-fit lg:px-14 md:px-10 px-6 pt-[140px] pb-16 z-10">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-wintersolace bg-clip-text text-transparent bg-gradient-to-r from-[#EC3C6E] from-8% via-[#dfcbf0] to-white to-90% drop-shadow-[0_0_25px_rgba(236,72,153,0.3)] tracking-wide py-5 px-2">
          Join the Marketing Team
        </h1>
        <p className="text-sm sm:text-lg font-light text-white max-w-[40%] leading-[1.2]  mt-6">
          Become part of our growing community working to educate the world
          about cancer prevention and awareness through strategic marketing and outreach.
        </p>
      </div>

      {/* Form Section */}
      <div className="w-full flex flex-col items-center justify-center bg-transparent z-10 pb-24">
        <div className="w-full lg:max-w-[75%] xl:max-w-[65%] h-fit lg:px-6">
          <Card className="w-full border-none bg-transparent relative overflow-hidden rounded-[40px] liquid-glass min-h-[600px]">
            {/* CardGlass Effects */}
            {/* <div className="liquidGlass-effect pointer-events-none"></div>
            <div className="liquidGlass-tint pointer-events-none bg-[#EC3C6E08]"></div>
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
                    Please fill out all fields to complete your registration. We value your commitment and creativity.
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
                      Weekly Commitment*
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "1-2 hours",
                        "2-3 hours",
                        "3-4 hours",
                        "5+ hours",
                        "It depends, but I am interested.",
                      ].map((timeOption) => {
                        const isSelected = time === timeOption;
                        return (
                          <div
                            key={timeOption}
                            onClick={() => setTime(timeOption)}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#EC3C6E22] border-[#EC3C6E] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#EC3C6E]' : 'border-white/30'}`}>
                              {isSelected && <div className="w-2 h-2 bg-[#EC3C6E] rounded-full" />}
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="Tell us about your past experiences..."
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      Preferred Marketing Role*
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Marketing (Social Media)",
                        "Logistics",
                        "Media and content",
                        "Campaign strategy",
                        "Outreach and partnership",
                      ].map((roleOption) => {
                        const isSelected = role.includes(roleOption);
                        return (
                          <div
                            key={roleOption}
                            onClick={() => {
                              setRole(prev => isSelected ? prev.filter(r => r !== roleOption) : [...prev, roleOption]);
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#EC3C6E22] border-[#EC3C6E] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#EC3C6E] border-[#EC3C6E]' : 'border-white/30'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-dmsans whitespace-nowrap">{roleOption}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      Which of the following skills do you have experience in? (Select all that apply)*
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Social media marketing",
                        "Public relations / media outreach",
                        "Event planning & logistics",
                        "Partnership building",
                        "Research & campaign strategy",
                        "Email marketing",
                        "Other (please specify)"
                      ].map((skillOption) => {
                        const isSelected = skills.includes(skillOption);
                        return (
                          <div
                            key={skillOption}
                            onClick={() => {
                              setSkills(prev => isSelected ? prev.filter(r => r !== skillOption) : [...prev, skillOption]);
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#EC3C6E22] border-[#EC3C6E] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#EC3C6E] border-[#EC3C6E]' : 'border-white/30'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-dmsans whitespace-nowrap">{skillOption}</span>
                            {skillOption === "Other (please specify)" && isSelected && (
                              <Input
                                placeholder="Please specify..."
                                className="h-8 rounded-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 px-3 focus:bg-white/10 ml-2"
                                value={otherSkill}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setOtherSkill(e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="tools" className="font-dmsans font-medium text-white/80 text-sm">
                      What tools or platforms are you familiar with?*
                    </Label>
                    <textarea
                      id="tools"
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="e.g. Hootsuite, Mailchimp, Google Analytics..."
                      required
                      value={tools}
                      onChange={(e) => setTools(e.target.value)}
                    />
                  </div>

                  <div className="space-y-6 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      Rate your proficiency in the following areas:*
                    </Label>
                    <div className="flex flex-col gap-6">
                      {[
                        { label: "SEO & keyword research", state: profSEO, setter: setProfSEO },
                        { label: "Social media marketing", state: profSocial, setter: setProfSocial },
                        { label: "Data analytics & reporting", state: profData, setter: setProfData },
                        { label: "Content planning", state: profContent, setter: setProfContent },
                        { label: "Outreach & partnership building", state: profOutreach, setter: setProfOutreach },
                      ].map((prof) => (
                        <div key={prof.label} className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-white/80 font-dmsans text-sm">{prof.label}</span>
                          <div className="flex flex-wrap gap-4">
                            {["Beginner", "Intermediate", "Advanced"].map((level) => {
                              const isSelected = prof.state === level;
                              return (
                                <div
                                  key={level}
                                  onClick={() => prof.setter(level)}
                                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all flex-1 justify-center min-w-[120px] ${isSelected ? 'bg-[#EC3C6E22] border-[#EC3C6E] text-white' : 'bg-transparent border-white/10 text-white/50 hover:bg-white/10'}`}
                                >
                                  <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#EC3C6E]' : 'border-white/30'}`}>
                                    {isSelected && <div className="w-1.5 h-1.5 bg-[#EC3C6E] rounded-full" />}
                                  </div>
                                  <span className="text-sm font-dmsans">{level}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="campaignExperience" className="font-dmsans font-medium text-white/80 text-sm">
                      Have you previously worked on marketing campaigns, events, or outreach initiatives? If yes, briefly describe your role and responsibilities.*
                    </Label>
                    <textarea
                      id="campaignExperience"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="Briefly describe..."
                      required
                      value={campaignExperience}
                      onChange={(e) => setCampaignExperience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="contactMedia" className="font-dmsans font-medium text-white/80 text-sm">
                      How would you contact media or influencers to talk about our campaign?*
                    </Label>
                    <textarea
                      id="contactMedia"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="Your answer..."
                      required
                      value={contactMedia}
                      onChange={(e) => setContactMedia(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="whyInvolved" className="font-dmsans font-medium text-white/80 text-sm">
                      Why do you want to help with cancer awareness marketing?*
                    </Label>
                    <textarea
                      id="whyInvolved"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="Your answer..."
                      required
                      value={whyInvolved}
                      onChange={(e) => setWhyInvolved(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="promotedBefore" className="font-dmsans font-medium text-white/80 text-sm">
                      Have you ever promoted an event or cause before? What experience do you have in this field?*
                    </Label>
                    <textarea
                      id="promotedBefore"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="Your answer..."
                      required
                      value={promotedBefore}
                      onChange={(e) => setPromotedBefore(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="increaseReach" className="font-dmsans font-medium text-white/80 text-sm">
                      How would you increase our organization's reach?*
                    </Label>
                    <textarea
                      id="increaseReach"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#EC3C6E] transition-all"
                      placeholder="Your answer..."
                      required
                      value={increaseReach}
                      onChange={(e) => setIncreaseReach(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 pt-10 flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      className="flex-1 h-16 text-lg font-dmsans font-bold rounded-full bg-[#EC3C6E] hover:bg-[#EC3C6E]/90 text-black transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_10px_30px_-10px_rgba(236,72,153,0.5)]"
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
                <div className="w-20 h-20 rounded-full bg-[#EC3C6E22] border border-[#EC3C6E] flex items-center justify-center">
                  <Check className="w-10 h-10 text-[#EC3C6E]" />
                </div>
                <div>
                  <h3 className="text-2xl font-wintersolace bg-clip-text text-transparent bg-gradient-to-r from-[#EC3C6E] from-8% to-[#ffffff] to-60% mb-4 tracking-wide">Thank You for Registering!</h3>
                  <p className="text-muted-foreground text-lg font-light max-w-md">We've received your application and will review it soon. Keep an eye on your email!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InternshipFooter
        iconPath="/icons/marketing.svg"
        departmentName="Department of Marketing"
        themeColor="#EC3C6E"
      />
    </div>
  );
}
