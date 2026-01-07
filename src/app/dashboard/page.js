'use client'
import CustomCarousel from "@/components/common/CustomCarousel";
import PrimaryDashboard from "@/components/dashboard/PrimaryDashboard";
import SkeletonVideoCard from "@/components/dashboard/SkeletonVideoCard";
import TutorialCards from "@/components/dashboard/TutorialCards";
import { useGetUserCoursesVideosQuery } from "@/store/Api/primaryDashboard";
import React from "react";

const Page = () => {
  const { data, isLoading } = useGetUserCoursesVideosQuery();
  const enrolledCourses = data?.enrolledCourses || [];
  const otherCourses = data?.otherCourses || [];
  const allCourses = [...enrolledCourses, ...otherCourses];
  
  return <>
    <PrimaryDashboard />

    {
      isLoading ?
        <div className='grid grid-cols-12 px-2 md:px-0 gap-x-4 gap-y-3 mt-5'>
          {
            (
              Array(8).fill(0).map((_, i) => (
                <SkeletonVideoCard key={i} />
              ))
            )
          }
        </div> :
        (
          allCourses.length > 0 ? 
            allCourses.map((course, i) => (
              <TutorialCards 
                key={i} 
                title={course?.title} 
                subItems={course?.videos || []} 
                courseId={course?.courseId}
                isEnrolled={course?.isEnrolled}
              />
            ))
          :
          <div className="text-center py-8 text-gray-400">
            No courses found
          </div>
        )
    }

  </>
};

export default Page;