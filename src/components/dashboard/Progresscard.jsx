"use client";
import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Dot } from "lucide-react";


import { CustomPieChart } from "../common/CustomPieChart";
import Celebration from "../progress/Celebration";
import CertificateForm from "../progress/CertificateForm";
import {
  useGetCourseProgressQuery,
  useGetMyCertificateQuery,
} from "@/store/Api/courseProgress";
import { cdnDomain } from "@/lib/functions";
import LoadingSpinner, { SimpleLoader } from "../common/LoadingSpinner";

function Progresscard() {
  const [openDialog, setOpenDialog] = useState(false);

 const { data: progressData, isLoading } = useGetCourseProgressQuery();

 console.log(progressData)

  const { data: certificateData, isCertficateLoading } =
    useGetMyCertificateQuery();

  // const planName = progressData?.data?.planName;
  const totalVideos = progressData?.data?.yourProgress.totalVideos;
  const completedVideos = progressData?.data?.yourProgress.completedVideos;

  const perCompleted = Math.ceil((completedVideos / totalVideos) * 100);
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
     
    
     

        <div className="bg-[#040C19] border-none mt-[0.7rem] rounded-xl mx-3">
          {isDataLoading && (
            <div className="flex w-[25rem] h-[10rem] justify-center items-center">
              <SimpleLoader />
            </div>
          )}

          {showCelebration && <Celebration />}

          {!isDataLoading && (
            <div className="text-[#fff] px-5 py-1 pb-3 ">
           

              <div className="mt-4 flex gap-2 items-center">
         

                <div className="flex flex-col">
                  <div className="font-semibold text-lg">
                    {completedVideos} of {totalVideos} complete.
                  </div>
                  {!isCourseCompleted && (
                    <div className="text-md mt-1">
                      <div>Finish the course
                      to get your certificate</div>
                    </div>
                  )}
                  {false && <Celebration />}
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
        </div>
      

      <CertificateForm open={openDialog} setOpen={setOpenDialog} />
    </>
  );
}

export default Progresscard;
