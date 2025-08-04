"use client";
import { BulbIcon, CourseIcon } from "@/lib/svg_icons";
import { Bookmark } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  BookmarkedList,
  IntroductoryList,
} from "./IntroductoryAndBookmarkList";
import CourseModuleList from "./CourseModuleList";
import { setSidebarTabIndex, setCourseId, setFirstVideoId,setCourseType } from "@/store/slice/general";
import { useGetBookmarkQuery, useGetIntroductoryQuery } from "@/store/Api/introAndBookmark";
import { useGetSubscribedPlanCourseQuery } from "@/store/Api/course";
import { useGetPlanDataQuery } from "@/store/Api/home";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setCourse } from "@/store/slice/course";
import Progresscard from "../dashboard/Progresscard";
import { useGetSubscriptionDetailQuery } from '@/store/Api/course'
const mergeModulesByTitle = (modules = []) => {
  const moduleMap = {};

  modules.forEach((module) => {
    const title = module.name;

    if (!moduleMap[title]) {
      moduleMap[title] = {
        ...module,
        submodules: (module.submodules || []).map((sub) => ({
          ...sub,
          planLevel: module.level, 
        })),
      };
    } else {
      const additionalSubmodules = (module.submodules || []).map((sub) => ({
        ...sub,
        planLevel: module.level,
      }));

      moduleMap[title].submodules = [
        ...moduleMap[title].submodules,
        ...additionalSubmodules,
      ];
    }
  });

  return Object.values(moduleMap);
};

const PlayerSidebar = () => {

  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [beginnerPlanId, setBeginnerPlanId] = useState(null);
  const [advancedPlanId, setAdvancedPlanId] = useState(null);

     const { data:planName, isLoading } = useGetSubscriptionDetailQuery();

const userPlan= planName?.data?.subscriptionDetails?.planType;
  const dispatch = useDispatch();
  const path = usePathname();
const typecourse = path.includes("beginner") ? "beginner" : "advanced";
  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
   const tooltype = useSelector((state) => state.general.courseType);

  const { data: plansData } = useGetPlanDataQuery();
  const { data: bookmarkedData } = useGetBookmarkQuery();
  const { data: introductoryData } = useGetIntroductoryQuery();

  const {
    data: beginnerCourseData,
    isLoading: beginnerLoading,
  } = useGetSubscribedPlanCourseQuery(beginnerPlanId, { skip: !beginnerPlanId });

  const {
    data: advancedCourseData,
    isLoading: advancedLoading,
  } = useGetSubscribedPlanCourseQuery(advancedPlanId, { skip: !advancedPlanId });

  const bookmarkedVideos = bookmarkedData?.bookmarks || [];
  const introductoryVideos = introductoryData?.data?.introductoryVideos || [];

  const beginnerCourse = beginnerCourseData?.data?.course;
  const advanceCourse = advancedCourseData?.data?.course;
 

  useEffect(() => {
    setActiveIndex(sidebarTabIndex);
  }, [sidebarTabIndex]);

  useEffect(() => {
    if (plansData?.data?.plans?.length) {
      const beginnerPlan = plansData.data.plans.find((p) => p.level === 1);
      const advancedPlan = plansData.data.plans.find((p) => p.level === 2);
      setBeginnerPlanId(beginnerPlan?._id);
      setAdvancedPlanId(advancedPlan?._id);
    }
  }, [plansData]);


  useEffect(() => {
    if (beginnerCourse || advanceCourse) {
      const beginnerModules = (beginnerCourse?.modules || []).map((mod) => ({ ...mod, level: 1 }));
      const advancedModules = (advanceCourse?.modules || []).map((mod) => ({ ...mod, level: 2 }));

      const allModules = [...beginnerModules, ...advancedModules];
      const mergedModules = mergeModulesByTitle(allModules);

      const mergedCourse = {
        ...beginnerCourse,
        modules: mergedModules,
      };

if(typecourse=="beginner")
{

 dispatch(setCourseId(beginnerCourse?._id));
}
else
{

 dispatch(setCourseId(advanceCourse?._id));
}
     

dispatch(setCourse(mergedCourse));



if(tooltype==null){
      const firstVideoId = mergedModules?.[0]?.submodules?.[0]?.videos?.[0]?._id;
      if (firstVideoId) {
        dispatch(setFirstVideoId(firstVideoId));
      }
    }
    if(tooltype=="photoshop"  ){
        const firstVideoId = mergedModules?.[0]?.submodules?.[0]?.videos?.[0]?._id;
      if (firstVideoId) {
        dispatch(setFirstVideoId(firstVideoId));
      }

    }
       if(tooltype=="premier-pro"  ){
        const firstVideoId = mergedModules?.[1]?.submodules?.[0]?.videos?.[0]?._id;
      if (firstVideoId) {
        dispatch(setFirstVideoId(firstVideoId));
      }

    }


    }
  }, [beginnerCourse, advanceCourse,typecourse, tooltype,dispatch]);


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

      <div className="py-4 min-h-screen bg-[#181F2B] rounded-2xl">
        {activeIndex === 0 && (
          <>
          <CourseModuleList
            course={{
              ...beginnerCourse,
              modules: mergeModulesByTitle([
                ...(beginnerCourse?.modules || []).map((mod) => ({ ...mod, level: 1 })),
                ...(advanceCourse?.modules || []).map((mod) => ({ ...mod, level: 2 })),
              ]),
            }}
            isLoading={beginnerLoading || advancedLoading}
            playingVideoId={playingVideoId}
            setPlayingVideoId={setPlayingVideoId}
          />
           <Progresscard/>
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
