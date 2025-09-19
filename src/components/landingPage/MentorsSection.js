import React, { useEffect, useState, useRef } from "react";
import LandingContainer from "../common/LandingContainer";
import Image from "next/image";
import { FacebookBig, InstagramBig, LinkedinBig, Vinod } from "@/lib/svg_icons";
import BillboardWrapper from "../common/Billboard";
import { createMarkup } from "@/lib/functions";
const icons = [LinkedinBig, InstagramBig, FacebookBig];

const images = [
  "/Frame-1 1.png",
  "/Frame-2 2.png",
  "/Frame-3 1.png",
  "/Frame-1 1.png",
  "/Frame-2 2.png",
  "/Frame-3 1.png",
  "/Frame-1 1.png",
  "/Frame-2 2.png",
  "/Frame-3 1.png",
  "/Frame-1 1.png",
  "/Frame-2 2.png",
  "/Frame-3 1.png",
];

const AnimatedCount = ({ value, isInView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Reset count to 0 when element goes out of view
    if (!isInView) {
      setCount(0);
      return;
    }
    let current = 0;
    const end = parseInt(value);
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      current += increment;
      if (current > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return count.toLocaleString();
};

const MentorsSection = ({ mentor }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <LandingContainer className="pt-12 sm:pt-[7.5rem] !flex-col !h-fit  ">
      <div className=" h-full grid grid-cols-1 lg:grid-cols-2 gap-7 2xl:gap-8 mt-40">
   <div className="relative h-[24rem] md:h-[26rem] lg:h-[35rem] rounded-xl vinod-card overflow-hidden  ">
  {/* <div className="relative h-[32rem] md:h-[40rem] lg:h-full rounded-xl vinod-card overflow-hidden">
  <div className="w-full flex justify-center mt-10">
    <Vinod />
  </div>

 <div
  className="
    absolute
    bottom-0
    left-1/2
    -translate-x-1/2
    w-[100vw]
    h-[28rem]

    sm:w-[160vw] sm:h-[31rem]
    md:w-[160vw] md:h-[41rem]
    lg:w-[62rem] lg:h-full lg:left-[-27rem] lg:translate-x-0
    xl:w-[60rem] xl:h-[36rem] xl:left-[-23rem] xl:translate-x-0
    2xl:!w-[60rem] 2xl:!h-[34rem] 2xl:!-left-[21rem] 2xl:translate-x-0
  "
>
  <Image
    src="/vinod.png"
    fill
    alt="Vinod"
    className="object-contain"
  />
</div>

</div> */}
  <Image
    src="/Cardweb_740.png"
    fill
    alt="Vinod"
    
  />
</div>

        <div className="flex flex-col gap-5 self-center py-3">
          <div className="flex flex-col gap-3">
            <h1 className="text-[34px] md:text-5xl 2xl:text-6xl font-bold">
              Meet Our Mentor!
            </h1>
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-lg md:text-[1.75rem] mb-3 2xl:text-[2.5rem] font-bold text-[var(--yellow)]">
               {mentor?.name}
                </div>
               <div className="text-xs 2xl:text-sm text-[var(--light-gray)]" >
               {mentor?.designation}
                </div>
              </div>
              <div className="text-sm md:text-base 2xl:text-lg"  dangerouslySetInnerHTML={createMarkup(mentor.about)}>
              </div>
            </div>
          </div>

          <div ref={ref} className="flex gap-5 2xl:gap-6">
            {mentor.networks.map((link, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={link._id}
                  className={`
                    ${ link.platform == "Instagram" && "gradient-instagram" } 
                    ${link.platform == "Facebook" && "gradient-facebook"} 
                    ${link.platform == "LinkedIn" && "bg-[#0073B1]"} 
                    
    hover:bg-[var(--card)] px-[0.9rem] py-[0.6rem] 2xl:px-[1rem] 2xl:py-[0.7rem] w-[9.35rem] h-[6.85rem] 2xl:w-[12rem] 2xl:h-[8rem] flex flex-col justify-end rounded-md relative`}
                >
                  <Icon className=" absolute top-0 right-0 rounded-tr-md 2xl:w-[6rem] 2xl:h-[6rem] " />
                  <div className="text-xs 2xl:text-sm text-[var(--light-gray)] z-10">
                    {link.platform}
                  </div>
                  <div className="text-lg 2xl:text-xl font-bold">
                    <AnimatedCount value={link.followers} isInView={isInView} />
                    K
                  </div>
                </div>
              );
            })}
          </div>

          {/* <div className="text-lg font-bold">Featured in</div>

          <div className="flex bg-[var(--card)] p-5 gap-3 overflow-hidden rounded-[6px] relative featured">
            <BillboardWrapper>
              <div className="flex gap-4 h-14">
                {images.map((image, i) => (
                  <Image
                    key={i}
                    src={image}
                    width={300}
                    height={300}
                    alt={`image-${i}`}
                    className="rounded-lg w-auto h-auto"
                  />
                ))}
              </div>
            </BillboardWrapper>
          </div> */}
        </div>
      </div>
    </LandingContainer>
  );
};

export default MentorsSection;
