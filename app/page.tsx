/* eslint react/no-unescaped-entities: "off" */
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
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Award, CalendarCheck, PaintBucket, UserCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/ui/mode"


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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
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

const research: { title: string; href: string; description: string }[] = [
  {
    title: "Example Research 1",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime, debitis. Unde, earum. Esse ipsam totam nesciunt reiciendis illum minus dolorum voluptatum, ad eos suscipit perferendis ullam consequuntur harum magnam eligendi?",
  },
  {
    title: "Example Research 2",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates doloremque quos voluptate deleniti optio! Voluptas distinctio, doloremque impedit, corporis ipsa architecto id dolore velit odio aperiam quisquam, sit nemo dicta.",
  },
  {
    title: "Example Research 3",
    href: "#",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi, eligendi cum quae iure ab harum officiis odit laborum? Animi, error incidunt. Aliquid pariatur impedit quasi, ea quidem quisquam repudiandae exercitationem!",
  },
  {
    title: "Example Research 4",
    href: "#",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col items-start">

      {/* Navbar */}
      <div className="flex flex-row px-auto py-4 fixed w-full justify-between px-14 top-0 z-10 bg-background bg-opacity-30 backdrop-blur-md">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="#" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Research</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  {research.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
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
              <Link href="#" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Blog
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle></ModeToggle>
      </div>

      {/* Main Content */}
      <div className="flex flex-row items-center justify-between w-full h-screen px-14">

        <div className="flex flex-col items-start justify-center w-full h-full max-w-[50%] gap-6">
          <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground">Let’s change the world together!</Label>
          <h1 className="text-8xl font-cinzel text-foreground ">
            Educating The<br />Masses<br />on Cancer
          </h1>
          <p className="text-lg text-muted-foreground font-space_grotesk">
            A simple hub, built to educate and help emerging and concurrent
            generations upon one of the leading causes of death in humanity.
          </p>
          <Button className="text-foreground py-5 font-giest font-medium">Read Our Documents <ArrowUpRight /> </Button>
        </div>
        <div>
          <Image
            src="/ribbon.svg"
            alt="Cancer"
            width={482}
            height={492}
            quality={100}
            className="object-cover w-full h-full hidden dark:inline"
          />
          <Image
            src="/ribbon_light.svg"
            alt="Cancer"
            width={482}
            height={492}
            quality={100}
            className="object-cover w-full h-full dark:hidden inline"
          />
        </div>

      </div>

      {/* Featured */}
      <div className="flex flex-col gap-6 items-start justify-start w-full h-fit px-14 py-6">
        <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground">Why Trust Us</Label>
        <h1 className="text-2xl font-giest text-foreground ">
          We want everyone to be aware
        </h1>
        <p className="text-lg text-muted-foreground font-space_grotesk">
          We need the world to realise the threat, and for that we have a plan...
        </p>
        <div className="flex flex-row items-center justify-between w-full h-fit">
          <div className="grid grid-flow-col grid-rows-2 gap-3 max-w-[50%] h-fit">
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-col items-start gap-2">
                <Award />
                <p className="text-2xl font-giest">Verified Research</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground text-lg">Working with plenty of pioneers in the field of medicine has helped us bring out the truth behind cancer.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-col items-start gap-2">
                <CalendarCheck />
                <p className="text-2xl font-giest">Up-to-Date Articles</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground text-lg">
                  From start to finish, all our writers prioritize accuracy, ensuring up to date facts and studies.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-col items-start gap-2">
                <PaintBucket />
                <p className="text-2xl font-giest">Made for Everyone</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground text-lg">
                  We try to keep things simple, to break the language barrier and improve communication.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-col items-start gap-2">
                <UserCheck />
                <p className="text-2xl font-giest">Run By Students</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground text-lg">
                  We believe that our generation can beat cancer. And we try our best to educate our peers.
                </p>
              </CardContent>
            </Card>

          </div>
          <div className="flex flex-col items-center gap-5 max-w-[50%] w-full h-full justify-center">
            <h2 className="font-giest text-lg font-semibold">“I'm just a girl, I just love how shiny it is”</h2>
            <p className="font-giest text-center">Rajannya Das <br /> Founder & Managing Director</p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="flex flex-col items-start bg-accent justify-start w-full h-fit px-14 py-6">
        FOOTER PORE KORCHHI STFU
        <div className="flex flex-row"></div>
          
      </div>

    </div>
  );
}
