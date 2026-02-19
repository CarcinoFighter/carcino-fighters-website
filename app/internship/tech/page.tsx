/* eslint react/no-unescaped-entities: "off" */
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowUpRight, LoaderCircle, Check } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

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
  const [portfolio, setPortfolio] = useState("");
  const [languages, setLanguages] = useState("");
  const [role, setRole] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiRoute = process.env.NEXT_PUBLIC_API_ROUTE;
      const response = await axios.post(`${apiRoute}/tech-sheet`, {
        Name: fullName,
        Email: email,
        Phone: phone,
        School: school,
        Grade: grade,
        Age: age,
        Time: time,
        Experience: experience,
        Criticism: criticism,
        Portfolio: portfolio,
        Languages: languages,
        Role: role,
      });

      if (response.status === 200) {
        toast.success("Submitted successfully!");
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
      setSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-start min-h-screen bg-background">
      <div className="w-full h-[100svh]  bg-radial-[at_50%_0%] from-[-20%] dark:from-[#471F77] from-[#e5cfff] to-background to-[70%] blur-lg fixed"></div>
      <Toaster />

      {/* Hero Section */}
      <div className="flex flex-col lg:gap-1 md:gap-1 gap-1 items-center text-center lg:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pt-[80px] pb-5 z-10">
        <h1
          className="text-4xl lg:text-4xl xl:text-6xl font-wintersolace bg-gradient-to-r
  from-[#b793d8] from-8%
  to-[#ffffff] to-85%
  bg-clip-text text-transparent font-bold px-5 py-10"
        >
          Sign up for our Tech Team
        </h1>
        <p className="text-sm sm:text-xl font-[100] text-white font-dmsans tracking-[120%] max-w-[33%] text-center">
          Become part of our growing community working to educate the world
          about cancer prevention and awareness.
        </p>
      </div>

      {/* Form Section */}
      <div className="w-full flex flex-col lg:flex-col items-center justify-between bg-transparent z-10">
        <div className="flex flex-col items-center lg:items-center justify-center gap-6 w-full lg:max-w-[60%] h-fit lg:px-14 md:px-10 px-6 py-10">
          <Card className="w-full max-w-3xl border-accent bg-background">
            <CardHeader>
              <h2 className="text-2xl font-dmsans font-semibold text-foreground">
                Student Information
              </h2>
              <p className="text-muted-foreground font-dmsans font-light text-white">
                Please fill out all fields to complete your registration
              </p>
            </CardHeader>
            <CardContent className={submitted ? `hidden` : ``}>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Personal Information */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName" className="font-dmsans font-light">
                    Full Name*
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="py-5 rounded-[10px]"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-dmsans font-light">
                    Email Address*
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="py-5 rounded-[10px]"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-dmsans font-light">
                    Contact Number*
                  </Label>

                  <div className="flex flex-row items-center justify-center gap-2 text-sm">
                    +91
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      placeholder="1234567890"
                      className="py-5 rounded-[10px]"
                      required
                      value={phone}
                      onChange={(e) => {
                        const phoneRegex = /^(?:\+91)?\s*[\d\s-]{0,10}$/; // Allows +91, spaces, and dashes
                        const sanitizedValue = e.target.value.replace(
                          /[\s-]/g,
                          "",
                        ); // Remove spaces and dashes
                        if (phoneRegex.test(e.target.value)) {
                          setPhone(sanitizedValue);
                        } else {
                          toast.error("Please enter a valid phone number.");
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="school" className="font-dmsans font-light">
                    School/Institution Name*
                  </Label>
                  <Input
                    id="school"
                    name="school"
                    type="text"
                    placeholder="Enter your school name"
                    className="py-5 rounded-[10px]"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="font-dmsans font-light">
                    Grade / Year of Passing / Graduating*
                  </Label>
                  <Input
                    id="grade"
                    name="grade"
                    type="text"
                    placeholder="e.g. 12th Grade"
                    className="py-5 rounded-[10px] rounded-[10px]"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="font-dmsans font-light">
                    Age*
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Your age"
                    className="py-5 rounded-[10px]"
                    required
                    value={age}
                    onChange={(e) => {
                      const ageRegex = /^[0-9]*$/;
                      if (ageRegex.test(e.target.value)) {
                        setAge(e.target.value);
                      } else {
                        toast.error("Please enter a valid age (numbers only).");
                      }
                    }}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="time" className="font-dmsans font-light">
                    How much time per week can you commit to the team?*
                  </Label>
                  <div className="flex flex-col gap-2 p-3">
                    {[
                      "1-2 hours",
                      "2-3 hours",
                      "3-4 hours",
                      "5+ hours",
                      "It depends, but i am interested and committed.",
                    ].map((timeOption, index) => {
                      const selected = time === timeOption;
                      return (
                        <div
                          key={index}
                          className="flex flex-row gap-2 items-center h-full cursor-pointer"
                          onClick={() => setTime(timeOption)}
                          tabIndex={0}
                          role="radio"
                          aria-checked={selected}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter")
                              setTime(timeOption);
                          }}
                        >
                          <div
                            className={`w-4 h-4 border border-primary rounded-full flex items-center justify-center transition-colors ${
                              selected ? "bg-white" : "bg-transparent"
                            }`}
                          >
                            {selected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <Label
                            htmlFor={`time-${index}`}
                            className="font-dmsans font-light cursor-pointer"
                          >
                            {timeOption}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message" className="font-dmsans font-light">
                    Qualification or Past experience*
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us about your past experiences or put in a link for your resume"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  ></textarea>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="time" className="font-dmsans font-light">
                    Are you comfortable working in a team and receiving feedback
                    on your work?*
                  </Label>
                  <div className="flex flex-col gap-2 p-3">
                    {["Yes", "No", "I am not sure"].map(
                      (criticismOption, index) => {
                        const selected = criticism === criticismOption;
                        return (
                          <div
                            key={index}
                            className="flex flex-row gap-2 items-center h-full cursor-pointer"
                            onClick={() => setCriticism(criticismOption)}
                            tabIndex={0}
                            role="radio"
                            aria-checked={selected}
                            onKeyDown={(e) => {
                              if (e.key === " " || e.key === "Enter")
                                setCriticism(criticismOption);
                            }}
                          >
                            <div
                              className={`w-4 h-4 border border-primary rounded-full flex items-center justify-center transition-colors ${
                                selected ? "bg-primary" : "bg-transparent"
                              }`}
                            >
                              {/* Only show the inner dot if selected */}
                              {selected && (
                                <div className="w-2 h-2 bg-background rounded-full"></div>
                              )}
                            </div>
                            <Label
                              htmlFor={`criticism-${index}`}
                              className="font-dmsans font-light cursor-pointer"
                            >
                              {criticismOption}
                            </Label>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message" className="font-dmsans font-light">
                    Link to your GitHub / portfolio / personal website (if any)
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us about your past experiences or put in a link for your resume"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                  ></textarea>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message" className="font-dmsans font-light">
                    What languages, frameworks, or tools do you know best?*
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us about your past experiences or put in a link for your resume"
                    required
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                  ></textarea>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="time" className="font-dmsans font-light">
                    Preferred Role*
                  </Label>
                  <div className="flex flex-col gap-2 p-3">
                    {[
                      "Frontend",
                      "Backend",
                      "Fullstack",
                      "UI/UX",
                      "DevOps",
                      "AI",
                    ].map((roleOption, index) => (
                      <div
                        key={index}
                        className="flex flex-row gap-2 items-center h-full"
                      >
                        <div>
                          <div
                            onClick={() => {
                              const isChecked = role.includes(roleOption);
                              setRole((prev) => {
                                if (isChecked) {
                                  return prev.filter(
                                    (item) => item !== roleOption,
                                  );
                                } else {
                                  return [...prev, roleOption];
                                }
                              });
                            }}
                            className={`aspect-square w-4 border border-primary rounded-sm relative cursor-pointer ${
                              role.includes(roleOption) ? "bg-primary" : ""
                            }`}
                          >
                            {role.includes(roleOption) && (
                              <Check className="absolute h-3 w-3 aspect-square mx-auto my-auto top-0 bottom-0 left-0 right-0 stroke-3" />
                            )}
                          </div>
                        </div>
                        <Label
                          htmlFor={`writing-${index}`}
                          className="font-dmsans font-light"
                        >
                          {roleOption}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <Button
                    variant="default"
                    type="submit"
                    className="w-full py-6 text-lg font-dmsans font-medium cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        Submitting{" "}
                        <LoaderCircle className="animate-spin ml-2" />
                      </>
                    ) : (
                      <>
                        Submit Application <ArrowUpRight className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardContent className={submitted ? `py-10 ` : `hidden`}>
              Thank You for Registering! We'll consider your application and
              reach back in a few days!
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
