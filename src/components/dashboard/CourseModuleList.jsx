import Image from "next/image";
import { useEffect, useState } from "react";
import { CrossIcon, MinusIcon } from "@/lib/svg_icons";
import { LessonCard } from "./IntroductoryAndBookmarkList";
import { motion } from 'framer-motion';
import Link from "next/link";
import { CustomButton } from "../common/CustomButton";
import { useSearchParams } from "next/navigation";
import CourseSkeletonLoader from "./CourseSkeletonLoader";
import { useGetCourseProgressQuery } from "@/store/Api/courseProgress";

const CourseModuleList = ({ course, playingVideoId, setPlayingVideoId, isLoading }) => {
  const modules = course?.modules;
  const { data: progressData } = useGetCourseProgressQuery();
  const planName = progressData?.data?.planName;
  const heading = course?.title || "Course";

  return (
    <>
      <h1 className='text-lg font-semibold mb-7 px-3'>{heading}</h1>

      <div className='flex flex-col gap-y-7'>
        {isLoading ? (
          <CourseSkeletonLoader />
        ) : modules && modules.length > 0 ? (
          modules.map((items, i) => (
            <CourseCard
              key={i}
              title={items.name}
              img={items.thumbnailUrl}
              videoCount={items.videoCount || 0}
              submodules={items.submodules}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
              course={course}
              planName={planName}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-y-4 h-40 px-5 text-center rounded-xl shadow-lg">
            <span className="animate-pulse text-4xl">😢</span>
            <h3 className="text-lg font-semibold text-red-500">Plan not Found</h3>
            <p className="text-sm text-gray-400">
              You don&apos;t have access to this course. Please purchase a valid plan to continue.
            </p>
            <Link href="/subscription-plan">
              <CustomButton className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-400 px-5 py-2 rounded-lg text-white font-semibold">
                Buy a Plan
              </CustomButton>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

const CourseCard = ({ title, img, videoCount, submodules, playingVideoId, setPlayingVideoId, course, planName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
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
            <span
              style={{
                background: "rgba(0, 0, 0, 0.50)",
                backdropFilter: "blur(5.4px)",
              }}
              className="px-1 py-[2px] text-[10px] absolute top-2 right-2 rounded-sm"
            >
              {videoCount} videos
            </span>
          </div>

          <div className="flex-grow w-32">
            <h1 className="text-xs font-normal mb-1">{title}</h1>
            <p className="text-[10px] truncate whitespace-nowrap">
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
  planName
}) => {
  const params = useSearchParams();
  const videoId = params.get("videoId");
  const [dropdownStates, setDropdownStates] = useState({});

  useEffect(() => {
    if (videoId) {
      setPlayingVideoId(videoId);
    }
  }, [videoId]);

  const toggleDropdown = (index) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const isLocked = planName === "Beginner" && course?.title === "Advanced";

  return (
    <div className="flex flex-col gap-y-2">
      {/* module heading */}
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
          <h1 className="text-xs font-semibold mb-1">{title}</h1>
          <p className="text-xs">{videoCount} videos</p>
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
        {submodules?.map((item) => (
          <div key={item._id} className="flex flex-col">
            {dropdownStates[item._id] ? (
              <div className="flex gap-x-2 my-4 items-center cursor-pointer px-2 pb-2 border-b border-gray-700">
                <div className="rounded-lg w-14 h-10 relative">
                  <Image
                    src={item.thumbnailUrl}
                    alt="video png"
                    fill
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                </div>

                <div className="flex-grow w-32">
                  <h1 className="text-xs font-semibold mb-1">{item.name}</h1>
                  <p className="text-xs text-gray-300 ">{item.videoCount || 0} videos</p>
                </div>

                <button onClick={() => toggleDropdown(item._id)} className="text-xs text-red-500 underline ml-auto">
                  <MinusIcon />
                </button>
              </div>
            ) : (
              <div
                className="flex gap-x-3 px-3 items-center cursor-pointer my-3"
                onClick={() => toggleDropdown(item._id)}
              >
                <div className="bg-blue-400 rounded-xl w-40 h-20 relative">
                  <Image
                    src={item.thumbnailUrl}
                    alt="video png"
                    fill
                    style={{ borderRadius: "12px", objectFit: "cover" }}
                  />
                  <span
                    style={{
                      background: "rgba(0, 0, 0, 0.50)",
                      backdropFilter: "blur(5.4px)",
                    }}
                    className="px-1 py-[2px] text-[10px] absolute top-2 right-2 rounded-sm"
                  >
                    {item.videoCount || 0} videos
                  </span>
                </div>

                <div className="flex-grow w-32">
                  <h1 className="text-xs font-normal mb-1">{item.name}</h1>
                  <p className="text-[10px] truncate whitespace-nowrap">{item.videoCount || 0} videos</p>
                </div>
              </div>
            )}

            {dropdownStates[item._id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-y-3"
              >
                {item?.videos?.map((lesson, j) => (
                  <LessonCard
                    key={j}
                    isplaying={playingVideoId === lesson?._id}
                    onPlay={() => {
                      if (isLocked) return;
                      setPlayingVideoId(lesson._id);
                    }}
                    videoId={lesson._id}
                    title={lesson.title || "I am Title"}
                    thumbnail={lesson?.thumbnailUrl}
                    duration={`${String(lesson?.duration?.hours ?? 0).padStart(2, "0")}:${String(lesson?.duration?.minutes ?? 0).padStart(2, "0")}:${String(lesson?.duration?.seconds ?? 0).padStart(2, "0")}`}
                    isLocked={isLocked} // optional, if LessonCard shows lock visually
                  />
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CourseModuleList;
