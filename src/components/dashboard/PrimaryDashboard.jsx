"use client";
import React from "react";
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

  const carousals = data?.data?.carousals || [];
  const sideImages = data?.data?.sideImages || {};

  const carouselItems = carousals.length
    ? carousals.map((item) => ({
        img: item?.video?.thumbnailUrl,
        videoId: item?.video?._id,
        level: item?.video?.level,
      }))
    : [];

  const handleClick = (videoId, level) => {
    if (level == 1) {
      dispatch(setSidebarTabIndex(0));
      router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
    } else if (level == 2) {
      dispatch(setSidebarTabIndex(0));
      router.push(`/dashboard/player-dashboard/advance?videoId=${videoId}`);
    } else {
      dispatch(setSidebarTabIndex(1));
      router.push(`/dashboard/player-dashboard/learn-properly?videoId=${videoId}`);
    }
  };

  const leftImage = sideImages?.dashboardLeftImage;
  const rightImage = sideImages?.dashboardRightImage;

  if (isLoading || !leftImage || !rightImage || carouselItems.length === 0) {
    return (
      <div className="w-full flex flex-col md:flex-row items-center justify-center h-[500px] md:h-[400px] bg-gradient-to-r from-[#181c2a] via-[#23263a] to-[#181c2a] rounded-2xl shadow-xl gap-2 p-2">
        <SkeletonBox className="w-full md:w-[25%] h-[150px] md:h-full rounded-2xl" />
        <SkeletonBox className="w-full md:w-[50%] h-[200px] md:h-full rounded-2xl" />
        <SkeletonBox className="w-full md:w-[25%] h-[150px] md:h-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center h-auto md:h-[400px] bg-gradient-to-r from-[#181c2a] via-[#23263a] to-[#181c2a] rounded-2xl shadow-xl gap-2 p-2">
      {/* Left Side Image */}
      <div className="w-full md:w-[30%] h-[200px] md:h-full relative rounded-2xl overflow-hidden">
        <Image
          src={leftImage}
          alt="Dashboard Left"
          fill
          style={{ objectFit: "cover" }}
          className="rounded-2xl scale-105 hover:scale-110 transition-transform duration-700"
          priority
        />
      </div>

      {/* Center Carousel */}
      <div className="w-full md:w-[40%] h-[250px] md:h-full flex items-center justify-center">
        <div className="w-full h-full bg-black/80 flex items-center justify-center relative overflow-hidden shadow-2xl rounded-2xl">
          <CarouselWrapper navigation={false} showDots={true}>
            {carouselItems.map((item, idx) => (
              <motion.div
                key={item.videoId || idx}
                whileHover={{ scale: 0.99 }}
                className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={() => handleClick(item.videoId, item.level)}
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
      <div className="w-full md:w-[30%] h-[200px] md:h-full relative rounded-2xl overflow-hidden">
        <Image
          src={rightImage}
          alt="Dashboard Right"
          fill
          style={{ objectFit: "cover" }}
          className="rounded-2xl scale-105 hover:scale-110 transition-transform duration-700"
          priority
        />
      </div>
    </div>
  );
};

export default PrimaryDashboard;
