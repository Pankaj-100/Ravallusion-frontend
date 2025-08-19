"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { CrossIcon, MinusIcon } from "@/lib/svg_icons";
import { LessonCard } from "./IntroductoryAndBookmarkList";
  import { useDispatch } from 'react-redux';

import { motion } from 'framer-motion';
import Link from "next/link";
import { CustomButton } from "../common/CustomButton";
import { useSearchParams } from "next/navigation";
import CourseSkeletonLoader from "./CourseSkeletonLoader";
import { useGetCourseProgressQuery } from "@/store/Api/courseProgress";
import {
  PremiumIcon
} from "@/lib/svg_icons";

const countVideosInSubmodule = (submodule) => {
  return submodule?.videos?.length || 0;
};

const countVideosInModule = (module) => {
  if (!module?.submodules) return 0;
  return module.submodules.reduce((acc, sub) => acc + countVideosInSubmodule(sub), 0);
};

const CourseModuleList = ({ course, playingVideoId, setPlayingVideoId, isLoading }) => {
  const modules = course?.modules;
  const { data: progressData } = useGetCourseProgressQuery();
  const planName = progressData?.data?.planName;
  const heading = "Courses";

  // Find the module and submodule containing the playingVideoId
  let expandedModuleIdx = null;
  let expandedSubmoduleId = null;
  let lessonRefMap = {}; // <--- Add this
  if (playingVideoId && modules) {
    modules.forEach((module, mi) => {
      module.submodules?.forEach((sub) => {
        sub.videos?.forEach((v) => {
          if (v._id === playingVideoId) {
            expandedModuleIdx = mi;
            expandedSubmoduleId = sub._id;
          }
        });
      });
    });
  }

  // --- Add refs for each lesson ---
  const lessonRefs = useRef({});

  // --- Scroll to the correct lesson when playingVideoId changes ---
  useEffect(() => {
    if (playingVideoId && lessonRefs.current[playingVideoId]) {
      lessonRefs.current[playingVideoId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playingVideoId]);

  return (
    <>
      <h1 className='text-lg font-semibold mb-7 px-3'>{heading}</h1>
      <div className='flex flex-col gap-y-7'>
        {isLoading ? (
          <CourseSkeletonLoader />
        ) : modules && modules.length > 0 ? (
          modules.map((module, i) => (
            <CourseCard
              key={module._id + (i === expandedModuleIdx ? '-expanded' : '')}
              title={module.name}
              img={module.thumbnailUrl}
              videoCount={countVideosInModule(module)}
              submodules={module.submodules}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
              course={course}
              planName={planName}
              autoExpand={i === expandedModuleIdx || (!playingVideoId && i === 0)}
              autoExpandSubmoduleId={expandedSubmoduleId}
              lessonRefs={lessonRefs}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-y-4 h-40 px-5 text-center rounded-xl shadow-lg">
            <span className="animate-pulse text-4xl">😢</span>
            <h3 className="text-lg font-semibold text-red-500">Plan not Found</h3>
          </div>
        )}
      </div>
    </>
  );
};

// Update CourseCard and CourseCardExpand to accept and pass lessonRefs

const CourseCard = ({
  title, img, videoCount, submodules, playingVideoId, setPlayingVideoId, course, planName,
  autoExpand = false, autoExpandSubmoduleId = null, lessonRefs
}) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);

  useEffect(() => {
    setIsExpanded(autoExpand);
  }, [autoExpand]);

  const handleExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      {!isExpanded ? (
        <div
          className="flex gap-x-3 px-3 items-center cursor-pointer"
          onClick={handleExpand}
        >
          <div className="rounded-xl w-40 h-20 relative">
            <Image
              src={img}
              alt="video png"
              fill
              style={{ borderRadius: "12px", objectFit: "cover" }}
            />
            <span
              style={{
                background: "rgba(0, 0, 0, 0.50)",
                backdropFilter: "blur(5.4px)",
              }}
              className="px-1 py-[2px] text-md absolute top-2 right-2 rounded-sm"
            >
              {videoCount} videos
            </span>
          </div>

          <div className="flex-grow w-32">
            <h1 className="text-md font-normal mb-1">{title}</h1>
            <p className="text-md truncate whitespace-nowrap">
              {videoCount} videos
            </p>
          </div>
        </div>
      ) : (
        <CourseCardExpand
          title={title}
          img={img}
          submodules={submodules}
          videoCount={videoCount}
          onCollapse={handleExpand}
          playingVideoId={playingVideoId}
          setPlayingVideoId={setPlayingVideoId}
          course={course}
          planName={planName}
          autoExpandSubmoduleId={autoExpandSubmoduleId}
          lessonRefs={lessonRefs}
        />
      )}
    </>
  );
};

const CourseCardExpand = ({
  title,
  img,
  videoCount,
  submodules,
  onCollapse,
  setPlayingVideoId,
  playingVideoId,
  course,
  planName,
  autoExpandSubmoduleId = null,
  lessonRefs // <--- Accept lessonRefs as prop, do NOT redeclare below!
}) => {
  const params = useSearchParams();
  // const dispatch = useDispatch();
  const videoId = params.get("videoId");
  const [dropdownStates, setDropdownStates] = useState({});

  // Auto-expand the submodule containing the playing video
  useEffect(() => {
    if (autoExpandSubmoduleId) {
      setDropdownStates((prev) => ({
        ...prev,
        [autoExpandSubmoduleId]: true,
      }));
    }
  }, [autoExpandSubmoduleId]);

  useEffect(() => {
    // Scroll only if the lesson card is in the DOM
    if (
      playingVideoId &&
      lessonRefs.current[playingVideoId] &&
      dropdownStates[autoExpandSubmoduleId]
    ) {
      setTimeout(() => {
        lessonRefs.current[playingVideoId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [playingVideoId, dropdownStates, autoExpandSubmoduleId, lessonRefs]);

  useEffect(() => {
    if (videoId) {
      setPlayingVideoId(videoId);
    }
  }, [videoId]);

  useEffect(() => {
    // Scroll to the lesson card if playingVideoId is present
    if (playingVideoId && lessonRefs.current[playingVideoId]) {
      lessonRefs.current[playingVideoId].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playingVideoId]);

  useEffect(() => {
    if (
      playingVideoId &&
      lessonRefs.current[playingVideoId] &&
      Object.values(dropdownStates).some(Boolean)
    ) {
      setTimeout(() => {
        lessonRefs.current[playingVideoId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [playingVideoId, dropdownStates, lessonRefs]);

  const toggleDropdown = (index) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const isLocked = planName === "Beginner" && course?.title === "Advanced";
  const getSubmoduleVideoCount = (submodule) => submodule?.videos?.length || 0;

  return (
    <div className="flex flex-col gap-y-2">
      <div
        style={{ background: "linear-gradient(140deg, rgba(44, 104, 246, 0.49) 0%, rgba(133, 116, 246, 0.49) 100%)" }}
        className="flex gap-x-2 items-center cursor-pointer px-3 py-2"
      >
        <div className="rounded-lg w-16 h-12 relative">
          <Image
            src={img}
            alt="video png"
            fill
            style={{ borderRadius: "16px", objectFit: "cover" }}
          />
        </div>

        <div className="flex-grow">
          <h1 className="text-md font-semibold mb-1">{title}</h1>
          <p className="text-md">{videoCount} videos</p>
        </div>

        <button onClick={onCollapse} className="ml-auto">
          <CrossIcon />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col"
      >
        {submodules?.map((submodule) => (
          <div key={submodule._id} className="flex flex-col">
            {dropdownStates[submodule._id] ? (
              <div className="flex gap-x-2 my-4 items-center cursor-pointer px-2 pb-2 border-b border-gray-700">
                <div className="rounded-lg w-14 h-10 relative">
                  <Image
                    src={submodule.thumbnailUrl}
                    alt="video png"
                    fill
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                </div>

                <div className="flex-grow w-32">
                  <h1 className="text-md font-semibold mb-1 flex items-center gap-1 z-1000">
                    {submodule.name}
                    {submodule.planLevel === 2 && (
                     <PremiumIcon size={20}/>
                    )}
                  </h1>
                  <p className="text-md text-gray-300 ">{getSubmoduleVideoCount(submodule)} videos</p>
                </div>

                <button onClick={() => toggleDropdown(submodule._id)} className="text-xs text-red-500 underline ml-auto">
                  <MinusIcon />
                </button>
              </div>
            ) : (
              <div
                className="flex gap-x-3 px-3 items-center cursor-pointer my-3"
                onClick={() => toggleDropdown(submodule._id)}
              >
                <div className="bg-blue-400 rounded-xl w-40 h-20 relative">
                  <Image
                    src={submodule.thumbnailUrl}
                    alt="video png"
                    fill
                    style={{ borderRadius: "12px", objectFit: "cover" }}
                  />
                  {submodule.planLevel === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center ">
                      <PremiumIcon  size={20}/>
                    </div>
                  )}
                  <span
                    style={{
                      background: "rgba(0, 0, 0, 0.50)",
                      backdropFilter: "blur(5.4px)",
                    }}
                    className="px-1 py-[2px] text-[10px] absolute top-2 right-2 rounded-sm"
                  >
                    {getSubmoduleVideoCount(submodule)} videos
                  </span>
                </div>

                <div className="flex-grow w-32">
                  <h1 className="text-md font-normal mb-1 flex items-center gap-1">
                    {submodule.name}
               
                  </h1>
                  <p className="text-[10px] truncate whitespace-nowrap">
                    {getSubmoduleVideoCount(submodule)} videos
                  </p>
                </div>
              </div>
            )}

{dropdownStates[submodule._id] && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col gap-y-3"
  >
    {submodule?.videos?.map((lesson, j) => {
      // Check if this is the first submodule of the module
      const isFirstSubmodule = submodules[0]._id === submodule._id;
    

   
      return (
        <div
          key={j}
          className="relative"
          ref={el => {
            if (lesson._id && lessonRefs) lessonRefs.current[lesson._id] = el;
          }}
        >
          {lesson.planLevel === 2 && (
            <div className="relative top-2 left-2 z-1000">
              <PremiumIcon className="w-5 h-5" />
            </div>
          )}
          
          <LessonCard
            isplaying={playingVideoId === lesson?._id}
            onPlay={() => {
              if (isLocked) return;
              setPlayingVideoId(lesson._id);
            }}
            level={submodule.planLevel}
            videoId={lesson._id}
            isFirstSubmodule={isFirstSubmodule}
            title={lesson.title || "I am Title"}
            thumbnail={lesson?.thumbnailUrl}
            duration={`${String(lesson?.duration?.hours ?? 0).padStart(2, "0")}:${String(lesson?.duration?.minutes ?? 0).padStart(2, "0")}:${String(lesson?.duration?.seconds ?? 0).padStart(2, "0")}`}
            isLocked={
              planName === "Beginner" && 
              submodule.planLevel === 2 && 
              !isFirstSubmodule && // Only lock if not first submodule
              j > 0 // And not first video
            }
            isFirstVideo={j === 0 || isFirstSubmodule} // Unlock if first video OR in first submodule
          />
        </div>
      );
    })}
  </motion.div>
)}
          </div>
        ))}
      </motion.div>
        
    </div>
  );
};

export default CourseModuleList;