"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [signUpFormData, setSignUpFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const type = showPassword ? "text" : "password";
  const Icon = showPassword ? EyeOff : Eye;

  function handleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  return (
    <form action="">
      <div className="min-h-screen flex items-center justify-center bg-[#686279]">
        <div className="p-3 mt-7 rounded-xl h-3/4 bg-[#2C2638] md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50">
          <Image
            src="/dummy_image3.png"
            width={400}
            height={500}
            alt="Auth Image"
            priority
            className="md:block hidden"
          />
          <Card className="bg-[#2C2638] border-0 shadow-none">
            <CardHeader className="flex items-center">
              <CardTitle className="text-3xl">Create an account</CardTitle>
              <CardDescription>
                Already have an account?
                <Button type="button" variant="link">
                  <Link href="/sign-in">Log in</Link>
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-col space-y-7 items-center">
              <div className="md:flex md:space-x-3 space-y-3">
                <Input
                  className="bg-[#3C364C]"
                  value={signUpFormData.firstName}
                  placeholder="First Name"
                  onChange={(e) =>
                    setSignUpFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
                <Input
                  className="bg-[#3C364C]"
                  value={signUpFormData.lastName}
                  placeholder="Last Name"
                  onChange={(e) =>
                    setSignUpFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
              <Input
                type="email"
                className="bg-[#3C364C]"
                placeholder="Email"
                onChange={(e) =>
                  setSignUpFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <div className="relative flex gap-2 items-center">
                <Input
                  type={type}
                  className="bg-[#3C364C]"
                  value={signUpFormData.password}
                  placeholder="Enter your password"
                  onChange={(e) =>
                    setSignUpFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={handleShowPassword}
                  className="absolute right-3 text-white/70 hover:text-white hover:cursor-pointer z-10"
                >
                  <Icon />
                </button>
              </div>
              <Button
                type="submit"
                className="w-full hover:cursor-pointer bg-[#6D54B5]"
              >
                Create account
              </Button>
            </CardContent>
            <CardFooter className="flex-col space-y-3 justify-center items-center">
              <div className="flex items-center justify-center gap-1 w-full">
                <div className="bg-slate-700 h-[1px] w-full"></div>
                <p className="text-slate-500 text-sm text-nowrap font-medium px-1">
                  Or register with
                </p>
                <div className="bg-slate-700 h-[1px] w-full"></div>
              </div>
              <Button
                variant="ghost"
                className="mt-2 flex text-md items-center justify-center w-full border  border-white px-5 hover:cursor-pointer"
              >
                <Image
                  src="/google-logo.png"
                  alt="Google"
                  width={32}
                  height={32}
                />
                Google
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
