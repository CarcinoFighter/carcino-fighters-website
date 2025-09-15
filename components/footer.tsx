"use client"

export function Footer() {
    return (
        <div className="justify-start w-full h-fit lg:px-14 z-10 md:px-10 px-6 pb-10  snap-end">
            <div className="flex flex-col sm:flex-row text-center sm:text-left justify-between items-center pt-10">
                <h1 className="w-full sm:w-2/3 font-panchang font-[700] bg-gradient-to-b from-[rgba(152,117,193,0.56)] to-[rgba(51,51,51,0.56)] bg-clip-text  text-transparent text-3xl sm:text-4xl md:text-5xl lg:text-[6rem]">
                    The Carcino Foundation
                </h1>
                <div className="w-full sm:w-1/3 flex flex-col sm:items-end mt-6 sm:mt-0">
                    <p className="font-panchang text-[#9875C1] text-base font-medium leading-6">Contact</p>
                    <a href="mailto:inquiries@thecarcinofoundation.org" className="text-[#9875C1] font-geist text-base font-normal leading-6 hover:underline">
                        inquiries@thecarcinofoundation.org
                    </a>
                </div>
            </div>

        </div>
    )
}