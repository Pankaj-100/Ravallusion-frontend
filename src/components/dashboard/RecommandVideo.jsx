"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { PremiumIcon, Premium } from "@/lib/svg_icons";
import {
  useGetSubscribedPlanCourseQuery,
  useGetRecommendedVideosQuery,
} from "@/store/Api/course";
import { useGetPlanDataQuery } from "@/store/Api/home";
import CustomDialog from "../common/CustomDialog";

const RecommandVideo = () => {
  const [beginnerPlanId, setBeginnerPlanId] = useState(null);
  const [beginnerCourseId, setBeginnerCourseId] = useState(null);
  const router = useRouter();

  const { data: plansData } = useGetPlanDataQuery();
  const { data: beginnerCourseData } = useGetSubscribedPlanCourseQuery(
    beginnerPlanId,
    { skip: !beginnerPlanId }
  );

  useEffect(() => {
    if (plansData?.data?.plans) {
      const beginnerPlan = plansData.data.plans.find((plan) => plan.level === 1);
      setBeginnerPlanId(beginnerPlan?._id || null);
    }
  }, [plansData]);

  useEffect(() => {
    if (beginnerCourseData?.data?.course) {
      setBeginnerCourseId(beginnerCourseData.data.course._id);
    }
  }, [beginnerCourseData]);

  const { data: recommendedVideosData, isLoading: recommendedLoading } =
    useGetRecommendedVideosQuery(beginnerCourseId, { skip: !beginnerCourseId });

  const formatDuration = (duration) => {
    if (!duration) return "00:00";
    const hours = duration.hours?.toString().padStart(2, "0") || "00";
    const minutes = duration.minutes?.toString().padStart(2, "0") || "00";
    const seconds = duration.seconds?.toString().padStart(2, "0") || "00";
    return `${hours}:${minutes}:${seconds}`;
  };

  const videos = recommendedVideosData?.data?.videos || [];

  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleVideoClick = (video) => {
    setUpgradeOpen(true);
  };

  const handleUpgrade = () => {
    setUpgradeOpen(false);
    router.push('/Upgrade-plan');
  };

  // Show nothing when loading or no videos
  if (recommendedLoading || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold mb-4 px-3">
        VFX videos you might also like
      </h1>

      <div className="flex flex-col gap-y-4 px-3">
        {videos.map((item) => {
          const video = item.video;
          return (
            <div
              key={item._id}
              className="flex items-center gap-x-3 cursor-pointer"
              onClick={() => handleVideoClick(video)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleVideoClick(video);
              }}
            >
              <div className="relative w-32 h-16  rounded-lg overflow-hidden">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover rounded-lg"
                />
                <span
                  className="absolute top-2 right-2 text-[10px] px-1 py-[2px] rounded-sm text-white"
                  style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}
                >
                  {formatDuration(video.duration)}
                </span>
                <div className="absolute top-2 left-2">
                  <PremiumIcon />
                </div>
              </div>

              <div className="flex-grow">
                <h2 className="text-sm font-medium leading-tight">{video.title}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade modal — exact Figma design */}
      <CustomDialog open={upgradeOpen} close={() => setUpgradeOpen(false)}>
        <div className="flex items-center justify-center p-4">
          <div
            className="relative bg-[#192029] rounded-[16px] border border-transparent"
            style={{
              width: "425px",
              maxWidth: "90vw",
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
              {/* Close button */}
              <button
                aria-label="Close"
                onClick={() => setUpgradeOpen(false)}
                className="absolute top-[18px] right-[18px] w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/90">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex flex-col gap-[30px]">
                {/* Heading section */}
                     <div className="flex-shrink-0 mt-1">
                    <Premium />
                  </div>
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

                {/* CTA Button - Fixed navigation */}
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
      </CustomDialog>
    </div>
  );
};

export default RecommandVideo;