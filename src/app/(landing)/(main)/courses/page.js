"use client";

import LandingContainer from "@/components/common/LandingContainer";
import PageLoader from "@/components/common/PageLoader";
import StaticHeader from "@/components/landingPage/StaticHeader";
import CourseCard from "../../../../components/landingPage/Coursecard";
import { useGetAllCoursesQuery } from "@/store/Api/courseslist";
import { useState } from "react";

const list = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Courses",
    link: "/courses",
  },
];

const CoursesPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading } = useGetAllCoursesQuery({ page, limit });

  const heading = "Our Courses details";
  const subHeading = <></>;
  
  const courses = data?.data?.courses || [];

  return isLoading ? (
    <PageLoader />
  ) : (
    <LandingContainer className="flex flex-col items-center !h-fit" bg2={true}>
      <StaticHeader list={list} heading={heading} subHeading={subHeading} />
      
      <div className="flex flex-wrap justify-center gap-6 px-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <p className="text-white text-center py-10">No courses available</p>
        )}
      </div>
    </LandingContainer>
  );
};

export default CoursesPage;
