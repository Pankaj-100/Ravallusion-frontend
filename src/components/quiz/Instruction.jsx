"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Backarrow,
  Bluedot,
  Time,
  Attempt,
  Question
} from "@/lib/svg_icons";
import { useGetQuizQuery } from "@/store/Api/quizApi";

const Instruction = ({ 
  close, 
  eligibilityData, 
  eligibilityLoading, 
  eligibilityError,
  videoId 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get quiz details
  const { 
    data: quizData, 
    isLoading: quizLoading, 
    error: quizError 
  } = useGetQuizQuery(videoId, {
    skip: !videoId || !eligibilityData?.eligibility,
  });

  const handleStartQuiz = () => {
    if (eligibilityData?.success && eligibilityData.eligibility) {
      router.push(`/dashboard/player-dashboard/beginner/quiz?videoId=${videoId}`);
    } else {
      alert("You are not eligible to take this quiz or no attempts remaining.");
    }
  };

  // Use actual quiz data from API
  const quizInfo = {
    title: quizData?.quiz?.title || "Quiz",
    course: "Premiere Pro", 
    module: "Module 1",
    totalQuestions: quizData?.quiz?.questions || 0,
    duration: quizData?.quiz?.duration || 15,
    maxAttempts: quizData?.quiz?.attempt || 3,
  };

  if (eligibilityLoading || quizLoading) {
    return (
      <div className="bg-[#181F2B] text-white rounded-2xl min-w-[705px] mx-auto py-4 px-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2">Loading quiz information...</span>
        </div>
      </div>
    );
  }

  if (eligibilityError || quizError || !eligibilityData?.success) {
    return (
      <div className="bg-[#181F2B] text-white rounded-2xl min-w-[705px] mx-auto py-4 px-6">
        <div className="text-center py-8">
          <p className="text-red-400">QUIZ NOT FOUND</p>
          <button 
            onClick={close}
            className="mt-4 px-4 py-2 bg-red-600 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!eligibilityData.eligibility) {
    return (
      <div className="bg-[#181F2B] text-white rounded-2xl min-w-[705px] mx-auto py-4 px-6">
        <div className="text-center py-8">
          <p className="text-yellow-400">You are not eligible to take this quiz</p>
          <p className="text-gray-400 mt-2">
            {eligibilityData.message || "No attempts remaining or quiz not available"}
          </p>
          <button 
            onClick={close}
            className="mt-4 px-4 py-2 bg-gray-600 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#181F2B] text-white rounded-2xl min-w-[705px] mx-auto py-4 px-6">
      {/* Header */}
      <button
        onClick={close}
        className="text-gray-400 hover:text-white text-lg"
      >
        <Backarrow/>
      </button>
      
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl md:text-2xl font-semibold mx-auto">{quizInfo.title}</h2>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#C0CFFB] mx-auto">
          {quizInfo.course} &nbsp; • <span className="text-[#F9D13E]"> &nbsp; {quizInfo.module}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center justify-between bg-[#FFFFFF0F]/5 rounded-xl w-full p-4 border border-[#FFFFFF1F]">
          <div className="text-[#2C68F6] text-2xl mb-1"><Question/></div>
          <div>
            <p className="text-sm text-[#FFFFFFCC]">Questions</p>
            <p className="text-2xl font-semibold ms-10">{quizInfo.totalQuestions}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-[#FFFFFF0F]/5 rounded-xl w-full p-4 border border-[#FFFFFF1F]">
          <div className="text-[#F9D13E] text-2xl mb-1"><Time/></div>
          <div>
            <p className="text-sm text-[#FFFFFFCC] ms-10">Duration</p>
            <p className="text-2xl font-semibold">{quizInfo.duration} Mins</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-[#FFFFFF0F]/5 rounded-xl w-full p-4 border border-[#FFFFFF1F]">
          <div className="text-[#F6552C] text-2xl mb-1"><Attempt/></div>
          <div>
            <p className="text-sm text-[#FFFFFFCC]">Attempts</p>
            <p className="text-2xl font-semibold ms-10">{eligibilityData.remainingAttempts}</p>
          </div>
        </div>
      </div>

      {/* Question Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Question Overview</h3>
        <div className="rounded-xl w-full p-4 border border-[#FFFFFF1F]">
          <p className="text-sm text-[#FFFFFFCC] mb-3">{quizInfo.totalQuestions} Questions</p>
          <div className="flex gap-2 flex-wrap">
            {[...Array(quizInfo.totalQuestions)].map((_, i) => (
              <div
                key={i}
                className="bg-[#FFFFFF0F] text-gray-300 text-center px-4 py-3 text-sm font-medium hover:bg-[#2C68F6] hover:text-white cursor-pointer transition"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Instructions */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-1">Quiz Instruction</h3>
        <div className="rounded-xl w-full p-2 border border-[#FFFFFF1F]">
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <span className="text-[#2C68F6] text-2xl leading-none">•</span>
              <span>This quiz contains <span className="font-semibold text-white">{quizInfo.totalQuestions} questions</span> to complete.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#2C68F6] text-2xl leading-none">•</span>
              <span>You will have <span className="font-semibold text-white">{quizInfo.duration} minutes</span> to finish the quiz.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#2C68F6] text-2xl leading-none">•</span>
              <span>You can skip questions and return to them later using the question navigator.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#2C68F6] text-2xl leading-none">•</span>
              <span>Once you quit or time expires, it will count as <span className="font-semibold text-white">one attempt</span>.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#2C68F6] text-2xl leading-none">•</span>
              <span>You have <span className="font-semibold text-white">{eligibilityData.remainingAttempts} attempt(s)</span> remaining.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={close}
          className="px-5 py-2.5 rounded-lg bg-[#1A2234] hover:bg-[#222B3C] transition font-medium"
        >
          Cancel
        </button>
        <button 
          onClick={handleStartQuiz}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#6A5AE0] to-[#8A7DFF] hover:opacity-90 transition font-medium"
        >
          Start quiz
        </button>
      </div>
    </div>
  );
};

export default Instruction;