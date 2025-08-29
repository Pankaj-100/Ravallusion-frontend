"use client";
import React from "react";
// import fireEffectimg from "../../../public/fire-effect.jpeg";
// import prismatic from "../../../public/prismatic.png";
import Image from "next/image";
import { useGetCarouselImgQuery } from "@/store/Api/primaryDashboard";
import { motion } from "framer-motion";
import CarouselWrapper from "../common/CarouselWrapper";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSidebarTabIndex } from "@/store/slice/general";

// Simple skeleton component
const SkeletonBox = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-700/60 ${className}`} />
);

const PrimaryDashboard = () => {
  const { data, isLoading } = useGetCarouselImgQuery();
  const router = useRouter();
  const dispatch = useDispatch();

  // Extract carousel and side images from backend data
  const carousals = data?.data?.carousals || [];
  const sideImages = data?.data?.sideImages || {};

  const carouselItems = carousals.length
    ? carousals.map((item) => ({
        img: item?.video?.thumbnailUrl,
        videoId: item?.video?._id,
      }))
    : [];

  const handleClick = (videoId) => {
    dispatch(setSidebarTabIndex(1));
    if (videoId) {
      router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
    }
  };

  // Only show images if loaded from API
  const leftImage = sideImages?.dashboardLeftImage;
  const rightImage = sideImages?.dashboardRightImage;

  // Show skeletons while loading or missing data
  if (isLoading || !leftImage || !rightImage || carouselItems.length === 0) {
    return (
      <div className="w-full flex flex-row items-center justify-center h-[500px] md:h-[400px] bg-gradient-to-r from-[#181c2a] via-[#23263a] to-[#181c2a] rounded-2xl shadow-xl">
        {/* Left Skeleton */}
        <SkeletonBox className="w-[30%] h-[100%] rounded-l-2xl" />
        {/* Center Skeleton */}
        <SkeletonBox className="w-[40%] h-[100%] mx-2 rounded-xl" />
        {/* Right Skeleton */}
        <SkeletonBox className="w-[30%] h-[100%] rounded-r-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row items-center justify-center h-[500px] md:h-[400px] bg-gradient-to-r from-[#181c2a] via-[#23263a] to-[#181c2a] rounded-2xl shadow-xl">
      {/* Left Side Image */}
      <div className="w-[30%] h-full relative rounded-l-2xl overflow-hidden transition-all duration-500">
        <Image
          src={leftImage}
          alt="Dashboard Left"
          fill
          style={{ objectFit: "cover" }}
          className="rounded-l-2xl scale-105 hover:scale-110 transition-transform duration-700"
          priority
        />
      </div>

      {/* Center Carousel */}
      <div className="w-[40%] h-full flex flex-col items-center justify-center">
        <div className="w-full h-full bg-black/80 rounded-none flex items-center justify-center relative overflow-hidden shadow-2xl">
          <CarouselWrapper navigation={false} showDots={true}>
            {carouselItems.map((item, idx) => (
              <motion.div
                key={item.videoId || idx}
                whileHover={{ scale: 0.99 }}
                className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={() => handleClick(item.videoId)}
              >
                <Image
                  src={item.img}
                  alt="Carousel Video"
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-700"
                  priority
                />
              </motion.div>
            ))}
          </CarouselWrapper>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="w-[30%] h-full relative rounded-r-2xl overflow-hidden transition-all duration-500">
        <Image
          src={rightImage}
          alt="Dashboard Right"
          fill
          style={{ objectFit: "cover" }}
          className="rounded-r-2xl scale-105 hover:scale-110 transition-transform duration-700"
          priority
        />
      </div>
    </div>
  );
};

export default PrimaryDashboard;