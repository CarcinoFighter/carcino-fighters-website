"use client"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
    return (
        <div className="flex flex-col items-start bg-accent justify-start w-full h-fit lg:px-14 md:px-10 px-6 py-10 sm:py-14 md:py-18 lg:py-20 snap-end">
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
    )
}