"use client";

import { SimpleLoader } from "@/components/common/LoadingSpinner";
import Comments from "@/components/dashboard/Comments";
import PlayerSidebar from "@/components/dashboard/PlayerSidebar";
import VideoDescription from "@/components/dashboard/VideoDescription";
import VideoPlayer from "@/components/dashboard/VideoPlayer";
import { useGetVideoQuery } from "@/store/Api/introAndBookmark";
import {
  useGetCourseProgressQuery,
  useUpdateVideoProgressMutation,
} from "@/store/Api/videoProgress";
import { useGetCourseProgressQuery as useGetOverallCourseProgressQuery } from "@/store/Api/courseProgress";

import {
  setUpdatedPercentageWatched,
  setVideoIdOfcurrentVideo,
  setVideoTitle,
} from "@/store/slice/general";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVideos, updateVideo } from "@/store/slice/course";
import { useGetSubscriptionDetailQuery } from "@/store/Api/course";
import { Premium } from "@/lib/svg_icons";

const VideoDashboard = () => {
  const searchParams = useSearchParams();
  const chapterRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
const { refetch: refetchOverallProgress } = useGetOverallCourseProgressQuery();

  const videoId = searchParams.get("videoId");
  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  const isLocked = useSelector((state) => state.general.isLocked);
  const { courseId, firstVideoId, videoLevel } = useSelector(
    (state) => state.general
  );

  const { data: plantype } = useGetSubscriptionDetailQuery();
  const planType = plantype?.data?.subscriptionDetails?.planType;

  const [videoUrl, setVideoUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [forward, setForward] = useState(null);

  const [showTimeStamp, setShowTimeStamp] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [status, setStatus] = useState(true);

  const {
    data: courseProgress,
    isLoading: courseProgressLoading,
    refetch: refetchCourseProgress,
  } = useGetCourseProgressQuery(courseId, {
    skip: !courseId,
  });
  console.log(courseProgress)

  useEffect(() => {
    if (videoId && courseId) {
      refetchCourseProgress(); // ✅ Ensures latest progress on video change
    }
  }, [videoId]);

  const latestWatchedVideo =
    courseProgress?.data?.courseProgress?.[0]?.video ?? null;

  const { data, isLoading } = useGetVideoQuery(videoId, {
    skip: !videoId,
  });

  // Redirect to last watched or first video if videoId not present
  useEffect(() => {
    if (!videoId) {
      if (firstVideoId) {
        router.push(`?videoId=${firstVideoId}`);
      } else if (latestWatchedVideo) {
        router.push(`?videoId=${latestWatchedVideo}`);
      }
    }
  }, [videoId, latestWatchedVideo, firstVideoId, router]);

  // Load video data when available
  useEffect(() => {
    if (data?.data?.video) {
      setVideoUrl(data.data.video.videoUrl);
      setForward(data.data.video.disableForward);
      setThumbnailUrl(data.data.video.thumbnailUrl);
    }
  }, [data]);

  // Update global state with course/video data
  useEffect(() => {
    if (courseProgress) {
      dispatch(setVideos(courseProgress?.data?.courseProgress));
    }
    if (data?.data?.video?.title) {
      dispatch(setVideoTitle(data.data.video.title));
    }
  }, [courseProgress, data, dispatch]);

  // Update status when sidebar tab changes
  useEffect(() => {
    if (videoId) {
      setStatus(sidebarTabIndex !== 1);
    }
  }, [videoId, sidebarTabIndex]);

  // ⏱ Update progress every 10s (stable interval + latest value via ref)
  const [updateProgress] = useUpdateVideoProgressMutation();

  const watchTimeRef = useRef(0);
  useEffect(() => {
    watchTimeRef.current = watchTime; // always keep the latest value
  }, [watchTime]);

  const flushProgress = React.useCallback(async () => {
    const wt = Math.floor(watchTimeRef.current || 0);
    if (!videoId || wt <= 0) return;
    try {
      const res = await updateProgress({ id: videoId, watchTime: wt }).unwrap();
      dispatch(setUpdatedPercentageWatched(res?.videoProgress?.percentageWatched));
      dispatch(setVideoIdOfcurrentVideo(videoId));
      dispatch(updateVideo(res.videoProgress));

   
   
    } catch (e) {
      console.error("Error updating progress:", e);
    }
  }, [videoId, updateProgress, dispatch]);

  useEffect(() => {
    if (!videoId) return;

    const id = setInterval(() => {
      flushProgress(); // sends latest watchTime every 10s
    }, 10000);

    // also send one final update when switching videos/unmounting
    return () => {
      clearInterval(id);
      flushProgress();
    };
  }, [videoId, flushProgress]);

  useEffect(() => {
    if (courseProgress) {
      dispatch(setVideos(courseProgress?.data?.courseProgress));
    }
    if (data) {
      dispatch(setVideoTitle(data?.data?.video?.title));
    }
  }, [courseProgress, data]);

  useEffect(() => {
    setIsCompleted(false);
    const foundVideo = courseProgress?.data?.courseProgress?.find(
      (v) => v.video === videoId
    );
    if (foundVideo?.isCompleted !== undefined) {
      setIsCompleted(foundVideo.isCompleted);
    }
  }, [courseProgress, videoId]);
  useEffect(() => {
  if (isCompleted) {
    refetchOverallProgress();
  }
}, [isCompleted, refetchOverallProgress]);

  const handleUpgrade = () => {
    router.push('/Upgrade-plan');
  };

  // Force video player to remount when videoUrl changes
  const videoPlayerKey = videoUrl || "no-video";

  return (
    <div className=" flex lg:flex-row flex-col ">
      <div className="  w-full aspect-video  lg:ms-12">
        <div className="relative w-full aspect-video  bg-black rounded-xl ">   
          {isLoading || courseProgressLoading ? (
            // ⏳ While fetching course/video data
            <SimpleLoader />
          ) : planType === "Beginner" && videoLevel === 2 ? (
            // 🚫 Upgrade plan message (higher priority) - Updated design
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div 
                className="relative rounded-[16px] border border-transparent w-full max-w-md"
                style={{
                  background: 
                    "linear-gradient(0deg, #192029, #192029), " +
                    "linear-gradient(291.43deg, rgba(0,0,0,0) 45.59%, rgba(133,116,246,0.35) 96.1%)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  boxShadow:
                    "inset 2px 4px 11.9px 0px rgba(255,255,255,0.10), " +
                    "inset -4px -2px 10.1px 0px rgba(255,255,255,0.10)",
                  backdropFilter: "blur(25.2px)",
                }}
              >
                {/* Border gradient overlay */}
                <div
                  className="absolute inset-0 rounded-[16px] p-px -z-10"
                  style={{
                    background: "linear-gradient(92.36deg, rgba(255,255,255,0.25) 2.51%, rgba(255,255,255,0) 48.45%)",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                  }}
                />
                
                {/* Content container */}
                <div className="p-[30px] relative z-10">
                  {/* Content */}
                  <div className="flex flex-col gap-[30px]">
                      <div className="flex-shrink-0 mt-1">
                        <Premium />
                      </div>
                    {/* Heading section */}
                    <div className="flex items-start gap-4">
                    
                      <div>
                        <h3 className="text-[24px] leading-[32px] font-semibold text-white tracking-[-0.01em]">
                          Upgrade your subscription plan
                        </h3>
                        <p className="text-[14px] leading-[20px] text-white/70 mt-1.5">
               This is applicable only for beginner plan users
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={handleUpgrade}
                      className="w-full h-14 rounded-xl font-semibold text-white text-[16px] relative overflow-hidden"
                      style={{
                        background: "linear-gradient(90deg, #6E6CF6 0%, #9A8CF6 100%)",
                        boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.25)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Upgrade plan
                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isLocked ? (
            // 🚫 Locked video message
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-yellow-300 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-4">
                  <svg
                    className="w-14 h-14 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Video Locked
                </h2>
                <p className="text-md text-gray-600 mb-4">
                  Please{" "}
                  <span className="font-medium text-yellow-600">
                    watch the previous video
                  </span>{" "}
                  to unlock this one.
                </p>
              </div>
            </div>
          ) : videoUrl ? (
            // 🎥 Play video when available
            <VideoPlayer
              videoId={videoId || firstVideoId}
              key={videoPlayerKey}
              courseProgress={courseProgress}
              source={videoUrl}
              poster={thumbnailUrl}
              forward={forward}
              setWatchTime={setWatchTime}
              watchTime={watchTime}
              setShowTimeStamp={setShowTimeStamp}
              showTimeStamp={showTimeStamp}
              chapterRef={chapterRef}
              chapters={data?.data?.timestamps}
              iscourse={status}
              isCompleted={isCompleted}
              setIsCompleted={setIsCompleted}
            />
          ) : (
            <></>
          )}
        </div>

        <div className=" lg:px-0 ">
          <VideoDescription
            chapterRef={chapterRef}
            showTimeStamp={showTimeStamp}
            downloadResource={data?.data?.video?.resource}
            downloadAssignment={data?.data?.video?.assignment}
            videoId={videoId}
            title={data?.data?.video?.title}
            description={data?.data?.video?.description}
            chapters={data?.data?.timestamps}
            isCompleted={isCompleted}
            setIsCompleted={setIsCompleted}
          />
        </div>
      </div>

      <div className=" lg:w-[55%]  px-4 lg:px-0 lg:mt-0 rounded-md xl:me-12 lg:ms-4 ">
        <PlayerSidebar />
      </div>
    </div>
  );
};

export default VideoDashboard;