"use client";
import { BulbIcon, CourseIcon } from "@/lib/svg_icons";
import { Bookmark } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  BookmarkedList,
  IntroductoryList,
} from "./IntroductoryAndBookmarkList";
import CourseModuleList from "./CourseModuleList";
import { setSidebarTabIndex } from "@/store/slice/general";
import {
  useGetBookmarkQuery,
  useGetIntroductoryQuery,
} from "@/store/Api/introAndBookmark";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setCourseId, setFirstVideoId, setCourseType } from "@/store/slice/general";
import { setCourse } from "@/store/slice/course";
import Progresscard from "../dashboard/Progresscard";
import RecommandVideo from "./RecommandVideo";
import { useGetCourseDetailsQuery } from "../../store/Api/courseslist";

const PlayerSidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const dispatch = useDispatch();
  const pathname = usePathname();
  
  // Get courseId from Redux store AND from URL
  const reduxCourseId = useSelector((state) => state.general.courseId);
  
  // Extract courseId from URL on page load
  useEffect(() => {
    // Extract courseId from URL path: /dashboard/player-dashboard/{courseId}?videoId=...
    const pathParts = pathname.split('/');
    const courseIdFromUrl = pathParts[pathParts.length - 1];
    
    // Remove query parameters if any
    const cleanCourseId = courseIdFromUrl.split('?')[0];
    
    console.log("Extracted courseId from URL:", cleanCourseId);
    
    // If we have a valid courseId from URL and it's different from Redux
    if (cleanCourseId && cleanCourseId !== reduxCourseId && 
        cleanCourseId !== "beginner" && cleanCourseId !== "advanced") {
      dispatch(setCourseId(cleanCourseId));
      dispatch(setCourseType(cleanCourseId));
    }
  }, [pathname, dispatch, reduxCourseId]);
  
  // Use courseId from Redux (which now has value from URL on reload)
  const courseId = reduxCourseId;
  
  console.log("PlayerSidebar - Course ID:", courseId);
  
  // Fetch course details using the courseId
  const { data: courseData, isLoading: courseLoading } = useGetCourseDetailsQuery(courseId, {
    skip: !courseId,
  });

  console.log("PlayerSidebar - Course Data:", courseData);
  
  const course = courseData || null;

  const { data } = useGetBookmarkQuery();
  const { data: introductoryData } = useGetIntroductoryQuery();

  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  
  const introductoryVideos = introductoryData?.data?.introductoryVideos || [];
  const bookmarkedVideos = data?.bookmarks || [];

  // Set active tab index
  useEffect(() => {
    setActiveIndex(sidebarTabIndex);
  }, [sidebarTabIndex]);

  // Set course data in Redux when course is loaded
  useEffect(() => {
    if (course && courseId) {
      console.log("Setting course data:", { courseId, course });
      dispatch(setCourse(course));
      
      // Set first video ID from the first module's first video
      if (course.modules && course.modules.length > 0) {
        const firstModule = course.modules[0];
        // Check if modules have videos directly or through submodules
        if (firstModule.videos && firstModule.videos.length > 0) {
          const firstVideoId = firstModule.videos[0]._id;
          if (firstVideoId) dispatch(setFirstVideoId(firstVideoId));
        } else if (firstModule.submodules && firstModule.submodules.length > 0) {
          const firstSubmodule = firstModule.submodules[0];
          if (firstSubmodule.videos && firstSubmodule.videos.length > 0) {
            const firstVideoId = firstSubmodule.videos[0]._id;
            if (firstVideoId) dispatch(setFirstVideoId(firstVideoId));
          }
        }
      }
    }
  }, [course, courseId, dispatch]);

  return (
    <>
      <div className="flex gap-x-3 mb-4">
        <ActionCard
          icon={<CourseIcon />}
          isActive={activeIndex === 0}
          onClick={() => {
            setActiveIndex(0);
            dispatch(setSidebarTabIndex(0));
          }}
        />
        <ActionCard
          icon={<BulbIcon />}
          isActive={activeIndex === 1}
          onClick={() => {
            setActiveIndex(1);
            dispatch(setSidebarTabIndex(1));
          }}  
        />
        <ActionCard
          icon={<Bookmark />}
          isActive={activeIndex === 2}
          onClick={() => {
            setActiveIndex(2);  
            dispatch(setSidebarTabIndex(2));
          }}
        />
      </div>

      <div className="py-2 bg-[#181F2B] rounded-2xl h-[88%] mb-2 overflow-y-auto custom-scrollbar-hover">   
        <div className="bg-[#181F2B] rounded-2xl h-[70vh]">   
          {activeIndex === 0 && (
            <>
              {!courseId ? (
                <div className="text-center py-8 text-gray-400">
                  Please select a course from the navbar
                </div>
              ) : courseLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading course...
                </div>
              ) : course ? (
                <CourseModuleList
                  course={course}
                  isLoading={courseLoading}
                  playingVideoId={playingVideoId}
                  setPlayingVideoId={setPlayingVideoId}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Course not found or not enrolled
                </div>
              )}
              <RecommandVideo />
              {/* <Progresscard /> */}
            </>
          )}

          {activeIndex === 1 && (
            <IntroductoryList
              heading={"Learn properly"}
              subItems={introductoryVideos}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
            />
          )}

          {activeIndex === 2 && (
            <BookmarkedList
              heading={"Bookmarked videos"}
              subItems={bookmarkedVideos}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
            />
          )}
        </div>
      </div>
    </>
  );
};

const ActionCard = ({ icon, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: isActive ? "var(--neon-purple)" : "var(--card, #181F2B)",
        backgroundImage:
          isActive && "linear-gradient(150deg, #2C68F6 0%, #8574F6 100%)",
      }}
      className="hover:!bg-gray-800 py-4 h-14 flex-grow rounded-lg flex items-center justify-center cursor-pointer"
    >
      {icon}
    </div>
  );
};

export default PlayerSidebar;