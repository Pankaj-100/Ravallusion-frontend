"use client";
import React, { useState, useEffect } from "react";
import fireEffectimg from "../../../public/fire-effect.jpeg";
import spaceEffect1 from "../../../public/space-effect.png";
import prismatic from "../../../public/prismatic.png";
import Image from "next/image";
import { useGetCarouselImgQuery } from "@/store/Api/primaryDashboard";
import { motion } from "framer-motion";
import CarouselWrapper from "../common/CarouselWrapper";
import { useRouter } from "next/navigation"; 
import { useDispatch } from "react-redux";
import { setSidebarTabIndex } from  "@/store/slice/general";
const PrimaryDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data } = useGetCarouselImgQuery();
  const router = useRouter(); 
 const dispatch = useDispatch();

 console.log(data)
  const defaultImages = [
    { img: fireEffectimg, videoId: null },
    { img: spaceEffect1, videoId: null },
    { img: prismatic, videoId: null },
  ];

  const carousals = data?.data?.carousals || [];
  const carouselItems = carousals?.length
    ? carousals.map((item) => ({
        img: item?.video?.thumbnailUrl,
        videoId: item?.video?._id,
      }))
    : [];
  

  useEffect(() => {
    if (carouselItems?.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems?.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselItems?.length]);

  const handleClick = (videoId) => {
     dispatch(setSidebarTabIndex(1));
    if (videoId) {
      router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
    }
  };

  return (
    <CarouselWrapper>
      {carouselItems.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-0 lg:gap-2 h-96 lg:h-80">
          <motion.div
            whileHover={{ scale: 0.95 }}
            className="bg-pink-200 lg:col-span-3 col-span-6 relative order-1 lg:order-0 cursor-pointer"
            onClick={() =>
              handleClick(carouselItems[currentIndex % carouselItems?.length]?.videoId)
            }
          >
            <Image
              src={carouselItems[currentIndex % carouselItems?.length]?.img || fireEffectimg}
              alt="Fire effect img"
              fill
              style={{ objectFit: "cover" }}
            />
          </motion.div>

          <div
            className="col-span-12 lg:col-span-6 relative flex items-center justify-center order-0 lg:order-1 cursor-pointer"
            onClick={() =>
              handleClick(carouselItems[(currentIndex + 1) % carouselItems?.length]?.videoId)
            }
          >
            <div className="w-full h-full relative overflow-hidden">
              <Image
                src={carouselItems[(currentIndex + 1) % carouselItems?.length]?.img || spaceEffect1}
                alt={`Space effect image ${currentIndex + 1}`}
                fill
                style={{
                  objectFit: "cover",
                  transition: "opacity 1s ease-in-out",
                }}
              />
            </div>

            <div className="absolute bottom-3 flex justify-center w-full gap-1 z-10">
              {carouselItems.map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-[6px] h-[6px] rounded-full ${
                    currentIndex === dotIndex
                      ? "bg-[var(--neon-purple)]"
                      : "bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 0.95 }}
            className="bg-blue-200 col-span-6 lg:col-span-3 relative order-2 cursor-pointer"
            onClick={() =>
              handleClick(carouselItems[(currentIndex + 2) % carouselItems?.length]?.videoId)
            }
          >
            <Image
              src={carouselItems[(currentIndex + 2) % carouselItems?.length]?.img || prismatic}
              alt="Prismatic img"
              fill
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        </div>
      ))}
    </CarouselWrapper>
  );
};

export default PrimaryDashboard;
