"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

const LearnVideoCard = ({ title, description, thumbnailUrl, duration }) => {
  return (
    <motion.div
      className="p-3 rounded-xl bg-[var(--card)] col-span-12 sm:col-span-6 lg:col-span-3 h-72 cursor-pointer shadow-md"
      whileHover={{ scale: 1.05, boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", y: -10 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Video Thumbnail */}
      <motion.div
        className="relative h-44 w-full rounded-lg mb-2"
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
        <div className="mb-1">
          <h1 className="text-lg font-medium truncate">{title}</h1>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
};

export default LearnVideoCard;