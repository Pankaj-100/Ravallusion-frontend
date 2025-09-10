"use client";

import React, { useState } from "react";
import { Trophy, Dot } from "lucide-react";
import { CustomPieChart } from "../common/CustomPieChart";
import Celebration from "../progress/Celebration";
import CertificateForm from "../progress/CertificateForm";
import {
  useGetCourseProgressQuery,
  useGetMyCertificateQuery,
} from "@/store/Api/courseProgress";
import { cdnDomain } from "@/lib/functions";
import { SimpleLoader } from "../common/LoadingSpinner";

function MyLearning() {
  const [openDialog, setOpenDialog] = useState(false);

  const { data: progressData, isLoading } = useGetCourseProgressQuery();
  const { data: certificateData, isLoading: isCertficateLoading } =
    useGetMyCertificateQuery();

  const planName = progressData?.data?.planName;
  const totalVideos = progressData?.data?.yourProgress?.totalVideos || 0;
  const completedVideos =
    progressData?.data?.yourProgress?.completedVideos || 0;

  const perCompleted =
    totalVideos === 0 ? 0 : Math.ceil((completedVideos / totalVideos) * 100);

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
    <div className=" rounded-xl p-5 text-white w-full max-w-[50rem] ">
      {isDataLoading && (
        <div className="flex w-full h-[10rem] justify-center items-center">
          <SimpleLoader />
        </div>
      )}

      {showCelebration && <Celebration />}

      {!isDataLoading && (
        <>
          <div className="flex items-center gap-2 text-lg mb-4">
            {/* <CustomPieChart percentage={perCompleted}>
              <div className="p-4">
                <Trophy className="relative z-10 w-5 h-5" />
              </div>
            </CustomPieChart> */}
            <div className="font-bold">Course Progress</div>
            <Dot className="opacity-80" />
            <div className="opacity-80">{planName}</div>
          </div>

          <div className="mt-2 flex gap-4 items-center py-5 bg-[#181F2B] rounded-xl"> 

            <CustomPieChart percentage={perCompleted}>
              <div className="py-4 m-8 font-semibold text-xl flex gap-[0.1rem]">
                <div>{perCompleted}</div>
                <div className="!text-md"> % </div>
              </div>
            </CustomPieChart>

            <div className="flex flex-col">
              <div className="font-semibold">
                {completedVideos} of {totalVideos} complete.
              </div>

              {!isCourseCompleted && (
                <div className="text-sm mt-1">
                  <div>Finish the course to get your certificate </div>
                  
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
        </>
      )}

      <CertificateForm open={openDialog} setOpen={setOpenDialog} />
    </div>
  );
}

export default MyLearning;
