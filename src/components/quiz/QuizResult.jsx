"use client";
import React from "react";
import {  Check, X, RotateCcw } from "lucide-react";
import {
  Trophy,
  Backarrow,
  Bluedot,
  Time,
  Attempt,
  QuestionCorrect,
  QuestionWrong,
  Question
} from "@/lib/svg_icons";

const QuizResult = ({
  score,
  totalQuestions,
  timeSpent,
  attemptsLeft,
  onRetry,
  onBackToCourse,
  fullscreenExited,
  resultData,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const correctAnswers = resultData?.result?.[0]?.correctAnswers || score;
  const wrongAnswers = resultData?.result?.[0]?.wrongAnswers || (totalQuestions - score);
  const attemptedQuestions = resultData?.result?.[0]?.attemptedQuestions || score;
  const finalPercentage = resultData?.result?.[0]?.percentage || percentage;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-gradient-to-br from-[#202738] to-[#0F1521] w-[705px] border border-[#FFFFFF1F] rounded-[28px] flex flex-col  p-10 gap-12 "
      >
        <div className="flex justify-between">
          <div>
            {/* Trophy Icon */}
            <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center shadow-lg">
              <img src="/trop.png" alt="" />
            </div>

            {/* Title */}
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-semibold text-white ">Quiz Completed  </h1>
              <p className="text-md text-[#C0CFFB] "> Keep Practicing! All The Best.   </p>
            </div>
          </div>
          <div>
            {/* Score Section */}
            <div className="flex flex-col items-center" style={{ gap: "16px" }}>
              <p className="text-[16px] text-[#C0CFFB]">Your Score</p>
              <div className="text-[48px] font-bold text-white leading-none">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className={`text-[14px] px-3 py-1 rounded-lg font-medium ${
                finalPercentage >= 70 
                  ? "text-[#00C851] bg-[#00C8511A]" 
                  : "text-[#F6552C] bg-[#F6552C1A]"
              }`}>
                {finalPercentage}% {finalPercentage >= 70 ? "Passed" : "Failed"}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex items-center justify-between bg-[#FFFFFF0F]/5 rounded-xl w-full p-4 border border-[#FFFFFF1F]">
            <div className="text-[#2C68F6] text-2xl mb-1"><QuestionCorrect/></div>
            <div className="flex-col justify-end">
              <p className="text-sm text-[#FFFFFFCC]">Correct</p>
              <p className="text-2xl font-semibold ms-9">{correctAnswers}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-[#FFFFFF0F]/5 rounded-xl w-full p-4 border border-[#FFFFFF1F]">
            <div className="text-[#F9D13E] text-2xl mb-1"><QuestionWrong/></div>
            <div className="flex-col justify-end">
              <p className="text-sm text-[#FFFFFFCC]">Incorrect</p>
              <p className="text-2xl font-semibold ms-9">{wrongAnswers}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-[#FFFFFF0F]/5 rounded-xl w-full p-4 border border-[#FFFFFF1F]">
            <div className="text-yellow-500 text-2xl mb-1"><Attempt/></div>
            <div className="flex-col justify-end">
              <p className="text-sm text-[#FFFFFFCC]">Attempts Left</p>
              <p className="text-2xl font-semibold ms-10">{attemptsLeft}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-4 w-full justify-end mt-6">
          <button
            onClick={onBackToCourse}
            className="px-8 py-4 rounded-2xl bg-[#1A2234] text-white text-[16px] font-medium hover:bg-[#222B3C] transition-colors border border-[#FFFFFF1F]"
          >
            Back to course
          </button>
          <button
            onClick={onRetry}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6A5AE0] to-[#8A7DFF] text-white text-[16px] font-medium hover:opacity-90 transition-opacity"
          >
            Retry quiz
          </button>
        </div>

        {/* Fullscreen Warning */}
        {fullscreenExited && (
          <div className="text-center mt-4">
            <p className="text-[12px] text-[#F6552C]">
              Test was submitted automatically due to exiting fullscreen mode
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResult;