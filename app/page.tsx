/* eslint react/no-unescaped-entities: "off" */
"use client"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Award, CalendarCheck, PaintBucket, UserCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import "./globals.css";
import { Footer } from "@/components/footer"


export default function Home() {
  return (
    <div className="flex flex-col relative lg:block lg:h-screen w-screen overflow-y-scroll overflow-x-hidden items-start gap-20 bg-background lg:snap-y lg:scroll-pt-[68px] lg:snap-mandatory lg:snap-always">
      {/* Mobile Background */}
      <div className="h-[40vh] w-full overflow-hidden fixed left-0 right-0 mx-auto top-0 bg-linear-180 rounded-b-full blur-3xl bg-radial-[at_50%_-50%] from-[#F0F0F0] via-[#D5B0FF] to-[#F0F0F0] dark:from-[#2C2C2C] dark:via-[#471F77] dark:to-[#2C2C2C] lg:hidden animate-blob"
      ></div>


      {/* Main Content */}
      <div className="flex flex-row items-center gap-[12rem] justify-start w-full h-fit pt-[68px] lg:pt-0 lg:h-[100vh] lg:px-14 md:px-10 px-6 z-10 snap-center">
        <div className="flex flex-col text-center lg:my-auto lg:text-left items-center lg:items-start w-full h-fit lg:max-w-[50%] gap-6">
          <Image
            src="/ribbon_phone.png"
            alt=""
            width={117.56}
            height={150.23}
            quality={100}
            className="object-cover lg:hidden"
          />
          <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground hidden lg:inline">Let's change the world together!</Label>
          <h1 className="text-5xl lg:text-5xl xl:text-7xl font-cinzel text-foreground ">
            Educating The<br />Masses<br />on Cancer
          </h1>
          <p className="text-lg text-muted-foreground font-space_grotesk">
            A simple hub, built to educate and help emerging and concurrent
            generations upon one of the leading causes of death in humanity.
          </p>
          <Button className="text-white py-5 font-giest font-medium">Read Our Documents <ArrowUpRight /> </Button>
        </div>

        <div className="hidden lg:inline relative h-full w-full">
          <div className="h-[598px] w-[524px] animate-blob dark:from-0% dark:from-[#2C2C2C] dark:to-[#471F77] from-[#F0F0F0] from-[28%] to-[#D5B0FF] bg-linear-180 blur-[133px] rounded-full absolute top-0 bottom-0 my-auto right-0 left-0 mr-auto"></div>
          <Image
            src="/ribbon.png"
            alt="Cancer"
            width={385}
            height={492}
            quality={100}
            className="object-cover absolute top-0 bottom-0 my-auto right-0 left-17 mr-auto hidden dark:inline"
          />
          <Image
            src="/ribbon_light.png"
            alt="Cancer"
            width={385}
            height={492}
            quality={100}
            className="object-cover absolute top-0 bottom-0 my-auto right-0 left-17 mr-auto dark:hidden"
          />
        </div>

      </div>

      {/* Featured */}
      {/* Mobile Quotation (hidden in pc) */}
      <div className="flex flex-col items-center gap-5 w-full h-full justify-center lg:hidden py-16 z-10">
        <h2 className="font-giest text-lg text-center font-semibold">“I'm just a girl, I just love how shiny it is”</h2>
        <p className="font-giest text-center">Rajannya Das <br /> Founder & Managing Director</p>
      </div>
      
      {/* General Featured Section */}
      <div className="z-10 snap-center flex flex-col lg:gap-6 md:gap-4 gap-4 items-center lg:items-start text-center lg:text-left justify-center w-full lg:w-fit h-fit lg:h-svh max-h-[1200px] lg:px-14 md:px-10 px-6 pb-6">
        <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground">Why Trust Us</Label>
        <h1 className="text-2xl font-giest text-foreground ">
          We want everyone to be aware
        </h1>
        <p className="text-lg text-muted-foreground font-space_grotesk">
          We need the world to realise the threat, and for that we have a plan...
        </p>
        <div className="flex flex-row items-center justify-center w-full h-fit">
          <div className="grid lg:grid-flow-col lg:grid-rows-2 gap-7 pt-7 max-w-[400px] lg:max-w-[50%] h-fit">
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
      <div className="snap-start z-10 font-giest flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center lg:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6 py-7">
        <Label className="border p-3 rounded-sm font-space_grotesk text-base text-foreground">Research and Development</Label>
        <h1 className="text-2xl font-giest text-foreground ">
          Our Articles
        </h1>
        <p className="text-lg text-muted-foreground font-space_grotesk">
          Here's the latest collection of articles we offer, tailored to be understandable by everyone, made with love and care by our Writing Team.
        </p>
        <div className="grid lg:grid-flow-col lg:grid-rows-2 gap-3 py-6  w-full">
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
                    <div className="text-primary bg-primary/10 px-2 rounded border-primary border/20">Information</div>
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
                    <div className="text-primary bg-primary/10 px-2 rounded border-primary border/20">WHO Says</div>
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
                    <div className="text-primary bg-primary/10 px-2 rounded border-primary border/20">Data Study</div>
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
                    <div className="text-primary bg-primary/10 px-2 rounded border-primary border/20">Social Media</div>
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
      <div className="snap-center z-10 font-giest text-foreground flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center xl:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6 lg:py-18">
        <div className="w-full flex flex-row items-center justify-between bg-primary">
          <div className="text-whte flex flex-col items-center xl:items-start xl:max-w-[60%] justify-center gap-6 w-full h-fit lg:px-14 md:px-10 px-6 py-10 sm:py-14 md:py-18 lg:py-20">
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
      <Footer></Footer>

    </div>
  );
}
