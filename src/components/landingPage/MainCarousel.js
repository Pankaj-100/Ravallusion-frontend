"use client";
import React from "react";
import LandingContainer from "../common/LandingContainer";
import CustomCarousel from "../common/CustomCarousel";
import { CarouselItem } from "../ui/carousel";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useEffect, useState } from "react";
import EmblaCarousel from "../ui/EmblaCarousel";
import VideoPlayer from "../dashboard/VideoPlayer";


const OPTIONS = { loop: true };

const CarouselCard = ({ item,registerVideoRef }) => {

  return (
    <div className="flex items-center justify-center  ">
      <div className=" relative ">
        <div className="p-[0.4rem] carousel-bg !rounded-md h-56 sm:h-96 mx-2">
          <VideoPlayer
            source={item.video.videoUrl} poster={item.video.thumbnailUrl} registerVideoRef={registerVideoRef} />
        </div>
      </div>
    </div>
  );
};

const MainCarousel = ({ data }) => {
  const [screenWidth, setScreenWidth] = useState();

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <LandingContainer className="!px-0 flex items-center justify-center !h-fit py-12 sm:py-56 mt-1">
        {screenWidth < 1025 ? (
          <CustomCarousel>
            {data.map((item, index) => (
              <CarouselItem key={index} className="basis-[70%]">
                <CarouselCard item={item} />
              </CarouselItem>
            ))}
          </CustomCarousel>
        ) : (
          <>
            <div className="hidden md:flex carousel-left absolute h-full w-[100px] 2xl:w-[200px] z-[100] left-0 " />
            <EmblaCarousel options={OPTIONS} slides={data} />
            <div className="hidden md:flex carousel-right absolute h-full w-[100px] 2xl:w-[200px] z-[100] right-0" />
          </>
        )}
      </LandingContainer>
    </>
  );
};

export default MainCarousel;
