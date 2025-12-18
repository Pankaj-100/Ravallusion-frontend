"use client";

import React, { useState } from 'react';
import { SimpleLoader } from '../common/LoadingSpinner';
import CourseCard from "@/components/landingPage/Coursecard";
import { useGetAllCoursesQuery } from "@/store/Api/courseslist";

const SubscriptionPlan = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading } = useGetAllCoursesQuery({ page, limit });
  const courses = data?.data?.courses || [];

  return isLoading ? <SimpleLoader /> : (
    <div className='w-full h-full lg:mt-28 md:mt-14 p-6 rounded-[28px] bg-[var(--card-bg)] backdrop-blur-lg mb-4'>
      <h2 className='text-center text-[34px] font-bold'>Select Course to Get started</h2>
      <p className='text-[16px] text-center mb-[30px]'>Please Select Course to Continue</p>

      <div className="flex flex-wrap justify-center gap-6 px-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <p className="text-white text-center py-10">No courses available</p>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPlan;