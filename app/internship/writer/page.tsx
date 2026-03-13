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
  const [criticism, setCriticism] = useState("");

  const DRAFT_KEY = "writer_internship_draft";

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
        if (parsed.criticism) setCriticism(parsed.criticism);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = { fullName, email, phone, school, grade, age, time, experience, criticism };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    toast.success("Draft saved locally!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/writer-sheet", {
        Name: fullName,
        Email: email,
        Phone: phone,
        School: school,
        Grade: grade,
        Age: age,
        Time: time,
        Experience: experience,
        Criticism: criticism,
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
    <div className="flex flex-col items-center min-h-screen bg-black text-white selection:bg-[#ECA92B] selection:text-white">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-x-0 top-0 h-[100vh] bg-[radial-gradient(ellipse_95%_100%_at_50%_0%,#ECA92B99_0%,#ECA92B22_50%,transparent_100%)] pointer-events-none z-0"></div>
      <Toaster />

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center justify-start w-full h-fit lg:px-14 md:px-10 px-6 pt-[140px] pb-16 z-10">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-wintersolace bg-clip-text text-transparent bg-gradient-to-r from-[#ECA92B] from-8% via-[#dfcbf0] to-white to-90% drop-shadow-[0_0_25px_rgba(245,158,11,0.3)] tracking-wide py-5 px-2">
          Join the Writing Team
        </h1>
        <p className="text-sm sm:text-lg font-light text-white max-w-[40%] leading-[1.2]  mt-6">
          Become part of our growing community working to educate the world
          about cancer prevention and awareness through research and storytelling.
        </p>
      </div>

      {/* Form Section */}
      <div className="w-full flex flex-col items-center justify-center bg-transparent z-10 pb-24">
        <div className="w-full lg:max-w-[75%] xl:max-w-[65%] h-fit lg:px-6">
          <Card className="w-full border-none bg-transparent relative overflow-hidden rounded-[40px] liquid-glass min-h-[600px]">
            {/* CardGlass Effects */}
            {/* <div className="liquidGlass-effect pointer-events-none"></div>
            <div className="liquidGlass-tint pointer-events-none bg-[#ECA92B08]"></div>
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
                    Please fill out all fields to complete your registration. We are looking for researchers and storytellers who want to make a difference.
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
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#ECA92B22] border-[#ECA92B] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#ECA92B]' : 'border-white/30'}`}>
                              {isSelected && <div className="w-2 h-2 bg-[#ECA92B] rounded-full" />}
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:bg-white/10 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#ECA92B] transition-all"
                      placeholder="Tell us about your past experiences as a writer..."
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="font-dmsans font-medium text-white/80 text-sm">
                      Are you comfortable with feedback?*
                    </Label>
                    <div className="flex gap-6">
                      {["Yes", "No", "Maybe"].map((option) => {
                        const isSelected = criticism === option;
                        return (
                          <div
                            key={option}
                            onClick={() => setCriticism(option)}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#ECA92B22] border-[#ECA92B] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#ECA92B]' : 'border-white/30'}`}>
                              {isSelected && <div className="w-2 h-2 bg-[#ECA92B] rounded-full" />}
                            </div>
                            <span className="text-sm font-dmsans">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-10 flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      className="flex-1 h-16 text-lg font-dmsans font-bold rounded-full bg-[#ECA92B] hover:bg-[#ECA92B]/90 text-black transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)]"
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
                <div className="w-20 h-20 rounded-full bg-[#ECA92B22] border border-[#ECA92B] flex items-center justify-center">
                  <Check className="w-10 h-10 text-[#ECA92B]" />
                </div>
                <div>
                  <h3 className="text-2xl font-wintersolace bg-clip-text text-transparent bg-gradient-to-r from-[#ECA92B] from-8% to-[#ffffff] to-60% mb-4 tracking-wide">Thank You for Registering!</h3>
                  <p className="text-muted-foreground text-lg font-light max-w-md">We've received your application and will review it soon. Keep an eye on your email!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InternshipFooter 
        iconPath="/icons/research.svg" 
        departmentName="Department of Research" 
        themeColor="#ECA92B" 
      />
    </div>
  );
}
