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
import React, { useState, useEffect, useRef } from "react";
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
  Search,
  Loader2,
} from "lucide-react";
// import { ModeTogglePhone } from "@/components/ui/mode-phone"
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // 1. Try Admin
    fetch("/api/admin", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setIsAuthenticated(true);
        } else {
          // 2. Try Public
          fetch("/api/public-auth", { method: "GET" })
            .then((res) => res.json())
            .then((pData) => setIsAuthenticated(!!pData?.authenticated))
            .catch(() => setIsAuthenticated(false));
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, [pathname]); // Re-check on route change

  // Handle Search Input Change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close search results on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/leadership" },
    { label: "Articles", href: "/article" },
    { label: "Blogs", href: "/blogs" },
    { label: "Survivors", href: "/survivorstories" },
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
      {/* Navbar — three independent floating fragments */}
      <div className="flex-row py-4 fixed left-0 right-0 lg:px-14 md:px-10 px-6 top-0 z-30 hidden items-center sm:flex pointer-events-none gap-3 h-[74px]">

        {/* ── Fragment 1: Logo pill ── */}
        <div className="pointer-events-auto flex-shrink-0">
          <div
            className={cn(
              "p-2 rounded-full flex items-center justify-center relative z-10",
              "overflow-hidden isolation-isolate liquid-glass !shadow-none",
            )}
          >
            <div className="liquidGlass-effect"></div>
            <div className="liquidGlass-shine"></div>
            <div className="liquidGlass-text"></div>
            <div className="relative z-10 px-1">
              <Image
                src={"/logo-w.svg"}
                alt={"logo"}
                width={25}
                height={25}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* ── Fragment 2: Nav links pill ── */}
        <div className="pointer-events-auto flex-shrink-0">
          <NavigationMenu
            className={cn(
              "flex flex-row px-1 py-1 rounded-full items-center relative z-10",
              "overflow-hidden isolation-isolate liquid-glass !shadow-none",
            )}
          >
            <div className="liquidGlass-effect"></div>
            <div className="liquidGlass-shine"></div>
            <div className="liquidGlass-text"></div>

            <NavigationMenuList className="gap-1 relative">
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
                    <span className="relative z-10">{tab.label}</span>
                    {selectedTab === tab.label && (
                      <motion.span
                        layoutId="pill-tab"
                        transition={{ type: "spring", duration: 0.5 }}
                        className="absolute isolation-isolate inset-0 z-0 rounded-full bg-[#B372FF]"
                      >
                        {" "}
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <div className="liquidGlass-tint"></div>
                          <div className="liquidGlass-shine relative w-[105.8%] h-[102%] !top-[-0.2px] !left-[-2.3px]"></div>
                        </div>
                      </motion.span>
                    )}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Spacer pushes profile & search to the absolute right ── */}
        <div className="flex-1" />

        {/* ── Fragment 3: Search Box pill ── */}
        <div ref={searchRef} className="pointer-events-auto flex-shrink-0 relative z-40">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full relative z-10 transition-all duration-300 w-48 md:w-60 lg:w-[240px] h-[42px]",
              "overflow-hidden isolation-isolate liquid-glass !shadow-none"
            )}
          >
            <div className="liquidGlass-effect"></div>
            <div className="liquidGlass-shine"></div>
            <div className="liquidGlass-text"></div>

            <div className="relative z-10 flex items-center w-full gap-2 px-1">
              {isSearching ? (
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="bg-transparent border-none text-white text-xs md:text-sm placeholder:text-muted-foreground outline-hidden w-full h-6 font-dmsans"
              />
            </div>
          </div>

          {/* Search Dropdown Results */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ '--card-radius': '24px' } as React.CSSProperties}
                className="absolute right-0 mt-2 w-[320px] md:w-[400px] lg:w-[450px] max-h-[380px] overflow-y-auto rounded-44px shadow-2xl p-4 z-50 pointer-events-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 overflow-hidden"
              >
                {/* Frosted glass details to replicate exact card glass */}
                <div className="absolute inset-0 z-0 bg-white/[0.01]" />
                <div className="liquidGlass-effect"></div>
                <div className="cardGlass-borders" />
                <div className="cardGlass-shine" />

                <div className="relative z-10 flex flex-col gap-1.5">
                  {searchResults.length > 0 ? (
                    searchResults.map((item: any) => (
                      <button
                        key={item.id + item.type}
                        onClick={() => {
                          router.push(item.href);
                          setIsSearchFocused(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all flex flex-col gap-1 font-dmsans border border-transparent hover:border-white/5 relative z-10"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white text-sm font-semibold truncate pr-4">
                            {item.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold font-mono">
                            {item.type}
                          </span>
                        </div>
                        {item.snippet && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {item.snippet}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[120px]">By {item.author}</span>
                          <span>•</span>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 font-dmsans">
                      <SearchX size={28} className="text-muted-foreground/50" />
                      <span className="text-sm">No results found for "{searchQuery}"</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Fragment 4: Profile / Auth button ── */}
        <div className="pointer-events-auto flex-shrink-0">
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
          className={`fixed top-20 right-5 w-56 backdrop-blur-2xl z-30 rounded-2xl border border-white/10 shadow-xl transform transition-all duration-300 ${isMobileMenuOpen
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
              href="/blogs"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/blogs")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <Newspaper size={22} />
              Blogs
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/survivorstories"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-dmsans text-base",
                pathname.startsWith("/survivorstories")
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:bg-white/5",
              )}
            >
              <Award size={22} />
              Survivors
            </Link>
            <div className="h-px bg-white/20 my-2" />

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
