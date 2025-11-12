"use client";
import React from "react";

const QuizQuit = ({ onConfirm, onCancel, answeredCount, totalQuestions }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[#181F2B]/90 border border-[#FFFFFF1F] rounded-[28px] flex flex-col items-center justify-center"
        style={{
          width: '557px',
          height: '269px',
          padding: '30px',
          gap: '30px',
        }}
      >
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white leading-tight">
            Are you sure<br />
            you want to quit?
          </h2>
        </div>

        {/* Description */}
        <p className="text-[14px] text-[#C0CFFB] text-center leading-normal">
          If you quit now, this will count as one attempt. You have answered {answeredCount} out of {totalQuestions} questions.
        </p>

        {/* Buttons */}
        <div 
          className="flex gap-[30px] w-full"
          style={{ gap: '30px' }}
        >
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg bg-[#1A2234] text-white text-[14px] font-medium hover:bg-[#222B3C] transition-colors duration-200 border border-[#FFFFFF1F]"
          >
            Continue quiz
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#D94004] to-[#D94004] text-white text-[14px] font-medium hover:opacity-90 transition-opacity duration-200"
          >
            Quit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuit;