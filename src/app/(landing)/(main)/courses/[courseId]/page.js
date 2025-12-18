"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import PageLoader from "@/components/common/PageLoader";
import StaticHeader from "@/components/landingPage/StaticHeader";
import { useGetAllCoursesQuery, useGetCourseModulesQuery } from "@/store/Api/courseslist";
import { CustomButton, GlowButton } from "@/components/common/CustomButton";
import { DownloadIcon } from "@/lib/svg_icons";
import ModulesList from "@/components/common/ModulesList";
import { useInView, useScroll } from "framer-motion";
import LandingContainer from "@/components/common/LandingContainer";
import { useRouter } from "next/navigation"; // Add this
import { useDispatch, useSelector } from "react-redux"; // Add this
import { 
  setPlanId,
  setPlanPrice,
  setPlanType,
  setUsdPrice,
  setCourseData
} from "@/store/slice/general"; // Add this

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const router = useRouter(); // Add this
  const dispatch = useDispatch(); // Add this
  const isIndia = useSelector((state) => state.general.isIndia); // Add this
  const [isClient, setIsClient] = useState(false);
  const container = useRef(null);
  const inViewRef = useRef(null);
  
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({ page: 1, limit: 100 });
  const { data: modulesData, isLoading: modulesLoading } = useGetCourseModulesQuery(courseId);
  
  const courses = coursesData?.data?.courses || [];
  const course = courses.find((c) => c._id === courseId);
  const modules = modulesData?.data?.modules || [];

  const isLoading = coursesLoading || modulesLoading;

  const isInView = useInView(inViewRef, {
    once: false,
    margin: "0px 0px -200px 0px"
  });

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add this EXACT SAME function as CourseCard
  const handleEnrollClick = () => {
    if (!course) return;
    
    // Dispatch course details to Redux (SAME AS CourseCard)
    dispatch(setPlanId(course._id));
    dispatch(setPlanType(course.title || course.heading));
    dispatch(setPlanPrice(course.inr_price));
    dispatch(setUsdPrice(course.usd_price));
    dispatch(setCourseData(course));
    
    // Navigate to cart with course parameters (SAME AS CourseCard)
    const courseName = course.title || course.heading || "Course";
    router.push(
      `/mycart?courseId=${course._id}&courseName=${encodeURIComponent(courseName)}&price=${course.inr_price}&usdPrice=${course.usd_price}`
    );
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center !h-fit">
        <StaticHeader 
          list={[
            { name: "Home", link: "/" },
            { name: "Courses", link: "/courses" }
          ]} 
          heading="Course Not Found" 
          subHeading={<></>} 
        />
        <p className="text-white text-center py-10">This course is not available</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (isClient) {
      window.open(course.curriculumUrl || "#", "_blank");
    }
  };

  const list = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Courses",
      link: "/courses",
    },
    {
      name: course.title,
      link: `/courses/${courseId}`,
    },
  ];

  return (
    <>
      <StaticHeader 
        list={list} 
        heading={course.title} 
        subHeading={<></>} 
      />

      {/* Modules Section */}
      <div ref={container} className="bg-[var(--dark-bg)]">
        <div ref={inViewRef} className="w-full h-1">
          <LandingContainer className="py-8 sm:py-[4.5rem] h-fit flex flex-col gap-7 fixed top-10 z-40">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="md:max-w-[60%]">
                <div className="text-3xl md:text-5xl 2xl:text-6xl font-bold mb-2">
                  What you will learn?
                </div>
                <div className="text-base 2xl:text-lg text-[var(--light-gray)]">
                  Discover a comprehensive curriculum designed to empower you with
                  the skills and knowledge needed to excel in communication.
                  Throughout the Communication Masterclass, you&apos;ll explore the
                  following modules in depth.
                </div>
              </div>
              <div className="flex flex-col gap-4 items-center flex-wrap">
                {/* Update this button to use the SAME functionality */}
                <GlowButton 
                  className="!p-5 !py-5 !text-base 2xl:!text-lg !rounded-xl w-full"
                  onClick={handleEnrollClick} // Add onClick here
                >
                  Enroll Now
                </GlowButton>
                <CustomButton 
                  className="!p-5 !py-5 !text-base 2xl:!text-lg !rounded-xl primary-btn flex items-center gap-2" 
                  onClick={handleDownload} // Uncomment this
                >
                  Download Curriculum <DownloadIcon />
                </CustomButton>
              </div>
            </div>
          </LandingContainer>
        </div>

        <div className="mb-10">
          <ModulesList 
            modules={modules}
            scrollYProgress={scrollYProgress}
            inView={isInView}
          />
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;