"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { GlowButton } from "../common/CustomButton";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setPlanId,
  setPlanPrice,
  setPlanType,
  setUsdPrice,
  setCourseData, // Add this import
} from "@/store/slice/general";

const CourseCard = ({ course }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isIndia = useSelector((state) => state.general.isIndia);

  if (!course) return null;

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    
    // Dispatch course details to Redux
    dispatch(setPlanId(course._id));
    dispatch(setPlanType(course.title || course.heading));
    dispatch(setPlanPrice(course.inr_price));
    dispatch(setUsdPrice(course.usd_price));
    // Add this line to dispatch full course data
    dispatch(setCourseData(course));
    
    // Navigate to cart with course parameters
    const courseName = course.title || course.heading || "Course";
    router.push(
      `/mycart?courseId=${course._id}&courseName=${encodeURIComponent(courseName)}&price=${course.inr_price}&usdPrice=${course.usd_price}`
    );
  };

  return (
    <motion.div
      className="relative w-[350px] h-[568px] rounded-3xl overflow-hidden shadow-lg bg-[#0B0B0B]/80 border border-white/10 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {/* Background Image with blur */}
      <div className="absolute inset-0">
        <Image
          src={course.bgImage || "/bgcard.png"}
          alt={course.title}
          fill
          className="object-cover blur-[1px] brightness-10"
          sizes="(max-width: 350px) 100vw, 350px"
        />
      </div>

      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-5 text-center text-white">
        {/* Title */}
        <h3 className="text-lg tracking-wider font-semibold text-white/90">
          {course.title}
        </h3>
        <div className="border-b-2 border-white/40 mt-10 absolute w-full"></div>

        {/* Course Image */}
{/* Course Image - Fixed size with crop */}
<div className="mt-4 flex justify-center">
  <div className="relative w-[120px] h-[120px] rounded-lg overflow-hidden">
    <Image
      src={course.courseImage || "/logocard.png"}
      alt={course.title}
      fill
      className="object-cover"
      sizes="120px"
    />
  </div>
</div>

        {/* Description Section */}
        <div className="mt-6 text-left w-full">
          <h4 className="text-xl font-semibold mb-3">{course.heading}</h4>
          <ul className="list-disc pl-5 space-y-2 text-base text-[#FFFFFF]">
            {course.points && course.points.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="mt-6 flex items-center gap-2">
          <p className="text-md text-[#FFFFFFCC]">Price:</p>
          <p className="text-lg font-semibold text-white border-2 px-4 py-1 rounded-lg">
            {isIndia ? `₹${course.inr_price}/-` : `$${course.usd_price}`}
          </p>
        </div>

        {/* Enroll Button */}
        <GlowButton 
          className="mt-6 w-full py-6 text-xl rounded-xl font-bold hover:scale-105 transition-transform"
          onClick={handleEnrollClick}
        >
          Enroll now <ArrowRightIcon className="ml-2 !h-6 !w-8" />
        </GlowButton>
      </div>
    </motion.div>
  );
};

export default CourseCard;