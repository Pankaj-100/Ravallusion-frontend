"use client";

import Card from "./Card";
import { CheckIcon, ClockIcon, VideoIcon } from "@/lib/svg_icons";
import { motion, useAnimation, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const ModuleCard = ({ index, item, progress, range, targetScale, isFirst, inView }) => {
  const scale = useTransform(progress, range, [1, targetScale]);
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  const isMountedRef = useRef(false);
  
  // Initialize animation on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Reset animation state when component mounts or item changes
    setHasAnimated(false);
    
    // Set initial visible state immediately
    controls.set({
      y: 0,
      opacity: 1
    });
    
    return () => {
      isMountedRef.current = false;
    };
  }, [item._id, controls]);

  useEffect(() => {
    // Only run animation if component is mounted, is first card, in view, and hasn't animated yet
    if (isMountedRef.current && isFirst && inView && !hasAnimated) {
      // Start from slightly below for animation effect
      controls.set({
        y: 30,
        opacity: 0
      });

      // Animate to final position
      controls.start({
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: "easeOut",
          delay: 0.1 // Small delay to ensure smooth animation
        }
      }).then(() => {
        if (isMountedRef.current) {
          setHasAnimated(true);
        }
      });
    }
  }, [isFirst, inView, controls, hasAnimated]);

  return (
    <div 
      className={`cardContainer px-5 md:px-[4%] lg:px-[8%] ${
        isFirst ? "mt-[95%] md:mt-[42%] lg:mt-[30%] xl:mt-[20%] top-[6rem] 2xl:top-[12rem]" : "top-[6rem]"
      } 2xl:top-[12rem]`}
      key={`module-container-${item._id || index}`}
    >
      <motion.div
        className="card"
        style={{ 
          scale: scale, 
          top: `calc(${
            typeof window !== 'undefined' && window.innerWidth > 625 
              ? index * 25 
              : index * 10
          }px)` 
        }}
        // Always start with opacity 1 to prevent invisible state on reload
        initial={{ opacity: 1, y: 0 }}
        // Use controls for animation, but fallback to visible state
        animate={isFirst && hasAnimated === false ? controls : { opacity: 1, y: 0 }}
        // Add a key to force re-render on reload
        key={`module-card-${item._id || index}-${Date.now()}`}
      >
        <Card className="!h-fit gap-7 flex md:!flex-row justify-between py-7 px-4 md:p-[60px] 2xl:p-[70px] items-start flex-wrap md:flex-nowrap">
          <div className="text-2xl md:text-[35px] 2xl:text-[2.5rem] min-w-[53%] md:font-bold">
            {item.name}
          </div>
          <div className="flex-grow text-xs 2xl:text-sm flex flex-col gap-[30px]">
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-xl lg:text-2xl 2xl:text-[2rem] font-bold">
                {item.description}
              </h1>
              <div className="flex items-center gap-4 py-2 px-3 text-[var(--light-gray)] bg-[var(--light-black)] rounded-lg">
                <div className="flex items-center gap-1">
                  <VideoIcon />
                  <span>{item.videos || "12"} videos</span>
                </div>
                <span className="border-[1px] self-stretch"> </span>
                <div className="flex items-center gap-1">
                  <ClockIcon />
                  <span>{item.time || "4.5 hours"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {item.key_points && item.key_points.length > 0 ? (
                item.key_points.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3 font-extralight">
                    <CheckIcon />
                    <span>{point}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No key points available</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const ModulesList = ({ scrollYProgress, modules, inView }) => {
  // Handle both array and undefined modules
  const modulesList = modules && modules.length > 0 ? modules : [];

  if (modulesList.length === 0) {
    return (
      <div className="px-5 md:px-[4%] lg:px-[8%] py-20 text-center">
        <p className="text-white/60 text-lg">No modules available</p>
      </div>
    );
  }

  return modulesList.map((item, index) => {
    const targetScale = 1 - (modulesList.length - index) * 0.02;
    return (
      <ModuleCard
        key={`module-${item._id || index}-${Date.now()}`} 
        item={item}
        index={index}
        progress={scrollYProgress}
        range={[index * 0.25, 1]}
        targetScale={targetScale}
        isFirst={index === 0}
        inView={inView}
      />
    );
  });
};

export default ModulesList;