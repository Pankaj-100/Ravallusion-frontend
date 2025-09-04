"use client";
import {
  Assignment,
  DownloadIcon,
  BookMark,
  Quiz,
  Bookmarked,
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

// export const chapters = [
//   { title: "Chapter 1", time: 0 },
//   { title: "Chapter 2", time: 60 },
//   { title: "Chapter 3", time: 120 },
//   { title: "Chapter 3", time: 180 },
//   { title: "Chapter 3", time: 240 },
// ];

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

        // const response = await deleteFromBookmark({ bookmarkedId }).unwrap();
        // setIsBookmarked(false);
        // setBookmarkId(null);
        // return;
      }

      const response = await addToBookmark({ videoId }).unwrap();
      toast.success(response?.message || "Video bookmarked successfully");
      setIsBookmarked(true);

      // Refetch to get the bookmark ID
      // const updatedData = await refetch();
      // const newBookmark = updatedData?.data?.bookmarks?.find(
      //   (b) => b.video._id === videoId
      // );

      // if (newBookmark?._id) {
      //   setBookmarkId(newBookmark._id);
      // }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Error while bookmarking video");
    }
    // }, [isBookmarked, bookmarkedId, videoId, addToBookmark, deleteFromBookmark, refetch]);
  }, [isBookmarked, bookmarkedId, videoId, addToBookmark]);

  const handleToggle = () => setIsExpanded(!isExpanded);

  const truncatedText =
    description?.length > 100
      ? description?.slice(0, 100) + "..."
      : description;

  const handleResource = () => {
    if (!downloadResource) {
      toast.warning("Resource not found");
      return;
    }
    const a = document.createElement("a");
    a.href = downloadResource;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleDownloadAssignment = () => {
    if (downloadAssignment) {
      const a = document.createElement("a");
      a.href = downloadAssignment;
      a.download = ""; // Optional: force download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    if (downloadResource) {
      // Delay the second download slightly
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = downloadResource;
        a.download = ""; // Optional
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 500); // 500ms delay to allow the first download to trigger
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
    <div className="text-white ms-6">
      <div className="flex justify-between mb-2">
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

      {/* <div className="mb-4">
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
      </div> */}

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

      <div className="flex gap-y-2 md:gap-y-2 md:gap-x-4 flex-col md:flex-row items-center flex-wrap">
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
        {/* <TextIconBox
          title="Download resources"
          icon={<Resources />}
          onClick={handleResource}
        /> */}
      </div>

      <CustomDialog
        open={isAssignmentOpen}
        close={() => setIsAssignmentOpen(false)}
      >
        <SubmitAssignment
          videoId={videoId}
          setIsAssignmentOpen={setIsAssignmentOpen}
        />
      </CustomDialog>
    </div>
  );
};

const TextIconBox = ({ title, icon, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    className={`bg-[#2C68F626] flex-1  flex items-center justify-center gap-x-4 rounded-[8px] px-2 py-2 h-12 w-full md:w-auto border border-[var(--neon-purple)] ${
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
