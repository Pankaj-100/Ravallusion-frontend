"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { CrossIcon, MinusIcon, PremiumIcon } from "@/lib/svg_icons";
import { LessonCard } from "./IntroductoryAndBookmarkList";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import CourseSkeletonLoader from "./CourseSkeletonLoader";
import { useGetCourseProgressQuery } from "@/store/Api/courseProgress";

const countVideosInSubmodule = (submodule) =>
  submodule?.videos?.length || 0;

const countVideosInModule = (module) => {
  if (!module?.submodules) return 0;
  return module.submodules.reduce(
    (acc, sub) => acc + countVideosInSubmodule(sub),
    0
  );
};

const CourseModuleList = ({
  course,
  playingVideoId,
  setPlayingVideoId,
  isLoading,
}) => {
  const modules = course?.modules;
  const { data: progressData } = useGetCourseProgressQuery();
  const planName = progressData?.data?.planName;
  const heading = course?.title;

  // Track if we've already scrolled to a video
  const hasScrolledRef = useRef(false);

  // Find expanded module/submodule
  let expandedModuleIdx = null;
  let expandedSubmoduleId = null;
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

  // Reset scroll when video changes
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [playingVideoId]);

  // Store lesson refs
  const lessonRefs = useRef({});

  // Scroll helper
  const scrollToPlayingVideo = useCallback(() => {
    if (
      playingVideoId &&
      lessonRefs.current[playingVideoId] &&
      !hasScrolledRef.current
    ) {
      lessonRefs.current[playingVideoId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      hasScrolledRef.current = true;
    }
  }, [playingVideoId]);

  // Trigger scroll after first render with playingVideoId
  useEffect(() => {
    if (playingVideoId) {
      setTimeout(scrollToPlayingVideo, 150);
    }
  }, [playingVideoId, scrollToPlayingVideo]);

  return (
    <>
      <h1 className="text-xl font-bold mb-4 px-3">{heading=="Advanced"?"VFX":"Editorial"}</h1>
      <div className="flex flex-col gap-y-4">
        {isLoading ? (
          <CourseSkeletonLoader />
        ) : modules && modules.length > 0 ? (
          modules.map((module, i) => (
            <CourseCard
              key={module._id}
              title={module.name}
              img={module.thumbnailUrl}
              videoCount={countVideosInModule(module)}
              submodules={module.submodules}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
              course={course}
              planName={planName}
              autoExpand={
                i === expandedModuleIdx || (!playingVideoId && i === 0)
              }
              autoExpandSubmoduleId={expandedSubmoduleId}
              lessonRefs={lessonRefs}
              scrollToPlayingVideo={scrollToPlayingVideo}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-y-4 h-40 px-5 text-center rounded-xl shadow-lg">
            <span className="animate-pulse text-4xl">😢</span>
            <h3 className="text-lg font-semibold text-red-500">
              Plan not Found
            </h3>
          </div>
        )}
      </div>
    </>
  );
};

const CourseCard = ({
  title,
  img,
  videoCount,
  submodules,
  playingVideoId,
  setPlayingVideoId,
  course,
  planName,
  autoExpand = false,
  autoExpandSubmoduleId = null,
  lessonRefs,
  scrollToPlayingVideo,
}) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);

  useEffect(() => {
    setIsExpanded(autoExpand);
  }, [autoExpand]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && playingVideoId) {
      setTimeout(scrollToPlayingVideo, 150);
    }
  };

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
            {/* <span
              style={{
                background: "rgba(0, 0, 0, 0.50)",
                backdropFilter: "blur(5.4px)",
              }}
              className="px-1 py-[2px] text-md absolute top-2 right-2 rounded-sm"
            >
              {videoCount} videos
            </span> */}
          </div>

          <div className="flex-grow w-32">
            <h1 className="text-lg font-semibold mb-1">{title}</h1>
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
          scrollToPlayingVideo={scrollToPlayingVideo}
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
  lessonRefs,
  scrollToPlayingVideo,
}) => {
  const params = useSearchParams();
  const videoId = params.get("videoId");
  const [dropdownStates, setDropdownStates] = useState({});
  const hasSubmoduleExpandedRef = useRef(false);

  // Auto-expand submodule for the playing video
  useEffect(() => {
    if (autoExpandSubmoduleId && !hasSubmoduleExpandedRef.current) {
      setDropdownStates((prev) => ({
        ...prev,
        [autoExpandSubmoduleId]: true,
      }));
      hasSubmoduleExpandedRef.current = true;

      // scroll after expansion
      setTimeout(scrollToPlayingVideo, 200);
    }
  }, [autoExpandSubmoduleId, scrollToPlayingVideo]);

  useEffect(() => {
    if (videoId) {
      setPlayingVideoId(videoId);
    }
  }, [videoId, setPlayingVideoId]);

  const toggleDropdown = (index) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));

    // Scroll if this submodule has the playing video
    if (!dropdownStates[index]) {
      setTimeout(scrollToPlayingVideo, 200);
    }
  };
  const isLocked = planName === "Beginner" && course?.title === "Advanced";
  const getSubmoduleVideoCount = (submodule) =>
    submodule?.videos?.length || 0;

  return (
    <div className="flex flex-col gap-y-2">
      {/* Module header */}
      <div
        style={{
          background:
            "linear-gradient(140deg, rgba(44, 104, 246, 0.49) 0%, rgba(133, 116, 246, 0.49) 100%)",
        }}
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

        <div className="flex-grow" onClick={onCollapse}>
          <h1 className="text-md font-semibold mb-1">{title}</h1>
          <p className="text-md">{videoCount} videos</p>
        </div>

        <button onClick={onCollapse} className="ml-auto">
          <CrossIcon />
        </button>
      </div>

      {/* Submodules */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col"
      >
        {submodules?.map((submodule) => (
          <div key={submodule._id} className="flex flex-col  ">
            {/* Submodule header */}
            {dropdownStates[submodule._id] ? (
              <div className="flex gap-x-2 p-3 mt-4  items-center cursor-pointer px-2  border-2 bg-[#FFFFFF25] mx-2   border-[#FFFFFF24] rounded-t-2xl">
                <div className="rounded-lg w-[100px] h-20 relative ">
                  <Image
                    src={submodule.thumbnailUrl}
                    alt="video png"
                    fill
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                </div>

                <div className="flex-grow w-32  " onClick={() => toggleDropdown(submodule._id)}>
                  <h1 className="text-md font-semibold mb-1 flex items-center gap-1">
                    {submodule.name}
                    {/* {course.title === "Advanced"&& <PremiumIcon size={20} />} */}
                  </h1>
                  <p className="text-md text-gray-300 ">
                    {getSubmoduleVideoCount(submodule)} videos
                  </p>
                </div>

                <button
                  onClick={() => toggleDropdown(submodule._id)}
                  className="text-xs text-red-500 underline ml-auto"
                >
                  <MinusIcon />
                </button>
              </div>
            ) : (
              <div
                className="flex gap-x-3 px-3 items-center cursor-pointer my-3 "
                onClick={() => toggleDropdown(submodule._id)}
              >
                <div className="bg-blue-400 rounded-xl w-40 h-20 relative">
                  <Image
                    src={submodule.thumbnailUrl}
                    alt="video png"
                    fill
                    style={{ borderRadius: "12px", objectFit: "cover" }}
                  />
                  {course.title === "Advanced" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PremiumIcon size={20} />
                    </div>
                  )}
                  {/* <span
                    style={{
                      background: "rgba(0, 0, 0, 0.50)",
                      backdropFilter: "blur(5.4px)",
                    }}
                    className="px-1 py-[2px] text-[10px] absolute top-2 right-2 rounded-sm"
                  >
                    {getSubmoduleVideoCount(submodule)} videos
                  </span> */}
                </div>

                <div className="flex-grow w-32">
                  <h1 className="text-md font-normal mb-1 flex items-center gap-1">
                    {submodule.name}
                  </h1>
                  <p className="text-[14px] truncate text-gray-400 font-bold whitespace-nowrap">
                    {getSubmoduleVideoCount(submodule)} videos
                  </p>
                </div>
              </div>
            )}

            {/* Lessons */}
            {dropdownStates[submodule._id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-y-3 mx-2 py-2 border-2 border-t-0  bg-[#FFFFFF14]  border-[#FFFFFF24] rounded-b-2xl" 

              >
                {submodule?.videos?.map((lesson, j) => {
                

                  return (
                    <div
                      key={lesson._id}
                      ref={(el) => {
                        if (lesson._id && lessonRefs) {
                          lessonRefs.current[lesson._id] = el;
                        }
                      }}
                    >
                      {/* {course.title === "Advanced" && (
                        <div className="relative top-4 left-4 z-10000">
                          <PremiumIcon className="w-5 h-5" />
                        </div>
                      )} */}

  <LessonCard
  videoId={lesson._id}
  thumbnail={lesson?.thumbnailUrl}
  locked={lesson?.lock }
  title={lesson.title}
  description={lesson.description}
  duration={`${String(lesson?.duration?.hours ?? 0).padStart(2, "0")}:${String(
    lesson?.duration?.minutes ?? 0
  ).padStart(2, "0")}:${String(lesson?.duration?.seconds ?? 0).padStart(2, "0")}`}
  isplaying={playingVideoId === lesson?._id}
  level={course.title === "Beginner" ? 1 : 2}
  bookmarkedId={lesson.bookmarkedId}
  bookmark={lesson.bookmark}
  introductory={lesson.introductory}
  onPlay={() => setPlayingVideoId(lesson._id)}
  allVideos={submodule.videos}
  videoIndex={j}
  parentSubmoduleIndex={submodules.findIndex(s => s._id === submodule._id)}
  allSubmodules={submodules}
  
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
