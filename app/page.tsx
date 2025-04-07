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
import { ArrowUpRight, Award, BookOpen, CalendarCheck, House, Menu, MessageSquareText, Newspaper, PaintBucket, SearchX, UserCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/ui/mode"
import { Input } from "@/components/ui/input"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";


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
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  return (
    <div className="flex flex-col items-start gap-5">

      {/* Mobile NavMenu */}
      <div className="sm:hidden fixed top-5 left-5 z-20">
        <Menu
          className="text-foreground cursor-pointer p-1 backdrop-blur-sm border-accent-forground border rounded-sm"
          size={28}
          onClick={() => setMobileMenuOpen(true)}
        />

        {isMobileMenuOpen && (<>
          <div
            className="fixed inset-0 bg-black bg-opacity-[42%] z-20 backdrop-blur-md"
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

          <nav className="flex flex-col gap-10 w-full font-giest text-xl">
            <Link href="#" >
              <div className="flex flex-row items-center gap-2">
                <House size={24} />
                Home
              </div>
            </Link>
            <Link href="#">
              <div className="flex flex-row items-center gap-2">
                <SearchX size={24} />
                About
              </div>
            </Link>
            <Link href="#">
              <div className="flex flex-row items-center gap-2">
                <BookOpen size={24} />
                Research
              </div>
            </Link>
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
        </div>
      </div>

      {/* Navbar */}
      <div className="flex-row px-auto py-4 fixed w-full justify-between lg:px-14 md:px-10 px-6 top-0 z-10 bg-background bg-opacity-30 hidden sm:flex backdrop-blur-md">
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

      {/* Mobile Background */}
      <Image
        src="/mobile_ellipse.png"
        alt=""
        width={490}
        height={560}
        quality={100}
        className=" object-cover w-full h-full absolute -top-20 left-0 -z-10 lg:hidden"
        style={{
          maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="flex flex-row items-center justify-between w-full h-fit lg:px-14 md:px-10 px-6 pt-[68px]">
        <div className="flex flex-col text-center lg:text-left items-center lg:items-start w-full h-fit lg:max-w-[50%] gap-6">
          <Image
            src="/ribbon_phone.png"
            alt=""
            width={117.56}
            height={150.23}
            quality={100}
            className="object-cover lg:hidden"
          />
          <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground hidden lg:inline">Let's change the world together!</Label>
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-cinzel text-foreground ">
            Educating The<br />Masses<br />on Cancer
          </h1>
          <p className="text-lg text-muted-foreground font-space_grotesk">
            A simple hub, built to educate and help emerging and concurrent
            generations upon one of the leading causes of death in humanity.
          </p>
          <Button className="text-white py-5 font-giest font-medium">Read Our Documents <ArrowUpRight /> </Button>
        </div>

        <div className="hidden lg:inline">
          <Image
            src="/ribbon.png"
            alt="Cancer"
            width={482}
            height={492}
            quality={100}
            className="object-cover w-full h-full hidden dark:inline"
          />
          <Image
            src="/ribbon_light.png"
            alt="Cancer"
            width={482}
            height={492}
            quality={100}
            className="object-cover w-full h-full dark:hidden inline"
          />
        </div>

      </div>

      {/* Featured */}
      {/* Mobile Quotation (hidden in pc) */}
      <div className="flex flex-col items-center gap-5 w-full h-full justify-center lg:hidden py-16">
        <h2 className="font-giest text-lg text-center font-semibold">“I'm just a girl, I just love how shiny it is”</h2>
        <p className="font-giest text-center">Rajannya Das <br /> Founder & Managing Director</p>
      </div>
      {/* General Featured Section */}
      <div className="flex flex-col lg:gap-6 md:gap-4 gap-2 items-center lg:items-start text-center lg:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6">
        <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground">Why Trust Us</Label>
        <h1 className="text-2xl font-giest text-foreground ">
          We want everyone to be aware
        </h1>
        <p className="text-lg text-muted-foreground font-space_grotesk">
          We need the world to realise the threat, and for that we have a plan...
        </p>
        <div className="flex flex-row items-center justify-center w-full h-fit">
          <div className="grid lg:grid-flow-col lg:grid-rows-2 gap-3 lg:max-w-[50%] h-fit">
            <Card className="lg:border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                <Award />
                <p className="text-xl lg:text-2xl font-giest">Verified Research</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground text-sm lg:text-lg">Working with plenty of pioneers in the field of medicine has helped us bring out the truth behind cancer.</p>
              </CardContent>
            </Card>
            <Card className="lg:border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-col items-center lg:items-start gap-1">
                <CalendarCheck />
                <p className="text-xl lg:text-2xl font-giest">Up-to-Date Articles</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground lg:text-lg">
                  From start to finish, all our writers prioritize accuracy, ensuring up to date facts and studies.
                </p>
              </CardContent>
            </Card>
            <Card className="lg:border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                <PaintBucket />
                <p className="text-xl lg:text-2xl font-giest">Made for Everyone</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground lg:text-lg">
                  We try to keep things simple, to break the language barrier and improve communication.
                </p>
              </CardContent>
            </Card>
            <Card className="lg:border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                <UserCheck />
                <p className="text-xl lg:text-2xl font-giest">Run By Students</p>
              </CardHeader>
              <CardContent>
                <p className="font-giest text-muted-foreground lg:text-lg">
                  We believe that our generation can beat cancer. And we try our best to educate our peers.
                </p>
              </CardContent>
            </Card>

          </div>
          <div className="lg:flex flex-col items-center gap-5 max-w-[50%] w-full h-full justify-center hidden">
            <h2 className="font-giest text-lg font-semibold">“I'm just a girl, I just love how shiny it is”</h2>
            <p className="font-giest text-center">Rajannya Das <br /> Founder & Managing Director</p>
          </div>
        </div>

      </div>

      {/* Articles */}
      <div className="font-giest flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center lg:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6">
        <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground">Research and Development</Label>
        <h1 className="text-2xl font-giest text-foreground ">
          Our Articles
        </h1>
        <p className="text-lg text-muted-foreground font-space_grotesk">
          Here's the latest collection of articles we offer, tailored to be understandable by everyone, made with love and care by our Writing Team.
        </p>
        <div className="grid lg:grid-flow-col lg:grid-rows-2 gap-3 py-6 h-fit w-full">
          <CardContainer className="w-full">
            <CardBody className="relative group/card bg-background border-accent w-full h-auto rounded-xl p-6 border">
              <div className="flex flex-row justify-between h-full gap-4">
                <CardItem
                  translateZ="50"
                  className="w-[50%]"
                >
                  <Image
                    src="/dummy_image1.png"
                    height={300}
                    width={300}
                    className="object-cover rounded-xl "
                    alt="thumbnail"
                  />
                </CardItem>
                <CardItem
                  translateZ="20"
                  className="w-[50%]"
                >
                  <div className="flex flex-col items-start justify-between text-left h-full">
                    <div className="text-primary bg-primary bg-opacity-[10%] px-2 rounded border-primary border border-opacity-20">Information</div>
                    <h1 className="text-lg lg:text-2xl md:text-xl font-giest text-foreground">Breast Cancer - Wiki</h1>
                    <p className="md:text-lg font-giest text-muted-foreground">All you need to know about one of the deadly causes behind female mortality.</p>
                    <Link href={`#`}>
                      <p className="text-sm text-primary flex flex-row items-center gap-1">
                        View Article <ArrowUpRight size={14} />
                      </p>

                    </Link>
                  </div>

                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
          <CardContainer className="w-full">
            <CardBody className="relative group/card bg-background border-accent w-full h-auto rounded-xl p-6 border">
              <div className="flex flex-row justify-between h-full gap-4">
                <CardItem
                  translateZ="50"
                  className="w-[50%]"
                >
                  <Image
                    src="/dummy_image2.png"
                    height={300}
                    width={300}
                    className="object-cover rounded-xl "
                    alt="thumbnail"
                  />
                </CardItem>
                <CardItem
                  translateZ="20"
                  className="w-[50%]"
                >
                  <div className="flex flex-col items-start justify-between text-left h-full">
                    <div className="text-primary bg-primary bg-opacity-[10%] px-2 rounded border-primary border border-opacity-20">WHO Says</div>
                    <h1 className="text-lg lg:text-2xl md:text-xl font-giest text-foreground">Minutes from WHO's event.</h1>
                    <p className="md:text-lg font-giest text-muted-foreground">Here's a clean gist of all that was announced at the Summit.</p>
                    <Link href={`#`}>
                      <p className="text-sm text-primary flex flex-row items-center gap-1">
                        View Article <ArrowUpRight size={14} />
                      </p>

                    </Link>
                  </div>

                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
          <CardContainer className="w-full">
            <CardBody className="relative group/card bg-background border-accent w-full h-auto rounded-xl p-6 border">
              <div className="flex flex-row justify-between h-full gap-4">
                <CardItem
                  translateZ="50"
                  className="w-[50%]"
                >
                  <Image
                    src="/dummy_image1.png"
                    height={300}
                    width={300}
                    className="object-cover rounded-xl "
                    alt="thumbnail"
                  />
                </CardItem>
                <CardItem
                  translateZ="20"
                  className="w-[50%]"
                >
                  <div className="flex flex-col items-start justify-between text-left h-full">
                    <div className="text-primary bg-primary bg-opacity-[10%] px-2 rounded border-primary border border-opacity-20">Data Study</div>
                    <h1 className="text-lg lg:text-2xl md:text-xl font-giest text-foreground">Cancer deaths are rising, but differently.</h1>
                    <p className="md:text-lg font-giest text-muted-foreground">There's a scary trend in the graph of deaths, here's our take on it.</p>
                    <Link href={`#`}>
                      <p className="text-sm text-primary flex flex-row items-center gap-1">
                        View Article <ArrowUpRight size={14} />
                      </p>

                    </Link>
                  </div>

                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
          <CardContainer className="w-full">
            <CardBody className="relative group/card bg-background border-accent w-full h-auto rounded-xl p-6 border">
              <div className="flex flex-row justify-between h-full gap-4">
                <CardItem
                  translateZ="50"
                  className="w-[50%]"
                >
                  <Image
                    src="/dummy_image1.png"
                    height={300}
                    width={300}
                    className="object-cover rounded-xl "
                    alt="thumbnail"
                  />
                </CardItem>
                <CardItem
                  translateZ="20"
                  className="w-[50%]"
                >
                  <div className="flex flex-col items-start justify-between text-left h-full">
                    <div className="text-primary bg-primary bg-opacity-[10%] px-2 rounded border-primary border border-opacity-20">Social Media</div>
                    <h1 className="text-lg lg:text-2xl md:text-xl font-giest text-foreground">Blueprint of Collapse?</h1>
                    <p className="md:text-lg font-giest text-muted-foreground">Bryan Johnson has been making waves on the media with his ‘immortal’ life. Is it a filthy scam?</p>
                    <Link href={`#`}>
                      <p className="text-sm text-primary flex flex-row items-center gap-1">
                        View Article <ArrowUpRight size={14} />
                      </p>

                    </Link>
                  </div>

                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </div>
        <Button variant={`ghost`}>Read More Insights <ArrowUpRight /></Button>
      </div>


      {/* Call to action  */}
      <div className="font-giest text-foreground flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center xl:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6">
        <div className="w-full flex flex-row items-center justify-between bg-primary">
          <div className="flex flex-col items-center xl:items-start xl:max-w-[60%] justify-center gap-6 w-full h-fit lg:px-14 md:px-10 px-6 py-10 sm:py-14 md:py-18 lg:py-20">
            <h1 className="text-4xl">
              Lets change the world
              together!
            </h1>
            <p className="text-lg">
              Do you wish to contribute to the cause? Write to us or send us articles, and our Writing Team will work on it and share it with the world.
            </p>
            <Button variant={`outline`} className="text-white py-5 font-giest font-medium border-muted-foreground">Start your project <ArrowUpRight /></Button>
          </div>
          <div className="hidden xl:inline">
            <Image
              src={`/Shape.png`}
              height={590}
              width={559.63}
              alt=""
              className="object-cover h-full"
            />
          </div>

        </div>

      </div>


      {/* Footer */}
      <div className="flex flex-col items-start bg-accent justify-start w-full h-fit lg:px-14 md:px-10 px-6 py-10 sm:py-14 md:py-18 lg:py-20">
        <div className="flex flex-row w-full h-fit justify-around lg:px-14 md:px-10 px-6 pb-8  gap-10">
          <div className="flex flex-col items-start gap-4 lg:max-w-[40%]">
            <p className="text-lg font-giest text-foreground">Get notified when we publish.</p>
            <div className="flex flex-row gap-2 w-full">
              <Input type="email" placeholder="Email" className="py-5" />
              <Button className="py-5">Submit</Button>
            </div>
            <p className="text-foreground font-giest">We respect <u>your privacy</u> and promise not to spam. Unsubscribe anytime.</p>
          </div>
          <div className="lg:flex hidden flex-col items-start gap-6 text-lg font-giest text-foreground lg:max-w-[20%]">
            <h1 className="font-bold">Contact</h1>
            <div>
              <div className="flex flex-col gap-4">
                <Link href="#">hello@alfarex.me</Link>
                <Link href="#">+91 760 505 5424</Link>
                <p>The Carcino Foundation Signature Towers III - Tower A, Sector 15 Part 2, Village Silokhera, Gurugram, Haryana 122002</p>
              </div>
            </div>
          </div>
          <div className="lg:flex hidden flex-col items-start gap-6 text-lg font-giest text-foreground lg:max-w-[20%]">
            <h1 className="font-bold">Pages</h1>
            <div className="flex flex-col gap-4">
              <Link href="#">Home</Link>
              <Link href="#">About</Link>
              <Link href="#">Research</Link>
              <Link href="#">Articles</Link>
              <Link href="#">Blog</Link>
            </div>
          </div>
          <div className="lg:flex hidden flex-col items-start gap-6 text-lg font-giest text-foreground lg:max-w-[20%]">
            <h1 className="font-bold">Social</h1>
            <div className="flex flex-col gap-4">
              <Link href="#">X</Link>
              <Link href="#">LinkedIn</Link>
              <Link href="#">Instagram</Link>
              <Link href="#">Youtube</Link>
              <Link href="#">Facebook</Link>
            </div>
          </div>
        </div>

        <div className="flex lg:hidden flex-row items-start w-full h-fit justify-center text-sm font-giest text-foreground lg:px-14 md:px-10 px-6 sm:py-14 md:py-18 lg:py-20 gap-10">
          <div className="flex flex-col items-start gap-3">
            <h1 className="font-bold">Contact</h1>
            <div className="flex flex-col gap-1">
              <Link href="#">hello@alfarex.me</Link>
              <Link href="#">+91 760 505 5424</Link>
              <p>The Carcino Foundation Signature Towers III - Tower A, Sector 15 Part 2, Village Silokhera, Gurugram, Haryana 122002</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <h1 className="font-bold">Pages</h1>
            <div className="flex flex-col gap-1">
              <Link href="#">Home</Link>
              <Link href="#">About</Link>
              <Link href="#">Research</Link>
              <Link href="#">Articles</Link>
              <Link href="#">Blog</Link>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <h1 className="font-bold">Social</h1>
            <div className="flex flex-col gap-1">
              <Link href="#">X</Link>
              <Link href="#">LinkedIn</Link>
              <Link href="#">Instagram</Link>
              <Link href="#">Youtube</Link>
              <Link href="#">Facebook</Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
