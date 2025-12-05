"use client";

import { useState } from "react";
import StaticHeader from "@/components/landingPage/StaticHeader";
import SkeletonVideoCard from "@/components/dashboard/SkeletonVideoCard";
import VideoCard from "@/components/dashboard/VideoCard";
import CustomDialog from "@/components/common/CustomDialog";
import { useGetIntroductoryQuery } from "@/store/Api/introAndBookmark";
import { MonitorPlay } from "lucide-react";
import { CrossIcon } from "@/lib/svg_icons";
import VideoPlayer from "@/components/dashboard/VideoPlayer";
import LearnVideoCard from "@/components/dashboard/LearnVideoCard";

const list = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Learn Properly",
    link: "/learn-properly",
  },
];

const LearnVideo = ({ videoUrl, thumbnailUrl, setIsCustomOpen }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full flex items-center justify-center border-2 border-gray-500 backdrop-blur-lg rounded-xl overflow-hidden mt-10">
        <button
          className="flex items-center justify-center outline-none absolute top-2 right-2 z-50 rounded-full border border-gray-300"
          onClick={(e) => {
            setIsCustomOpen((prev) => !prev);
            e.stopPropagation();
          }}
        >
          <CrossIcon width={24} height={24} />
        </button>
        <div className="min-w-[350px] md:w-full lg:h-[450px] md:h-[400px] relative">
          <VideoPlayer
            source={videoUrl}
            poster={thumbnailUrl}
            latestVideo={true}
            iscourse={false}
          />
        </div>
      </div>
    </div>
  );
};

const LearnProperlypage = () => {
  const { data, isLoading } = useGetIntroductoryQuery();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Extract introductory videos or fallback to an empty array
  const introductoryVideos = data?.data?.introductoryVideos || [];

  const heading = "Learn Properly";
  const subHeading = <></>;

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsCustomOpen(true);
  };

  // Show skeleton loaders while fetching data
  if (isLoading) {
    return (
      <>
        <StaticHeader list={list} heading={heading} subHeading={subHeading} />
        <div className="grid grid-cols-12 gap-4 px-4 md:px-0 pt-4 md:pt-3">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <SkeletonVideoCard key={index} />
            ))}
        </div>
      </>
    );
  }

  return (
    <>
      <StaticHeader list={list} heading={heading} subHeading={subHeading} />

      {/* Introductory Videos List */}
      <div className="py-2 mb-40 lg:mt-3 grid grid-cols-3 gap-6 px-20">
        {introductoryVideos.length > 0 ? (
          introductoryVideos.map((item) => (
            <div
              key={item?._id}
              onClick={() => handleVideoClick(item)}
              className="cursor-pointer"
            >
              <LearnVideoCard
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
            </div>
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

      <CustomDialog
        open={isCustomOpen}
        close={() => setIsCustomOpen((prev) => !prev)}
        variant="latest-video"
      >
        {selectedVideo && (
          <LearnVideo
            videoUrl={selectedVideo?.videoUrl}
            thumbnailUrl={selectedVideo?.thumbnailUrl}
            setIsCustomOpen={setIsCustomOpen}
            isCustomOpen={isCustomOpen}
          />
        )}
      </CustomDialog>
    </>
  );
};

export default LearnProperlypage;
