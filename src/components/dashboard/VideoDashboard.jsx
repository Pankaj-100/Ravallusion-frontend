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

const VideoDashboard = () => {
  const searchParams = useSearchParams();
  const chapterRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const videoId = searchParams.get("videoId");
  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  const { courseId, firstVideoId } = useSelector((state) => state.general);
// const [videoPlaying, setVideoPlaying] = useState(false);

  const [videoUrl, setVideoUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [showTimeStamp, setShowTimeStamp] = useState(false);
  const [delayedAccessMessage, setDelayedAccessMessage] = useState(false);
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

  // Redirect to last watched or first video if videoId not present
  useEffect(() => {
    if (!videoId) {
      if (firstVideoId) {
        router.push(`?videoId=${firstVideoId}`);
      }
      else if (latestWatchedVideo) {
        router.push(`?videoId=${latestWatchedVideo}`);
      }  
    }
  }, [videoId, latestWatchedVideo, firstVideoId, router]);

  // Reset video state when videoId changes
  useEffect(() => {
    setVideoUrl(null);
    setThumbnailUrl(null);
    setDelayedAccessMessage(false);
  }, [videoId]);

  // Load video data when available
  useEffect(() => {
    if (data?.data?.video) {
      setVideoUrl(data.data.video.videoUrl);
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

  // Show message if video fails to load after 1s
  useEffect(() => {
    if (!videoUrl && !isLoading && !courseProgressLoading) {
      const timer = setTimeout(() => setDelayedAccessMessage(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [videoUrl, isLoading, courseProgressLoading]);

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
      if (watchTime&&videoId) {

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
    // Force video player to remount when videoUrl changes
  const videoPlayerKey = videoUrl || "no-video";
  return (
    <div className="lg:mt-6 flex lg:flex-row flex-col">
      <div className="lg:mr-6 xl:mr-8 w-full lg:w-[70%]">
        <div className="h-[400px] rounded-md">
          {isLoading || courseProgressLoading ? (
            <SimpleLoader />
          ) : videoUrl ? (
            <VideoPlayer
              videoId={videoId}
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
                // setVideoPlaying={setVideoPlaying}
            />
          ) : !delayedAccessMessage ? (
            <SimpleLoader />
          ) : (
            <div className="flex items-center justify-center h-full px-4">
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
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Upgrade to Advance Plan</h2>
                <p className="text-md text-gray-600 mb-4">
                  This video is part of the <span className="font-medium text-red-500">Advanced Course</span> and isn`&apos;`t available in your current subscription.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="my-[20px] px-4 lg:px-0">
          <VideoDescription
            chapterRef={chapterRef}
            showTimeStamp={showTimeStamp}
            downloadResource={data?.data?.video?.resource}
            downloadAssignment={data?.data?.video?.assignment}
            videoId={videoId}
            title={data?.data?.video?.title}
            description={data?.data?.video?.description}
            chapters={data?.data?.timestamps}
          />
        </div>

        {/* {videoId && (
          <div className="px-4 lg:px-0">
            <Comments videoId={videoId} />
          </div>
        )} */}
      </div>

      <div className="lg:my-0 lg:w-[30%] px-4 lg:px-0 mt-8 lg:mt-0 rounded-md">
        <PlayerSidebar />
      </div>
    </div>
  );
};

export default VideoDashboard;
