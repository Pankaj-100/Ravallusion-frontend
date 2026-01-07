"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { CrossIcon, MinusIcon, Down } from "@/lib/svg_icons";
import { LessonCard } from "./IntroductoryAndBookmarkList";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import CourseSkeletonLoader from "./CourseSkeletonLoader";
import { useGetCourseProgressQuery } from "@/store/Api/courseProgress";

// Helper functions to count videos based on new structure
const countVideosInModule = (module) => {
  // Check if videos are directly in module
  if (module?.videos?.length > 0) {
    return module.videos.length;
  }
  // Or if videos are in submodules
  if (module?.submodules?.length > 0) {
    return module.submodules.reduce((acc, sub) => acc + (sub?.videos?.length || 0), 0);
  }
  return 0;
};

const CourseModuleList = ({
  course,
  playingVideoId,
  setPlayingVideoId,
  isLoading,
}) => {
  const modules = course?.modules || [];
  const { data: progressData } = useGetCourseProgressQuery();
  const heading = course?.title || "Course";

  // Track if we've already scrolled to a video
  const hasScrolledRef = useRef(false);

  // Find expanded module based on playing video
  let expandedModuleIdx = null;
  if (playingVideoId && modules) {
    modules.forEach((module, mi) => {
      // Check videos directly in module
      if (module.videos?.some(v => v._id === playingVideoId)) {
        expandedModuleIdx = mi;
      }
      // Check videos in submodules
      if (module.submodules?.some(sub => 
        sub.videos?.some(v => v._id === playingVideoId)
      )) {
        expandedModuleIdx = mi;
      }
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
      <h1 className="text-xl font-bold mb-4 px-3">{heading}</h1>
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
              videos={module.videos} // Direct videos in module
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
              course={course}
              autoExpand={
                i === expandedModuleIdx || (!playingVideoId && i === 0)
              }
              lessonRefs={lessonRefs}
              scrollToPlayingVideo={scrollToPlayingVideo}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-y-4 h-40 px-5 text-center rounded-xl shadow-lg">
            <span className="animate-pulse text-4xl">📚</span>
            <h3 className="text-lg font-semibold text-gray-400">
              No modules available
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
  videos,
  playingVideoId,
  setPlayingVideoId,
  course,
  autoExpand = false,
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
          </div>

          <div className="flex-grow w-32">
            <h1 className="text-lg font-semibold mb-1">{title}</h1>
            <p className="text-md truncate whitespace-nowrap">
              {videoCount} videos 
            </p>
            
          </div>
          <Down width={30} height={30} />
        </div>
      ) : (
        <CourseCardExpand
          title={title}
          img={img}
          submodules={submodules}
          videos={videos}
          videoCount={videoCount}
          onCollapse={handleExpand}
          playingVideoId={playingVideoId}
          setPlayingVideoId={setPlayingVideoId}
          course={course}
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
  videos,
  onCollapse,
  setPlayingVideoId,
  playingVideoId,
  course,
  lessonRefs,
  scrollToPlayingVideo,
}) => {
  const params = useSearchParams();
  const videoId = params.get("videoId");
  const [dropdownStates, setDropdownStates] = useState({});

  useEffect(() => {
    if (videoId) {
      setPlayingVideoId(videoId);
    }
  }, [videoId, setPlayingVideoId]);

  const toggleDropdown = (id) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));

    if (!dropdownStates[id]) {
      setTimeout(scrollToPlayingVideo, 200);
    }
  };

  // If module has direct videos (no submodules)
  if (videos && videos.length > 0 && (!submodules || submodules.length === 0)) {
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

        {/* Direct videos in module */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col mx-2 py-2 border-2  border-t-0 bg-[#FFFFFF14] border-[#FFFFFF24] rounded-b-2xl"
        >
          {videos.map((lesson, j) => (
            <div
              key={lesson._id}
              ref={(el) => {
                if (lesson._id && lessonRefs) {
                  lessonRefs.current[lesson._id] = el;
                }
              }}
            >
              <LessonCard
                videoId={lesson._id}
                thumbnail={lesson?.thumbnailUrl}
                locked={lesson?.lock}
                title={lesson.title}
                description={lesson.description}
                duration={`${String(lesson?.duration?.hours ?? 0).padStart(2, "0")}:${String(
                  lesson?.duration?.minutes ?? 0
                ).padStart(2, "0")}:${String(lesson?.duration?.seconds ?? 0).padStart(2, "0")}`}
                isplaying={playingVideoId === lesson?._id}
                bookmarkedId={lesson.bookmarkedId}
                bookmark={lesson.bookmark}
                introductory={lesson.introductory}
                onPlay={() => setPlayingVideoId(lesson._id)}
                allVideos={videos}
                videoIndex={j}
              />
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // If module has submodules
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
        {submodules?.map((submodule) => {
          const submoduleVideoCount = submodule?.videos?.length || 0;
          return (
            <div key={submodule._id} className="flex flex-col">
              {/* Submodule header */}
              {dropdownStates[submodule._id] ? (
                <div className="flex gap-x-2 p-3 mt-4 items-center cursor-pointer px-2 border-2 bg-[#FFFFFF25] mx-2 border-[#FFFFFF24] rounded-t-2xl">
                  <div className="rounded-lg w-[100px] h-20 relative">
                    <Image
                      src={submodule.thumbnailUrl}
                      alt="video png"
                      fill
                      style={{ borderRadius: "8px", objectFit: "cover" }}
                    />
                  </div>

                  <div className="flex-grow w-32" onClick={() => toggleDropdown(submodule._id)}>
                    <h1 className="text-md font-semibold mb-1 flex items-center gap-1">
                      {submodule.name}
                    </h1>
                    <p className="text-md text-gray-300">
                      {submoduleVideoCount} videos
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
                  </div>

                  <div className="flex-grow w-32">
                    <h1 className="text-md font-normal mb-1 flex items-center gap-1">
                      {submodule.name}
                    </h1>
                    <p className="text-[14px] truncate text-gray-400 font-bold whitespace-nowrap">
                      {submoduleVideoCount} videos
                    </p>
                  </div>
                </div>
              )}

              {/* Lessons in submodule */}
              {dropdownStates[submodule._id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-y-3 mx-2 py-2 border-2 border-t-0 bg-[#FFFFFF14] border-[#FFFFFF24] rounded-b-2xl"
                >
                  {submodule?.videos?.map((lesson, j) => (
                    <div
                      key={lesson._id}
                      ref={(el) => {
                        if (lesson._id && lessonRefs) {
                          lessonRefs.current[lesson._id] = el;
                        }
                      }}
                    >
                      <LessonCard
                        videoId={lesson._id}
                        thumbnail={lesson?.thumbnailUrl}
                        locked={lesson?.lock}
                        title={lesson.title}
                        description={lesson.description}
                        duration={`${String(lesson?.duration?.hours ?? 0).padStart(2, "0")}:${String(
                          lesson?.duration?.minutes ?? 0
                        ).padStart(2, "0")}:${String(lesson?.duration?.seconds ?? 0).padStart(2, "0")}`}
                        isplaying={playingVideoId === lesson?._id}
                        bookmarkedId={lesson.bookmarkedId}
                        bookmark={lesson.bookmark}
                        introductory={lesson.introductory}
                        onPlay={() => setPlayingVideoId(lesson._id)}
                        allVideos={submodule.videos}
                        videoIndex={j}
                        parentSubmoduleIndex={submodule._id}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CourseModuleList;