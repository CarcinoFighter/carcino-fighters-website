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
import React from "react";
import { cn } from "@/lib/utils"
import { BookOpen, House, Menu, SearchX } from "lucide-react"
import { ModeTogglePhone } from "@/components/ui/mode-phone"
import { usePathname } from "next/navigation"

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
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const pathname = usePathname();
  return (
    <div className="">
      {/* Navbar */}
      <div className="flex-row px-auto py-4 fixed w-full justify-center lg:px-14 md:px-10 px-6 top-0 z-30 hidden items-center sm:flex">
        <NavigationMenu className="w-full flex flex-row px-10 py-1 backdrop-blur-md items-center justify-between border bg/background/30 rounded-full">
          <NavigationMenuList className="gap-[50px]">
            <NavigationMenuItem>
              <Image src={"/logo.png"} alt={"logo"} width={30} height={30} className="rounded-full object-cover" />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle() + (pathname === "/" ? " border-accent bg-primary/25" : "")}
                href="/"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle() + (pathname.startsWith("/leadership") ? " border-accent bg-primary/25" : "")}
                href="/leadership"
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle() + (pathname.startsWith("/article") ? " border-accent bg-primary/25" : "")}
                href="/article"
              >
                Articles
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile NavMenu */}
      <div className="sm:hidden fixed top-5 left-5 z-20 ">
        <Menu
          className="text-foreground cursor-pointer p-1 backdrop-blur-xs border-accent-forground border rounded-sm"
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
            <div className="text-foreground font-cinzel text-lg">Carcino <br /> Foundation</div>
          </div>
          <div className="bg-accent px-5 w-full h-[1px] mb-5"></div>
          <nav className="flex flex-col gap-10 w-full h-full font-giest text-xl">
            <Link href="/" className={pathname === "/" ? "text-primary font-bold" : ""}>
              <div className="flex flex-row items-center gap-2">
                <House size={24} />
                Home
              </div>
            </Link>
            <Link href="/leadership" className={pathname.startsWith("/leadership") ? "text-primary font-bold" : ""}>
              <div className="flex flex-row items-center gap-2">
                <SearchX size={24} />
                About
              </div>
            </Link>
            <Link href="/article" className={pathname.startsWith("/article") ? "text-primary font-bold" : ""}>
              <div className="flex flex-row items-center gap-2">
                <BookOpen size={24} />
                Articles
              </div>
            </Link>
          </nav>
          <ModeTogglePhone></ModeTogglePhone>
        </div>
      </div>

    </div>
  )
}
