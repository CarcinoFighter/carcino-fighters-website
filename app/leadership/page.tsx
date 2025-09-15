"use client"
import Image from "next/image";
import * as React from "react"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Leadership() {
  // const [viewportWidth, setViewportWidth] = React.useState(
  //   typeof window !== "undefined" ? window.innerWidth : 0
  // );

  // // React.useEffect(() => {
  // //   const handleResize = () => setViewportWidth(window.innerWidth);
  // //   window.addEventListener("resize", handleResize);
  // //   return () => window.removeEventListener("resize", handleResize);
  // // }, []);

  // console.log(viewportWidth);
  // const divCount = Math.ceil(viewportWidth / 100);
  // console.log('divCount:'+divCount);

  return (
    <div className="h-dvh overflow-y-scroll overflow-x-hidden w-full -z-20 font-giest pb-10">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 pt-30 opacity-30 ">
      <Image
        src={"/leadership_bg.png"}
        alt="Leadership"
        width={1920}
        height={1080}
        quality={100}
        className="object-cover max-w-[70%] overflow-hidden hidden dark:inline animate-door-open animate-rad "
      />
      </div>

      <div className="z-0 flex flex-col items-center justify-center gap-10 lg:px-18 md:px-14 px-8 pt-[80px] text-black dark:text-white overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-3 animate-[door-open_1s_ease-in-out_forwards]">
        <h1 className="text-3xl text-center ">
        Our Leadership
        </h1>
        <Label className="border gap-2 bg-[hsla(240 0% 90%)] dark:bg-[hsla(0 0% 9%)] flex flex-row px-5 py-3 items-center justify-center rounded-full text-sm text-black dark:text-white font-medium">Meet the Team <ArrowUpRight size={18} /></Label>
      </div>
      <div className="flex flex-col md:grid grid-flow-col grid-rows-2 w-full max-w-[1300px] justify-around h-fit gap-4 animate-[fade-in_1s_ease-in-out_forwards]">
        <div className="h-full flex items-center justify-center py-5 px-7 flex-col bg-[#66666612] backdrop-blur-[100px] border-black/5 dark:border-white/5 border-[1px] rounded-4xl gap-10">
        <Avatar className="h-20 w-20" >
          <AvatarImage className="object-cover" src="/avatars/rajannya.png" />
          <AvatarFallback>
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatars/dummy.png" />
            <AvatarFallback>
            <LoaderCircle size={16} className="animate-spin" />
            </AvatarFallback>
          </Avatar>
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold">Rajannya Das, Founder & MD</div>
        <div className="text-justify">
          A science enthusiast who’s usually found lifting weights for peace, balancing deadlines with dopamine bike rides, travelling and learning languages. Mitosis deserves a standing ovation— biology said yes.
        </div>
        </div>
        <div className="h-full flex items-center justify-center py-5 px-7 flex-col bg-[#66666612] backdrop-blur-[100px] border-black/5 dark:border-white/5 border-[1px] rounded-4xl gap-10">
        <Avatar className="h-20 w-20" >
          <AvatarImage className="object-cover" src="/avatars/agnihotra.png" />
          <AvatarFallback>
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatars/dummy.png" />
            <AvatarFallback>
            <LoaderCircle size={16} className="animate-spin" />
            </AvatarFallback>
          </Avatar>
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold">Agnihotra Nath, Head of Design</div>
        <div className="text-justify">
          Head of Student Team at Google. Endless passion for cars, and music. Porsche enthusiast with a sick garage full of fast cars. Keen eye for detail and topped off with sweet ADHD.
        </div>
        </div>
        <div className="h-full flex items-center justify-center py-5 px-7 flex-col bg-[#66666612] backdrop-blur-[100px] border-black/5 dark:border-white/5 border-[1px] rounded-4xl gap-10">
        <Avatar className="h-20 w-20" >
          <AvatarImage className="object-cover" src="/avatars/anjishnu.png" />
          <AvatarFallback>
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatars/dummy.png" />
            <AvatarFallback>
            <LoaderCircle size={16} className="animate-spin" />
            </AvatarFallback>
          </Avatar>
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold">Anjishnu Dey, Head of Development</div>
        <div className="text-justify">
          Loves physics, hates bad UI. Punches things for fun (MMA, not bugs-but also bugs). Runs on curiosity, caffeine, and clean builds. <br />Physicist by soul. Fights bugs, throws hands, hits gym. If it’s complex, he’s into it. If it’s boring, he’s out.  Obsessed with clean design, clean lifts, and clean wins.
        </div>
        </div>
        <div className="h-full flex items-center justify-center py-5 px-7 flex-col bg-[#66666612] backdrop-blur-lg border-black/5 dark:border-white/5 border-[1px] rounded-4xl gap-10">
        <Avatar className="h-20 w-20" >
          <AvatarImage className="object-cover" src="/avatars/soushree.png" />
          <AvatarFallback>
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatars/dummy.png" />
            <AvatarFallback>
            <LoaderCircle size={16} className="animate-spin" />
            </AvatarFallback>
          </Avatar>
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold">Soushree Chakraborty, Head of Research</div>
        <div className="text-justify">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Reiciendis earum voluptate aliquid, explicabo repellendus voluptatibus, voluptatum harum nisi dolor, est itaque voluptatem? Dolore temporibus animi voluptatem. Nobis non dicta modi.
        </div>
        </div>
      </div>
      </div>

    </div>

  );
}

/* <shape> */


/* Note: backdrop-filter has minimal browser support */
