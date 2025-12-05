"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LandingContainer from "../common/LandingContainer";
import CourseCard from "./Coursecard";
import { useGetAllCoursesQuery } from "@/store/Api/courseslist";
import PageLoader from "../common/PageLoader";

const CourseSection = () => {
  const scrollRef = useRef(null);
  const { data, isLoading } = useGetAllCoursesQuery({ page: 1, limit: 10 });

  const courses = data?.data?.courses || [];

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 350; // width of one card
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <LandingContainer className="!h-full pt-12 py-5 sm:pt-[10.5rem] flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="md:max-w-[60%]">
          <div className="text-3xl md:text-5xl 2xl:text-6xl font-bold mb-2">
            Our Course details
          </div>
          <div className="text-base 2xl:text-lg text-[var(--light-gray)]">
            Our Course details is a means of preserving the Truth in society.
          </div>
        </div>

        {/* Carousel Arrows */}
        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Carousel Section */}
      <motion.div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 scrollbar-hide scroll-smooth py-4"
      >
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course._id} className="flex-shrink-0">
              <CourseCard course={course} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-10 text-white">
            No courses available
          </div>
        )}
      </motion.div>
    </LandingContainer>
  );
};

export default CourseSection;
