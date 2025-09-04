import Image from "next/image";
import LandingContainer from "../common/LandingContainer";
import { GlowButton } from "../common/CustomButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createMarkup } from "@/lib/functions";
const HeroSection = ({ data }) => {
  const caption = data?.caption?.replace(/<\/?p>/g, "");
  const words = caption?.split(" ");
  const firstPart = words?.slice(0, -1).join(" ");
  const lastPart = words && words[words?.length - 1];
  const [isMobile, setIsMobile] = useState(false);
console.log(data?.caption)
  useEffect(() => {
    const mobileWidth = window.innerWidth < 640;
    setIsMobile(mobileWidth);
  }, []);
  return (
    <LandingContainer className=" relative w-full !h-screen flex items-center md:px-[7rem] 2xl:px-[10rem] mt-2">
      {/* Text Content */}
      <div className="mt-[10rem] sm:mt-0 relative z-10 max-w-[800px] flex flex-col items-start text-left gap-2 md:gap-4">
        <h1 className="text-[37px] md:text-5xl 2xl:text-6xl leading-tight">
          <span className="block text-[2.5rem]"dangerouslySetInnerHTML={createMarkup(firstPart)}></span>
          <span className="block text-[4.5rem] font-semibold"dangerouslySetInnerHTML={createMarkup(lastPart)}></span>
        </h1>

        <p className="text-base md:text-lg 2xl:text-xl md:w-[70%] 2xl:w-[75%] text-gray-300">
         {data?.description}
        </p>

        <GlowButton className="text-lg 2xl:text-2xl mt-4 px-14 2xl:px-16 py-7 2xl:py-8 w-40">
          <Link href={"/login"}>Enroll Now</Link>
        </GlowButton>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 -z-10  ">
        {isMobile ? (
          <Image
            src="/Hero section image - Mobile res.png"
            fill
            alt="Hero Background"
            style={{ objectFit: "cover", filter: "brightness(0.7)" }}
          />
        ) : (
          <Image
            src="/hero-image.png"
           fill
            alt="Hero Background"
            className="xl:min-h-[790px] xl:min-w-[1420px]"
            style={{  filter: "brightness(0.7)" }}
          />
        )}
      </div>
    </LandingContainer>
  );
};

export default HeroSection;
