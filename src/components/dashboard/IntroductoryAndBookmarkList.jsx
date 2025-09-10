  "use client";
  import { mapToObject, objectToMap } from "@/lib/functions";
  import { Bookmarked, Lock, OrangePlay } from "@/lib/svg_icons";
  import { useDeleteBookmarkMutation } from "@/store/Api/introAndBookmark";
  import {
    PremiumIcon
  } from "@/lib/svg_icons";
  import { setIsLocked ,setVideoLevel} from "@/store/slice/general";
  import {
    useGetCourseProgressQuery,
    useGetVideoProgressQuery,
  } from "@/store/Api/videoProgress";
  import { MessageSquareWarning } from "lucide-react";
  import Image from "next/image";
  import { usePathname, useRouter, useSearchParams } from "next/navigation";
  import { useEffect, useState } from "react";
  import { useSelector } from "react-redux";
  import { useDispatch } from 'react-redux';
  export const IntroductoryList = ({
    heading,
    subItems,
    setPlayingVideoId,
    playingVideoId,
    iscourse=false,
  }) => {
    const params = useSearchParams();
    const videoId = params.get("videoId");

    useEffect(() => {
      if (videoId) {
        setPlayingVideoId(videoId);
      }
    }, [videoId]);
    return (
      <>
        <h1 className="text-lg font-semibold mb-7 px-3">{heading}</h1>

        <div className="flex flex-col gap-y-7">
          {subItems &&
            subItems.map((items) => (
              <LessonCard
                key={items._id}
                introductory={true}
                videoId={items._id}
                isplaying={playingVideoId === items?._id}
                onPlay={() => setPlayingVideoId(items?._id)}
                thumbnail={items.thumbnailUrl}
                title={items.title}
                duration={`${String(items?.duration?.hours ?? 0).padStart(
                  2,
                  "0"
                )}:${String(items?.duration?.minutes ?? 0).padStart(
                  2,
                  "0"
                )}:${String(items?.duration?.seconds ?? 0).padStart(2, "0")}`}
                description={items.description}
              />
            ))}
        </div>
      </>
    );
  };

  export const BookmarkedList = ({
    heading,
    subItems,
    setPlayingVideoId,
    playingVideoId,
  }) => {
    const params = useSearchParams();
    const videoId = params.get("videoId");

    useEffect(() => {
      if (videoId) {
        setPlayingVideoId(videoId);
      }
    }, [videoId]);
    return (
      <>
        <h1 className="text-lg font-semibold mb-7 px-3">{heading}</h1>

        <div className="flex flex-col gap-y-7">
          {subItems.length > 0 ? (
            subItems.map((items) => {
              const timeDuration = items?.video?.duration;
              return (
                <LessonCard
                  key={items?.video?._id}
                  bookmark={true}
                  bookmarkedId={items?._id}
                  videoId={items?.video?._id}
                  thumbnail={items?.video?.thumbnailUrl}
                  title={items?.video?.title}
                  duration={`${String(timeDuration?.hours ?? 0).padStart(
                    2,
                    "0"
                  )}:${String(timeDuration?.minutes ?? 0).padStart(
                    2,
                    "0"
                  )}:${String(timeDuration?.seconds ?? 0).padStart(2, "0")}`}
                  description={items?.video?.description}
                  isplaying={playingVideoId === items?.video?._id}
                  onPlay={(iscourse) => setPlayingVideoId(items?.video?._id)}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center rounded-xl shadow-lg">
              <MessageSquareWarning className="text-red-500 w-16 h-16 mb-4 animate-pulse" />
              <h5 className="text-lg font-semibold text-[var(--neon-purple)] mb-2">
                No Bookmarked Videos Found 📚
              </h5>
              <p className="text-sm text-gray-400 max-w-xs">
                It looks like you haven&apos;t bookmarked any videos yet. Start exploring and add your favorites for quick access!
              </p>
            </div>

          )}
        </div>
      </>
    );
  };

export const LessonCard = ({
  videoId,
  thumbnail,
  title,
  description,
  duration,
  isplaying,
  level,
  bookmarkedId,
  bookmark = false,
  introductory = false,
  onPlay,
  allVideos = [],       
  videoIndex = 0,       
  allSubmodules = [],   
  parentSubmoduleIndex,   
  locked,
}) => {
  const route = useRouter();
  const path = usePathname();
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);

  const [deleteBookmark] = useDeleteBookmarkMutation();
  const { courseId, updatedPercentageWatched, videoIdOfCurrentVideo } =
    useSelector((state) => state.general);

  const { data: courseProgress, refetch } = useGetCourseProgressQuery(courseId);

  // ✅ Current video progress
  const currentVideoProgress = courseProgress?.data?.courseProgress?.find(
    (v) => v.video === videoId
  );

  // 🔑 Find previous video (inside same submodule OR last of previous submodule)
  let prevVideo = null;

  if (videoIndex > 0) {
    // same submodule
    prevVideo = allVideos[videoIndex - 1];
  } else if (parentSubmoduleIndex > 0) {
    // first in submodule → take last video of previous submodule
    const prevSub = allSubmodules[parentSubmoduleIndex - 1];
    if (prevSub?.videos?.length > 0) {
      prevVideo = prevSub.videos[prevSub.videos.length - 1];
    }
  }

  const prevVideoProgress = prevVideo
    ? courseProgress?.data?.courseProgress?.find((v) => v.video === prevVideo._id)
    : null;

  // ✅ Completion checks
  const isCurrentVideoCompleted =
    currentVideoProgress?.isCompleted ||
    (videoId === videoIdOfCurrentVideo && updatedPercentageWatched === 100);

  const isPrevVideoCompleted =
    prevVideoProgress?.isCompleted ||
    (prevVideo &&
      prevVideo._id === videoIdOfCurrentVideo &&
      updatedPercentageWatched === 100);

  // ✅ Unlock logic
  const isVideoUnlocked =
    introductory ||
    bookmark ||
    locked === false ||
    isCurrentVideoCompleted ||
    isPrevVideoCompleted;

  useEffect(() => {
    if (isplaying) {
      dispatch(setIsLocked(!isVideoUnlocked));
      dispatch(setVideoLevel(level));
    }
  }, [isVideoUnlocked, isplaying, dispatch]);

  // ✅ Update progress bar
  useEffect(() => {
    if (currentVideoProgress) {
      setProgress(currentVideoProgress?.percentageWatched || 0);
    }
  }, [currentVideoProgress]);

  useEffect(() => {
    if (updatedPercentageWatched && videoId === videoIdOfCurrentVideo) {
      setProgress(updatedPercentageWatched);
    }
    refetch();
  }, [updatedPercentageWatched, videoId, videoIdOfCurrentVideo]);

  const fetchVideo = () => {
    if (!isVideoUnlocked && !introductory && !bookmark) return;

    if (introductory) {
      route.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
      onPlay();
      return;
    }

    const levels = level == 1 ? "beginner" : "advanced";
    route.push(`/dashboard/player-dashboard/${levels}?videoId=${videoId}`);
    onPlay();
  };

  const removeBookmark = async () => {
    try {
      const res = await deleteBookmark({ bookmarkedId });
      toast(res.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || "Error while removing bookmark");
    }
  };

  return (
    <div
      className="flex gap-x-3 items-center cursor-pointer px-3 "
      onClick={fetchVideo}
    >
      {/* Thumbnail + Lock */}
      <div
        className={`rounded-t-xl rounded-b-lg w-36 h-20 relative ${
          !isVideoUnlocked && !introductory && !bookmark
            ? "brightness-30 cursor-not-allowed"
            : ""
        }`}
      >
        {!isVideoUnlocked && !introductory && !bookmark && (
          <div className="z-50 absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] h-full flex items-center justify-center backdrop-blur-sm bg-[#0000001F] w-full">
            <Lock width={30} height={30} />
            {level === 2 && (
              <div className="absolute top-2 left-2 rounded-full p-1 z-100">
                <PremiumIcon />
              </div>
            )}
          </div>
        )}

        <Image
          src={thumbnail}
          alt="video"
          fill
          className={`rounded-t-xl rounded-b-lg ${isplaying && "brightness-50"}`}
        />

        {level === 2 && (
          <div className="absolute top-2 left-2 rounded-full p-1 z-100">
            <PremiumIcon />
          </div>
        )}
        <span
          style={{
            background: "rgba(0, 0, 0, 0.50)",
            backdropFilter: "blur(5.4px)",
          }}
          className="px-1 py-[2px] text-[10px] absolute top-2 right-2 rounded-sm"
        >
          {duration || "00:00:00"}
        </span>

        {isplaying && (
          <span className="absolute font-semibold text-[var(--yellow)] text-[10px] bottom-2 left-1 flex gap-x-1 items-center">
            <OrangePlay /> Now Playing
          </span>
        )}

        <div className="absolute rounded-t-xl z-50 bottom-0 w-full h-[6px] bg-gray-300 rounded-full mt-1 overflow-hidden">
          <div
            className="h-full bg-[var(--yellow)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Title + Description */}
      <div className="flex-grow w-32">
        <h1 className="text-md font-normal mb-1 ">
          {isplaying ? (
            <span className="text-md font-normal text-[var(--yellow)]">
              {title}
            </span>
          ) : (
            title
          )}
        </h1>
        <p className="text-[10px] truncate whitespace-nowrap">
          {isplaying ? "" : description}
        </p>
      </div>

      {bookmark && (
        <button onClick={removeBookmark}>
          <Bookmarked width="16" height="16" />
        </button>
      )}
    </div>
  );
};
