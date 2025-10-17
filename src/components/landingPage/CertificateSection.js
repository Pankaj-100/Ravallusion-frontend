"use client";
import React from "react";
import LandingContainer from "../common/LandingContainer";
import { CheckIcon } from "@/lib/svg_icons";
import Image from "next/image";


const CertificateSection = ({ certificate }) => {
  return (
    <LandingContainer className="!h-fit pt-12 sm:pt-[7.5rem] !flex !flex-row justify-center">
      <div className="flex gap-28 items-center w-full flex-wrap">

        <div className="p-5 py-[20px] rounded-2xl certificate backdrop-blur-xl">
          <Image
            src={certificate?.image} 
            width={1000}
            height={1000}
            alt="certificate"
            className="w-[326px] h-[230px] md:w-[450px] md:h-[300px] xl:w-[30rem] 2xl:w-[30rem] xl:h-[20rem] 2xl:h-[20rem] rounded-xl "
          />
        </div>


        <div className="flex flex-col gap-4">
          <div className="text-[34px] md:text-5xl xl:text-6xl font-bold">
            {certificate?.caption}
          </div>
          {certificate?.key_points.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 text-xs xl:text-base"
            >
              <CheckIcon />
              {point}.
            </div>
          ))}
        </div>

      </div>
    </LandingContainer>
  );
};

export default CertificateSection;
