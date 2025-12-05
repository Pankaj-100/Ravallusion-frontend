"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LandingContainer from "../common/LandingContainer";
import { GlowButton } from "../common/CustomButton";

const Banner = () => {
  const router = useRouter();

  const handleRegisterClick = () => {
    router.push("/enrollment-form");
  };

  return (
    <LandingContainer className="!h-fit mb-10 flex justify-center relative rounded-2xl overflow-hidden">
      {/* Background Image */}
     
      {/* Main Content */}
      <div className="flex flex-col p-10 md:flex-row gap-10 items-center justify-between w-[100%] max-w-6xl mx-auto relative z-10">
        {/* Left Image */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center rounded-2xl"
          style={{ backgroundImage: "url('/BG.png')" }}
        >
        </div>

        <div className="p-4 rounded-2xl backdrop-blur-sm flex justify-center">
          <Image
            src="/leftImage.png"
            width={500}
            height={500}
            alt="Learning illustration"
            className="w-[260px] h-[200px] md:w-[320px] md:h-[250px] xl:w-[340px] xl:h-[270px] object-contain rounded-xl"
          />
        </div>

        {/* Right Text Section */}
        <div className="flex flex-col gap-4 text-center md:text-left max-w-md">
          <h2 className="text-[28px] md:text-4xl xl:text-5xl font-bold text-white leading-snug">
            Ready to Expand your skills?
          </h2>
          <p className="text-sm md:text-base xl:text-lg text-gray-300">
            Fill out the form below and our team will reach out with course
            details and exclusive offers!
          </p>

          <GlowButton 
            onClick={handleRegisterClick}
            className="mt-4 w-fit px-10 py-8 rounded-xl text-white font-medium text-2xl"
          >
            Register now
          </GlowButton>
        </div>
      </div>
    </LandingContainer>
  );
};

export default Banner;
