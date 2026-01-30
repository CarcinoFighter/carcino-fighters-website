"use client"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Image from "next/image"
import Link from "next/link"
import React, { useState } from "react";
import { cn } from "@/lib/utils"
import { BookOpen, House, Menu, SearchX, User, UserPlus } from "lucide-react"
// import { ModeTogglePhone } from "@/components/ui/mode-phone"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";



const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {


  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    fetch("/api/admin", { method: "GET" })
      .then(res => res.json())
      .then(data => setIsAuthenticated(!!data?.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, [pathname]); // Re-check on route change

  const tabs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/leadership" },
    { label: "Articles", href: "/article" },
  ];
  const selectedTab = tabs.find(tab =>
    tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
  )?.label;

  const isAuthPage = pathname.startsWith("/sign") || pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <div className="">
      {/* Navbar */}
      <div className="flex-row py-4 fixed left-0 right-0 justify-center lg:px-14 md:px-10 px-6 top-0 z-30 hidden items-center sm:flex pointer-events-none gap-4">
        <div className="pointer-events-auto">
          <NavigationMenu
            className={cn(
              "w-full flex flex-row px-1 py-1 rounded-full items-center justify-between relative z-10",
              "overflow-hidden isolation-isolate liquid-glass !shadow-none"
            )}
          ><div className="liquidGlass-effect "></div>
            {/* <div className="liquidGlass-tint"></div> */}
            <div className="liquidGlass-shine"></div>
            <div className="liquidGlass-text"></div>

            <NavigationMenuList className="gap-[50px] relative">
              <NavigationMenuItem>
                <div className="pl-4">
                  <Image src={"/logo-w.svg"} alt={"logo"} width={25} height={25} className=" object-cover" />
                </div>
              </NavigationMenuItem>
              {/* Tab links with animated pill indicator */}
              {tabs.map(tab => (
                <NavigationMenuItem key={tab.label} className="relative">

                  <NavigationMenuLink
                    onClick={() => router.push(tab.href)}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-dmsans font-bold transition-colors hover:!bg-white/5",
                      selectedTab === tab.label ? "z-10 text-white" : ""
                    )}
                  >
                    <span className="relative z-10 
    ">{tab.label}</span>
                    {selectedTab === tab.label && (
                      <motion.span
                        layoutId="pill-tab"
                        transition={{ type: "spring", duration: 0.5 }}
                        className="absolute isolation-isolate inset-0 z-0 rounded-full
                bg-[#B372FF]"
                      > <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <div className="liquidGlass-tint"></div>
                          <div className="liquidGlass-shine  relative w-[105.8%] h-[102%] !top-[-0.2px] !left-[-2.3px]"></div></div></motion.span>
                    )}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Floating Auth Icon */}
        <div className="pointer-events-auto">
          <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
            <div className={cn(
              "p-3 rounded-full flex items-center justify-center text-white relative z-10 transition-colors hover:!bg-white/5",
              isAuthPage ? "bg-[#B372FF]" : "overflow-hidden isolation-isolate liquid-glass !shadow-none"
            )}>
              {!isAuthPage && (
                <>
                  <div className="liquidGlass-effect"></div>
                  <div className="liquidGlass-shine"></div>
                  <div className="liquidGlass-text"></div>
                </>
              )}
              {isAuthPage && (
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div className="liquidGlass-tint"></div>
                  <div className="liquidGlass-shine relative w-[105.8%] h-[102%] !top-[-0.2px] !left-[-2.3px]"></div>
                </div>
              )}
              <div className="relative z-10">
                {isAuthenticated ? <User size={20} /> : <UserPlus size={20} />}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile NavMenu */}
      <div className="sm:hidden fixed top-5 left-5 z-20 ">
        <Menu
          className="text-foreground p-1 backdrop-blur-xs border-accent-forground border rounded-sm"
          size={28}
          onClick={() => setMobileMenuOpen(true)}
        />

        {isMobileMenuOpen && (<>
          <div
            className="fixed inset-0 bg-background/42 z-20 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        </>)}

        <div
          className={`fixed inset-y-0 w-[50%] rounded-2xl left-0 bg-background z-30 flex flex-col items-start p-6 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <button
            className="self-end text-foreground text-2xl mb-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            &times;
          </button>
          <div className="flex flex-row items-center justify-start leading-1 gap-2 w-full pb-5">
            <div>
              <Image
                src="/ribbon_phone.png"
                alt=""
                width={27.28}
                height={34.86}
                quality={100}
                className="object-cover h-full"
              />
            </div>
            <div className="text-foreground font-dmsans text-lg">Carcino <br /> Foundation</div>
          </div>
          <div className="bg-accent px-5 w-full h-[1px] mb-5"></div>
          <nav className="flex flex-col gap-10 w-full h-full font-dmsans text-xl">
            <Link onClick={() => setMobileMenuOpen(false)} href="/" className={pathname === "/" ? "text-primary font-bold" : ""}>
              <div className="flex flex-row items-center gap-2">
                <House size={24} />
                Home
              </div>
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/leadership" className={pathname.startsWith("/leadership") ? "text-primary font-bold" : ""}>
              <div className="flex flex-row items-center gap-2">
                <SearchX size={24} />
                About
              </div>
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/article" className={pathname.startsWith("/article") ? "text-primary font-bold" : ""}>
              <div className="flex flex-row items-center gap-2">
                <BookOpen size={24} />
                Articles
              </div>
            </Link>
            <div className="mt-auto">
              <Link onClick={() => setMobileMenuOpen(false)} href={isAuthenticated ? "/dashboard" : "/sign-up"} className={pathname.startsWith("/sign") || pathname.startsWith("/dashboard") ? "text-primary font-bold" : ""}>
                <div className="flex flex-row items-center gap-2">
                  {isAuthenticated ? <User size={24} /> : <UserPlus size={24} />}
                  {isAuthenticated ? "Dashboard" : "Sign Up"}
                </div>
              </Link>
            </div>
          </nav>
          {/* <ModeTogglePhone></ModeTogglePhone> */}
        </div>
      </div>

    </div>
  )
}



