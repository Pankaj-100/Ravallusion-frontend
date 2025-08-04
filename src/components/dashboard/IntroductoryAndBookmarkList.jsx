import { mapToObject, objectToMap } from "@/lib/functions";
import { Bookmarked, Lock, OrangePlay } from "@/lib/svg_icons";
import { useDeleteBookmarkMutation } from "@/store/Api/introAndBookmark";
import {
  PremiumIcon
} from "@/lib/svg_icons";
import { setBeginnerFirstVideo } from "@/store/slice/general";
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
 isFirstSubmodule,
  iscourse=false,
  bookmarkedId,
  bookmark = false,
  introductory = false,
  onPlay,
   isFirstVideo = false,

  isLocked = false 
}) => {
  const route = useRouter();
  const [progress, setProgress] = useState(0);
  const path = usePathname();
  const [deleteBookmark] = useDeleteBookmarkMutation();
  const { courseId, updatedPercentageWatched, videoIdOfCurrentVideo } = useSelector((state) => state.general);
 const dispatch = useDispatch();
  const videos = useSelector((state) => state.course.videos);
 
  const MapVideos = objectToMap(videos);
  const currentVideoData = MapVideos.get(videoId);

  const firstEntry = MapVideos.entries().next().value;
  const currentVideoIndex = [...MapVideos.keys()].indexOf(videoId);
  const previousVideoData = [...MapVideos.values()][currentVideoIndex - 1];

  const isVideoUnlocked = firstEntry?.[0] === videoId || currentVideoData?.isCompleted || previousVideoData?.isCompleted;

  const { data: courseProgress } = useGetCourseProgressQuery(courseId);

  useEffect(() => {
    
    const foundVideo = courseProgress?.data?.courseProgress?.find(
      (video) => video.video === videoId
    );
    if (foundVideo) {
      setProgress(foundVideo?.percentageWatched);
    }
  }, []);

  useEffect(() => {
    if (updatedPercentageWatched && videoId === videoIdOfCurrentVideo) {
      setProgress(updatedPercentageWatched);
    }
  }, [updatedPercentageWatched, videoId, videoIdOfCurrentVideo]);

const fetchVideo = () => {
  // Allow access if:
  // 1. It's the first video in any submodule (isFirstVideo)
  // 2. OR it's in the first submodule of a module (handled by parent)
  // 3. OR it's an introductory/bookmark video
  // 4. OR it's unlocked through normal progression
  if (!isFirstVideo && (isLocked || (!isVideoUnlocked && !introductory && !bookmark))) return;
  
  if (introductory) {
    route.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
    onPlay();
    return;
  }

  
   const levels = level==1 ? "beginner" : "advanced";
    dispatch(setBeginnerFirstVideo(isFirstSubmodule));
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
  <div className="flex gap-x-3 items-center cursor-pointer px-3">
      <div
        className={`rounded-t-xl rounded-b-lg w-36 h-20 relative ${(!isFirstVideo && (isLocked || (!isVideoUnlocked && !introductory && !bookmark))) ? "brightness-30 cursor-not-allowed" : ""
          }`}
        onClick={fetchVideo}
      >
        {(!isFirstVideo && (isLocked || (!isVideoUnlocked && !introductory && !bookmark))) && (
          <div className='z-50 absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] h-full flex items-center justify-center backdrop-blur-sm bg-[#0000001F] w-full'>
            <Lock width={30} height={30} />
            {level===2 ? <div className="absolute top-2 left-2 rounded-full p-1 z-100">
              <PremiumIcon />
        
        </div>:""}
          </div>
        )}

        <Image
          src={thumbnail}
          alt="video"
          fill
          className={`rounded-t-xl rounded-b-lg ${isplaying && "brightness-50"}`}
        />

      
           {level===2 ? <div className="absolute top-2 left-2 rounded-full p-1 z-100">
              <PremiumIcon />
        
        </div>:""}
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

      <div className="flex-grow w-32">
        <h1 className="text-xs font-normal mb-1 truncate whitespace-nowrap">
          {isplaying ? (
            <span className="text-sm font-medium text-[var(--yellow)]">Opening file</span>
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

