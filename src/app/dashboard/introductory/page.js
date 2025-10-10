"use client";
import SkeletonVideoCard from "@/components/dashboard/SkeletonVideoCard";
import VideoCard from "@/components/dashboard/VideoCard";
import { useGetIntroductoryQuery } from "@/store/Api/introAndBookmark";
import { setIntroductoryVideoscount } from "@/store/slice/general";
import { MonitorPlay } from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const Introductory = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetIntroductoryQuery();


  // Extract introductory videos or fallback to an empty array
  const introductoryVideos = data?.data?.introductoryVideos || [];



  // Set introductory video count in Redux when data is fetched
  useEffect(() => {
    if (introductoryVideos.length) {
      dispatch(setIntroductoryVideoscount(introductoryVideos.length));
    }
  }, [introductoryVideos.length, dispatch]);

  // Show skeleton loaders while fetching data
  if (isLoading) {
    return (
      <div className="grid grid-cols-12 gap-4 px-4 md:px-0 pt-4 md:pt-3">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <SkeletonVideoCard key={index} />
          ))}
      </div>
    );
  }

  return (
    <>
      {/* Introductory Videos List */}
      <div className="py-4 px-4 md:px-0 lg:mt-3 grid grid-cols-12 gap-4">
        {introductoryVideos.length > 0 ? (
          introductoryVideos.map((item) => (
            <VideoCard
              key={item?._id}
              type="intro"
              videoId={item?._id}
              title={item?.title}
              description={item?.description}
              thumbnailUrl={item?.thumbnailUrl}
              duration={`${String(item?.duration?.hours ?? 0).padStart(
                2,
                "0"
              )}:${String(item?.duration?.minutes ?? 0).padStart(
                2,
                "0"
              )}:${String(item?.duration?.seconds ?? 0).padStart(2, "0")}`}
            />
          ))
        ) : (
          <div className="flex justify-center items-center min-h-[60vh] col-span-12">
            <div className="flex flex-col items-center text-center justify-center gap-4 px-6 py-8 bg-[var(--card)] rounded-3xl shadow-xl border border-white/10 backdrop-blur-md">
              <div className="p-4 bg-[rgba(138,43,226,0.1)] rounded-full animate-pulse">
                <MonitorPlay className="w-16 h-16 text-red-500" />
              </div>
              <h5 className="text-2xl font-semibold text-[var(--neon-purple)]">
                No Videos Found
              </h5>
              <p className="text-sm text-gray-400 max-w-md">
                Please check back later or explore other available modules to
                begin your learning journey.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Introductory;
