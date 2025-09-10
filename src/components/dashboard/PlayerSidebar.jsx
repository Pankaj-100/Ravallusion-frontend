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
import { useGetSubscribedPlanCourseQuery } from "@/store/Api/course";
import { useGetPlanDataQuery } from "@/store/Api/home";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setCourseId, setFirstVideoId, setCourseType } from "@/store/slice/general";
import { setCourse } from "@/store/slice/course";
import Progresscard from "../dashboard/Progresscard";
import { useRouter } from "next/navigation";
import RecommandVideo from "./RecommandVideo";
import { useGetSubscriptionDetailQuery } from "@/store/Api/course";
const PlayerSidebar = () => {
  const [beginnerPlanId, setBeginnerPlanId] = useState(null);
  const [advancedPlanId, setAdvancedPlanId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const route = useRouter();
  const dispatch = useDispatch();
  const path = usePathname();

  const { data: plantype } = useGetSubscriptionDetailQuery();
  const planType = plantype?.data?.subscriptionDetails?.planType;
  const { data: plansData } = useGetPlanDataQuery();
  const { data } = useGetBookmarkQuery();
  const { data: introductoryData } = useGetIntroductoryQuery();

  // Get both beginner and advanced courses
  const { data: beginnerCourseData, isLoading: beginnerLoading } =
    useGetSubscribedPlanCourseQuery(beginnerPlanId, { skip: !beginnerPlanId });
  const { data: advancedCourseData, isLoading: advancedLoading } =
    useGetSubscribedPlanCourseQuery(advancedPlanId, { skip: !advancedPlanId });

  const beginnerCourse = beginnerCourseData?.data?.course;
  const advancedCourse = advancedCourseData?.data?.course;

  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  const tooltype = useSelector((state) => state.general.courseType);

  const introductoryVideos = introductoryData?.data?.introductoryVideos || [];
  const bookmarkedVideos = data?.bookmarks || [];

  // Set plan IDs for both beginner and advanced
  useEffect(() => {
    if (plansData?.data?.plans) {
      const beginnerPlan = plansData.data.plans.find((plan) => plan.level === 1);
      const advancedPlan = plansData.data.plans.find((plan) => plan.level === 2);
      setBeginnerPlanId(beginnerPlan?._id);
      setAdvancedPlanId(advancedPlan?._id);
    }
  }, [plansData]);

  useEffect(() => {
    setActiveIndex(sidebarTabIndex);
  }, [sidebarTabIndex]);

  // Determine course type based on URL
  const courseType = path.includes("beginner") ? "beginner" : "advanced";
//  dispatch(setCourseType("beginner"));
  // Set courseId and firstVideoId based on course type and tool type
  useEffect(() => {
    console.log("useEffect triggered with:", { courseType, tooltype });
    if (courseType === "beginner" && beginnerCourse) {
      dispatch(setCourseId(beginnerCourse?._id));
      dispatch(setCourse(beginnerCourse));
     
      // Set first video ID based on tool type
      if (tooltype === "photoshop") {
        const firstVideoId = beginnerCourse?.modules?.[0]?.submodules?.[0]?.videos?.[0]?._id;
           
        if (firstVideoId) dispatch(setFirstVideoId(firstVideoId));
      } else if (tooltype === "premier-pro") {
        const firstVideoId = beginnerCourse?.modules?.[1]?.submodules?.[0]?.videos?.[0]?._id;
 
        if (firstVideoId) dispatch(setFirstVideoId(firstVideoId));
      }
    } else if (courseType === "advanced" && advancedCourse) {
      dispatch(setCourseId(advancedCourse?._id));
      dispatch(setCourse(advancedCourse));
      
      // Set first video ID based on tool type
      if (tooltype === "photoshop") {
        const firstVideoId = advancedCourse?.modules?.[0]?.submodules?.[0]?.videos?.[0]?._id;
       
        if (firstVideoId) dispatch(setFirstVideoId(firstVideoId));
      } else if (tooltype === "premier-pro") {
        const firstVideoId = advancedCourse?.modules?.[1]?.submodules?.[0]?.videos?.[0]?._id;
      
        if (firstVideoId) dispatch(setFirstVideoId(firstVideoId));
      }
    }
     dispatch(setCourse(beginnerCourse));

  }, [beginnerCourse, advancedCourse, courseType, tooltype, dispatch]);

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

      <div className="py-4 bg-[#181F2B] rounded-2xl h-[73vh] overflow-y-auto custom-scrollbar-hover">
        {activeIndex === 0 && (
          <>
            {courseType === "beginner" && beginnerCourse && (
              <CourseModuleList
                course={beginnerCourse}
                isLoading={beginnerLoading}
                playingVideoId={playingVideoId}
                setPlayingVideoId={setPlayingVideoId}
              />
            )}
            {courseType === "advanced" && advancedCourse && (
              <CourseModuleList
                course={advancedCourse}
                isLoading={advancedLoading}
                playingVideoId={playingVideoId}
                setPlayingVideoId={setPlayingVideoId}
              />
            )}
           {courseType==="beginner"&& planType==="Beginner"?<RecommandVideo /> : ""}
            <Progresscard />
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