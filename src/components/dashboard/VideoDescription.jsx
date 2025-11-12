"use client";
import {
  Assignment,
  DownloadIcon,
  BookMark,
  Quiz,
  Bookmarked,
  QuizIcon,
  Resources,
} from "@/lib/svg_icons";
import React, { useEffect, useState, useCallback, useRef } from "react";
import SubmitAssignment from "./SubmitAssignment";
import CustomDialog from "../common/CustomDialog";
import {
  useAddBookmarkMutation,
  useGetBookmarkQuery,
} from "@/store/Api/introAndBookmark";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Instruction from "../quiz/Instruction";
import { useCheckEligibilityQuery } from "@/store/Api/quizApi";

const VideoDescription = ({
  videoId,
  title,
  description,
  downloadResource,
  downloadAssignment,
  showTimeStamp,
  chapterRef,
  isCompleted,
  chapters,
}) => {
  const chapterSection = useRef(null);
  const [addToBookmark] = useAddBookmarkMutation();
  const { data: getdata, refetch } = useGetBookmarkQuery();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedId, setBookmarkId] = useState(null);
  const { submoduleId } = useSelector((state) => state.general);
  const [isClient, setIsClient] = useState(null);

  // Quiz eligibility check - remove skip condition to always start the query
  const {
    data: eligibilityData,
    isLoading: eligibilityLoading,
    error: eligibilityError,
    refetch: refetchEligibility
  } = useCheckEligibilityQuery(videoId, {
    // Remove the skip condition to always start the query
    // This prevents the "Cannot refetch a query that has not been started yet" error
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (showTimeStamp && chapterSection.current) {
      chapterSection.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showTimeStamp]);

  useEffect(() => {
    if (getdata?.bookmarks) {
      const bookmark = getdata.bookmarks.find((b) => b.video._id === videoId);
      if (bookmark) {
        setIsBookmarked(true);
        setBookmarkId(bookmark._id);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    }
  }, [getdata, videoId]);

  const handleBookmark = useCallback(async () => {
    try {
      if (isBookmarked) {
        if (!bookmarkedId) {
          toast.error("bookmarkId is undefined");
          return;
        }
      }

      const response = await addToBookmark({ videoId }).unwrap();
      toast.success(response?.message || "Video bookmarked successfully");
      setIsBookmarked(true);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Error while bookmarking video");
    }
  }, [isBookmarked, bookmarkedId, videoId, addToBookmark]);

  const handleToggle = () => setIsExpanded(!isExpanded);

  const truncatedText =
    description?.length > 100
      ? description?.slice(0, 100) + "..."
      : description;

  const handleQuiz = () => {
    setIsQuizOpen(true);
    // Refetch eligibility when opening quiz dialog
    if (videoId) {
      // Add a small delay to ensure the query is properly initialized
      setTimeout(() => {
        refetchEligibility();
      }, 100);
    }
  };

  const handleDownloadAssignment = () => {
    if (downloadAssignment) {
      const a = document.createElement("a");
      a.href = downloadAssignment;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    if (downloadResource) {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = downloadResource;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 500);
    }
  };

  const handleSeek = (time) => {
    if (chapterRef.current) {
      chapterRef.current.seekTo(time, "seconds");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  if (!isClient) return null;

  return (
    <div className="text-white ms-1">
      <div className="flex justify-between mt-2 mb-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        {title && !isBookmarked && (
          <div
            className="p-2 rounded-full sm:bg-[#181F2B] cursor-pointer  me-3"
            onClick={handleBookmark}
          >
            {!isBookmarked && <BookMark />}
          </div>
        )}
      </div>

      <div className="flex gap-y-2 md:gap-y-2 md:gap-x-4 flex-col md:flex-row items-center ">
        <TextIconBox
          title="Submit assignment"
          icon={<Assignment />}
          onClick={() => {
            if (isCompleted) {
              setIsAssignmentOpen(true);
            }
          }}
          disabled={!isCompleted}
        />
        <TextIconBox
          title="Download assets"
          icon={<DownloadIcon />}
          onClick={handleDownloadAssignment}
        />
        <TextIconBox
          title="Attend Quiz"
          icon={<QuizIcon />}
          onClick={handleQuiz}
        />
      </div>

      <div className="mt-2">
        <p className="text-sm">
          {isExpanded ? description : truncatedText}
          {description?.length > 100 && (
            <span
              onClick={handleToggle}
              className="text-[var(--yellow)] cursor-pointer font-semibold"
            >
              {isExpanded ? " Read less" : " Read more"}
            </span>
          )}
        </p>
      </div>

      {showTimeStamp && chapters?.length > 0 && (
        <div className="mb-1" ref={chapterSection}>
          <h3 className="text-xl font-bold mb-2">Chapters</h3>
          <ul>
            {chapters.map((ch, i) => (
              <li key={i} style={{ cursor: "pointer" }}>
                <div>
                  <span
                    className="text-[var(--neon-purple)]"
                    onClick={() => handleSeek(ch.time)}
                  >
                    {formatTime(ch.time)}
                  </span>{" "}
                  - {ch.title}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CustomDialog
        open={isAssignmentOpen}
        close={() => setIsAssignmentOpen(false)}
      >
        <SubmitAssignment
          videoId={videoId}
          setIsAssignmentOpen={setIsAssignmentOpen}
        />
      </CustomDialog>

      <CustomDialog open={isQuizOpen} close={() => setIsQuizOpen(false)}>
        <Instruction 
          close={() => setIsQuizOpen(false)}
          eligibilityData={eligibilityData}
          eligibilityLoading={eligibilityLoading}
          eligibilityError={eligibilityError}
          videoId={videoId}
        />
      </CustomDialog>
    </div>
  );
};

const TextIconBox = ({ title, icon, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    className={`bg-[#2C68F626] flex-1  flex items-center justify-center gap-x-4 rounded-[8px] px-2 py-2 h-10 w-full md:w-auto border border-[var(--neon-purple)] ${
      disabled
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer hover:bg-[#2C68F640]"
    }`}
  >
    <h1 className="text-sm font-semibold">{title}</h1>
    {icon}
  </div>
);

export default VideoDescription;