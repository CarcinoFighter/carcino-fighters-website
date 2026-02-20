"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  House,
  Menu,
  Newspaper,
  SearchX,
  User,
  UserPlus,
} from "lucide-react";
// import { ModeTogglePhone } from "@/components/ui/mode-phone"
import { usePathname } from "next/navigation";
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
            className,
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
  );
});
ListItem.displayName = "ListItem";

export function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    fetch("/api/admin", { method: "GET" })
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(!!data?.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, [pathname]); // Re-check on route change

  const tabs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/leadership" },
    { label: "Articles", href: "/article" },
    { label: "Survivors", href: "/survivorstories" },
    { label: "Blogs", href: "/blogs" },
  ];
  const selectedTab = tabs.find((tab) =>
    tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href),
  )?.label;

  const isAuthPage =
    pathname.startsWith("/sign") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");

  return (
    <div className="">
      {/* Navbar */}
      <div className="flex-row py-4 fixed left-0 right-0 justify-center lg:px-14 md:px-10 px-6 top-0 z-30 hidden items-center sm:flex pointer-events-none gap-4">
        <div className="pointer-events-auto">
          <NavigationMenu
            className={cn(
              "w-full flex flex-row px-1 py-1 rounded-full items-center justify-between relative z-10",
              "overflow-hidden isolation-isolate liquid-glass !shadow-none",
            )}
          >
            <div className="liquidGlass-effect "></div>
            {/* <div className="liquidGlass-tint"></div> */}
            <div className="liquidGlass-shine"></div>
            <div className="liquidGlass-text"></div>

            <NavigationMenuList className="gap-[50px] relative">
              <NavigationMenuItem>
                <div className="pl-4">
                  <Image
                    src={"/logo-w.svg"}
                    alt={"logo"}
                    width={25}
                    height={25}
                    className=" object-cover"
                  />
                </div>
              </NavigationMenuItem>
              {/* Tab links with animated pill indicator */}
              {tabs.map((tab) => (
                <NavigationMenuItem key={tab.label} className="relative">
                  <NavigationMenuLink
                    onClick={() => router.push(tab.href)}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-dmsans font-medium transition-colors hover:!bg-white/5",
                      selectedTab === tab.label ? "z-10 text-white" : "",
                    )}
                  >
                    <span
                      className="relative z-10 
    "
                    >
                      {tab.label}
                    </span>
                    {selectedTab === tab.label && (
                      <motion.span
                        layoutId="pill-tab"
                        transition={{ type: "spring", duration: 0.5 }}
                        className="absolute isolation-isolate inset-0 z-0 rounded-full
                bg-[#B372FF]"
                      >
                        {" "}
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <div className="liquidGlass-tint"></div>
                          <div className="liquidGlass-shine  relative w-[105.8%] h-[102%] !top-[-0.2px] !left-[-2.3px]"></div>
                        </div>
                      </motion.span>
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
            <div
              className={cn(
                "p-3 rounded-full flex items-center justify-center text-white relative z-10 transition-colors hover:!bg-white/5",
                isAuthPage
                  ? "bg-[#B372FF]"
                  : "overflow-hidden isolation-isolate liquid-glass !shadow-none",
              )}
            >
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
      <div className="sm:hidden fixed top-0 left-0 right-0 z-20 pointer-events-none">
        {/* Gradient Blur Background */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none -z-10"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maskImage:
              "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.8) 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.8) 40%, transparent 100%)",
          }}
        />

        <div className="flex items-center justify-between px-5 py-5 m-2 pointer-events-auto">
          {/* Logo on the left */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo-footer.svg"
              alt="TCF"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-white font-tttravelsnext text-[11px] font-bold leading-tight tracking-tight">
              THE
              <br /> CARCINO
              <br />
              FOUNDATION
            </span>
          </div>

          {/* Hamburger on the right */}
          <Menu
            className="text-foreground p-1 backdrop-blur-xs border-accent-forground border rounded-sm"
            size={32}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        {/* Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/42 z-20 backdrop-blur-md pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Compact Menu Box */}
        <div
          className={`fixed top-20 right-5 w-56 backdrop-blur-2xl z-30 rounded-2xl border border-white/10 shadow-xl transform transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          {/* Menu content */}
          <nav className="flex flex-col p-4 gap-1 relative z-10">
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname === "/"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <House size={22} />
              Home
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/leadership"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/leadership")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <SearchX size={22} />
              About
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/article"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/article")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <BookOpen size={22} />
              Articles
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/survivorstories"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/article")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <Award size={22} />
              Survivors
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/blogs"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/article")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <Newspaper size={22} />
              Blogs
            </Link>

            <div className="h-px bg-border my-2" />

            <Link
              onClick={() => setMobileMenuOpen(false)}
              href={isAuthenticated ? "/dashboard" : "/sign-up"}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/sign") ||
                  pathname.startsWith("/dashboard")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              {isAuthenticated ? <User size={22} /> : <UserPlus size={22} />}
              {isAuthenticated ? "Dashboard" : "Sign Up"}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
