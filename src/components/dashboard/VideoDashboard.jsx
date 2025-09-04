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

const VideoDashboard = () => {
  const searchParams = useSearchParams();
  const chapterRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const videoId = searchParams.get("videoId");
  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  const isLocked = useSelector((state) => state.general.isLocked);
  const { courseId, firstVideoId, videoLevel } = useSelector(
    (state) => state.general
  );

  const { data: plantype } = useGetSubscriptionDetailQuery();
  const planType = plantype?.data?.subscriptionDetails?.planType;

  console.log("planType", planType);
  console.log("videoLevel", videoLevel);

  const [videoUrl, setVideoUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
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
  console.log("Fetched video data:", data);

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
      console.log("Video URL:", data.data.video.videoUrl);
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

  // Update progress every 2s
  const [updateProgress] = useUpdateVideoProgressMutation();
  useEffect(() => {
    const progressUpdate = async () => {
      if (watchTime && videoId) {
        const res = await updateProgress({ id: videoId, watchTime }).unwrap();
        dispatch(
          setUpdatedPercentageWatched(res?.videoProgress?.percentageWatched)
        );
        dispatch(setVideoIdOfcurrentVideo(videoId));
        dispatch(updateVideo(res.videoProgress));
      }
    };
    progressUpdate();
  }, [watchTime]);

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

  // Force video player to remount when videoUrl changes
  const videoPlayerKey = videoUrl || "no-video";

  return (
    <div className="lg:mt-2 flex lg:flex-row flex-col ">
      <div className="lg:mr-4 xl:mr-4 w-full lg:w-[50%] lg:ms-10">
        <div className="xl:min-h-[420px] lg:min-h-[420px] md:min-h-[420px]  rounded-md w-full lg:ms-6 bg-black flex items-center justify-center relative">
       {isLoading || courseProgressLoading ? (
  // ⏳ While fetching course/video data
  <SimpleLoader />
) : planType === "Beginner" && videoLevel === 2 ? (
  // 🚫 Upgrade plan message (higher priority)
  <div className="absolute inset-0 flex items-center justify-center px-4">
    <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-red-200 text-center animate-in fade-in zoom-in duration-300">
      <div className="flex justify-center mb-4">
        <svg
          className="w-14 h-14 text-red-500"
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
        Upgrade to Advance Plan
      </h2>
      <p className="text-md text-gray-600 mb-4">
        This video is part of the{" "}
        <span className="font-medium text-red-500">Advanced Course</span>{" "}
        and isn&apos;t available in your current subscription.
      </p>
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
    setWatchTime={setWatchTime}
    watchTime={watchTime}
    setShowTimeStamp={setShowTimeStamp}
    showTimeStamp={showTimeStamp}
    chapterRef={chapterRef}
    chapters={data?.data?.timestamps}
    iscourse={status}
    isCompleted={isCompleted}
  />
) : (
  <></>
)}

        </div>

        <div className="my-[10px] px-4 lg:px-0">
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
          />
        </div>
      </div>

      <div className="lg:my-0 lg:w-[33%] px-4 lg:px-0 mt-8 lg:mt-0 rounded-md lg:ms-[90px]">
        <PlayerSidebar />
      </div>
    </div>
  );
};

export default VideoDashboard;
