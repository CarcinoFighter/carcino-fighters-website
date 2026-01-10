"use client";
import Image from "next/image";

export function Footer() {
  return (
    <div className="justify-start w-full h-fit lg:px-14 z-10 md:px-10 px-6 pt-4 pb-12 ">
      <div className="flex flex-col sm:flex-row text-center sm:text-left justify-between items-center">
        <h1 className="w-full flex sm:w-[50%] leading-[80%] font-tttravelsnext font-extrabold text-[#B185E5] text-3xl sm:text-4xl md:text-5xl lg:text-[6rem] max-sm:text-[#B185E5] max-sm:pb-1 max-sm:text-2xl opacity-40 tracking-[-6px]">
          <Image
            src="logo-footer.svg"
            alt="TCF"
            width={215}
            height={215}
            className="pr-5"
          />
          THE CARCINO FOUNDATION
        </h1>
        <div className="w-full sm:w-1/3 flex flex-col sm:items-end mt-6 sm:mt-80">
          <p className="font-tttravelsnext text-[#D5B0FF] text-base font-extrabold leading-6">
            CONTACT
          </p>
          <a
            href="mailto:inquiries@thecarcinofoundation.org"
            className="text-[#D5B0FF] font-dmsans text-base font-normal leading-6 hover:underline max-sm:text-sm"
          >
            inquiries@thecarcinofoundation.org
          </a>

          <a
            href="tel:+917605055424"
            className="text-[#D5B0FF] font-dmsans text-base font-normal leading-6 hover:underline max-sm:text-sm"
          >
            +91 76050 55424
          </a>
        </div>
      </div>
    </div>
  );
}
