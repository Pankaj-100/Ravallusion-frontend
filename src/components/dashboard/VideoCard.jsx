"use client";
import { toast } from 'react-toastify';
import { Bookmarked } from "@/lib/svg_icons";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import { setSidebarTabIndex } from  "@/store/slice/general";
import { useDeleteBookmarkMutation } from "@/store/Api/introAndBookmark";
import { useDispatch } from "react-redux";
const VideoCard = ({ isBookmarked = false, title, description, thumbnailUrl, videoId, duration,bookmarkedId,type }) => {
    const router = useRouter();
    const path = usePathname();
 const dispatch = useDispatch()
  const [deleteBookmark] = useDeleteBookmarkMutation();
    const fetchVideo = () => {
        if (!isBookmarked) {

            if(type){
      dispatch(setSidebarTabIndex(1));
           }
           else{
                dispatch(setSidebarTabIndex(0));
           }
           
            router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
        }
        else {
            const level = path.includes("beginner") ? "beginner" : "advanced";
            router.push(`/dashboard/player-dashboard/${level}?videoId=${videoId}`);
        }

    };
      const removeBookmark = async () => {
    try {
      const res = await deleteBookmark({ bookmarkedId });
      toast.success("Bookmark removed successfully");
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || "Error while removing bookmark");
    }
  };

    return (
        <motion.div
            className={`p-3 rounded-xl bg-[var(--card)] col-span-12 sm:col-span-6 ${isBookmarked ? "lg:col-span-4" : "lg:col-span-3"} h-72 cursor-pointer shadow-md`}
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Video Thumbnail */}
            <motion.div
                className="relative h-36 w-full rounded-lg mb-2"
                onClick={fetchVideo}
                whileTap={{ scale: 0.95 }}
            >
                <Image
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    sizes="100"
                    priority={true}
                    fill
                    style={{ objectFit: "cover", borderRadius: 8 }}
                />
                <span className="absolute top-2 right-2 rounded-lg px-2 py-1 video-timeline-bg text-xs text-center">
                    {duration}
                </span>
            </motion.div>

            {/* Video Details */}
            <div>
                <div className="flex justify-between mb-1">
                    <h1 className="text-lg font-medium truncate w-4/5">{title}</h1>

                    {isBookmarked && (
                        <motion.div
                            className="mx-2 mt-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >  <button onClick={removeBookmark}>
                            <Bookmarked width={18} height={18}  />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* <p className="text-xs text-gray-400 line-clamp-2">{description}</p> */}
            </div>
        </motion.div>
    );
};

export default VideoCard;
