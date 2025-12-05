"use client";

import { CrossIcon, Like, Views } from "@/lib/svg_icons";
import Image from "next/image";
import Card from "./Card";
import VideoPlayer from "../dashboard/VideoPlayer";
import CustomDialog from "./CustomDialog";
import { useState } from "react";

const CourseCard = ({ course }) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { title, gifUrl, staticUrl } = course?.gif;

  const handleOpenDialog = () => {
    window.lastDialogScrollPosition = window.scrollY;
    setIsCustomOpen((prev) => !prev);
  };

  return (
    <>
      <Card 
        className={"group cursor-pointer w-[550px] relative h-[320px] 2xl:h-[320px]"} 
        onClick={handleOpenDialog}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-64 2xl:!h-64 rounded-2xl overflow-hidden">
          {isHovered ? (
            // Show GIF on hover
            <img
              src={gifUrl}
              alt={title}
              className="w-full h-64 2xl:!h-64 object-cover rounded-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            // Show static image when not hovering
            <Image
              src={staticUrl || gifUrl}
              alt={title}
              width={1000}
              height={1000}
              className="w-full h-64 2xl:!h-64 object-cover rounded-2xl"
              priority
            />
          )}
        </div>

        <div>
          <div className="h-auto">
            <h3 className="text-lg xl:text-xl font-medium leading-tight">
              {title.length > 20 ? title.slice(0, 20) : title}
            </h3>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CourseCard;
