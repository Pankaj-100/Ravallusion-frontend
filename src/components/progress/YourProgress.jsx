"use client";

import React, { useState } from "react";
import { Trophy, ChevronDown, Dot } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomPieChart } from "../common/CustomPieChart";
import Celebration from "./Celebration";
import CertificateForm from "./CertificateForm";
import {
  useGetCourseProgressQuery,
  useGetMyCertificateQuery,
} from "@/store/Api/courseProgress";
import { cdnDomain } from "@/lib/functions";
import { SimpleLoader } from "../common/LoadingSpinner";

function YourProgress() {
  const [openDialog, setOpenDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 👈 track dropdown state

  const { data: progressData, isLoading } = useGetCourseProgressQuery();
  const { data: certificateData, isCertficateLoading } = useGetMyCertificateQuery();

  const planName = progressData?.data?.planName;
  const totalVideos = progressData?.data?.yourProgress?.totalVideos || 0;
  const completedVideos = progressData?.data?.yourProgress?.completedVideos || 0;

  const perCompleted = totalVideos === 0 ? 0 : Math.ceil((completedVideos / totalVideos) * 100);
  const isCourseCompleted = perCompleted === 100;
  const certificate = certificateData?.data?.certificates?.[0];

  const isDataLoading = isLoading || isCertficateLoading;
  const showCelebration = isCourseCompleted && !certificate;

  const handleDownloadCertificate = () => {
    if (!certificate) {
      setOpenDialog(true);
    } else {
      const a = document.createElement("a");
      a.href = `${cdnDomain}/${certificate?.path}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger>
          <div className="flex gap-1 items-center px-1 cursor-pointer">
            <CustomPieChart percentage={perCompleted}>
              <div className="p-4">
                <Trophy className="relative z-10 w-5 h-5" />
              </div>
            </CustomPieChart>
           <div className="text-md font-semibold hidden md:block lg:hidden xl:block whitespace-nowrap">
  Your Progress
</div>
            <div>
              <ChevronDown
                size={22}
                className={`transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-black border-none mt-[0.7rem] rounded-xl !mr-[13rem]">
          {isDataLoading && (
            <div className="flex w-[25rem] h-[10rem] justify-center items-center">
              <SimpleLoader />
            </div>
          )}

          {showCelebration && <Celebration />}

          {!isDataLoading && (
            <div className="text-[#fff] px-5 pt-5 pb-3">
              <div className="flex text-lg gap-2">
                <div className="font-bold">Course Progress</div>
                <div className="self-center opacity-80">
                  <Dot />
                </div>
                <div className="opacity-80">{planName}</div>
              </div>

              <div className="mt-4 flex gap-2 items-center">
                <div>
                  <CustomPieChart percentage={perCompleted}>
                    <div className="py-4 m-8 font-semibold text-xl flex gap-[0.1rem]">
                      <div>{perCompleted}</div>
                      <div className="!text-md"> % </div>
                    </div>
                  </CustomPieChart>
                </div>

                <div className="flex flex-col">
                  <div className="font-semibold">
                    {completedVideos} of {totalVideos} complete.
                  </div>

                  {!isCourseCompleted && (
                    <div className="text-sm mt-1">
                      <div>Finish the course videos and submit assignment</div>
                      <div>to get your certificate</div>
                    </div>
                  )}

                  {isCourseCompleted && (
                    <div>
                      <div className="text-sm mt-1 break-all text-[#FFEA47]">
                        🥳 🎉 Congratulations you completed a course
                      </div>
                      <button
                        className="p-0 m-0 text-[#2C68F6] mt-2 font-medium"
                        onClick={handleDownloadCertificate}
                      >
                        Download certificate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CertificateForm open={openDialog} setOpen={setOpenDialog} />
    </>
  );
}

export default YourProgress;
