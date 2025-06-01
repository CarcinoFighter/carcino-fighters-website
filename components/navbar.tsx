"use client"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/ui/mode"
import Image from "next/image"
import Link from "next/link"
import React from "react";
import { cn } from "@/lib/utils"
import { BookOpen, House, Menu, MessageSquareText, Newspaper, SearchX } from "lucide-react"
import { ModeTogglePhone } from "@/components/ui/mode-phone"
import { getAllDocs } from "@/lib/docsRepository"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

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

const articles: { title: string; href: string; description: string }[] = [
  {
    title: "Example Article 1",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Example Article 2",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Example Article 3",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Example Article 4",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Example Article 5",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Example Article 6",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
]

const researches = await getAllDocs()


export function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const router = useRouter();
  return (
    <div>
      {/* Navbar */}
      <div className="flex-row px-auto py-4 fixed w-full justify-between lg:px-14 md:px-10 px-6 top-0 z-30 bg-background/30 hidden sm:flex backdrop-blur-md">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/leadership">
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Research</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  {researches.map((item) => (
                    <ListItem
                      key={item.slug}
                      title={item.slug
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                      }
                      href={`/research/${item.slug}`}
                    >
                      {/* {item.content.replace(/<[^>]+>/g, '').slice(0, 20) + "..."} */}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Articles</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  {articles.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Blog
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle></ModeToggle>
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
            <Link href="/" >
              <div className="flex flex-row items-center gap-2">
                <House size={24} />
                Home
              </div>
            </Link>
            <Link href="/leadership">
              <div className="flex flex-row items-center gap-2">
                <SearchX size={24} />
                About
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-left flex flex-row gap-2 items-center cursor-pointer">
                <BookOpen size={24} />
                Research
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {researches.map((item) => (
                  <DropdownMenuItem className="mx-3 my-1" key={item.slug} >
                    <Button onClick={() => {router.push(`/research/${item.slug}`)}} variant={`ghost`} className="w-full h-full cursor-pointer">
                      {item.slug
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#">
              <div className="flex flex-row items-center gap-2">
                <Newspaper size={24} />
                Articles
              </div>
            </Link>
            <Link href="#">
              <div className="flex flex-row items-center gap-2">
                <MessageSquareText size={24} />
                Blog
              </div>
            </Link>

          </nav>
          <ModeTogglePhone></ModeTogglePhone>
        </div>
      </div>

    </div>
  )
}
