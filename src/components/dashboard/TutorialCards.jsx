'use client';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useDispatch } from "react-redux";
import { setSidebarTabIndex } from "@/store/slice/general";

const TutorialCards = ({ title, subItems, courseId, isEnrolled }) => {
    const carouselRef = useRef(null);
    const router = useRouter();
    const [showNavigation, setShowNavigation] = useState(false);
    
    // Calculate if we should show navigation buttons
    useEffect(() => {
        // Show navigation if there are more than 4 items
        setShowNavigation(subItems && subItems.length > 4);
    }, [subItems]);

    const scroll = (direction) => {
        const { current } = carouselRef;
        if (!current) return;
        const scrollAmount = current.offsetWidth / 1.2; 
        direction === 'left' ? current.scrollBy({ left: -scrollAmount, behavior: 'smooth' }) : current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const handleEnrollClick = () => {
        // Navigate to cart with courseId as URL parameter
        router.push(`/mycart?courseId=${courseId}`);
    };

    return (
        <div className='py-2 px-3 bg-[var(--card)] relative'>
            <div className='p-4 flex justify-between items-center'>
                <div className='flex items-center justify-between w-full'>
                    <h1 className='text-lg font-semibold'>{title}</h1>
                    {!isEnrolled && (
                        <button 
                            onClick={handleEnrollClick}
                            className="text-sm b text-white px-3 py-1 rounded border-2 border-[var(--neon-purple)] transition-colors"
                        >
                            Enroll Now
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Buttons - Only show when there are more than 4 videos */}
            {showNavigation && (
                <>
                    <button 
                        onClick={() => scroll('left')} 
                        className='absolute top-[50%] left-1 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white hidden md:block'
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        onClick={() => scroll('right')} 
                        className='absolute top-[50%] right-1 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white hidden md:block'
                    >
                        <ChevronRight size={18} />
                    </button>
                </>
            )}

            {/* Carousel */}
            <div
                ref={carouselRef}
                className='flex overflow-x-auto h-60 ms-1 space-x-9 md:px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth'
            >
                {subItems?.length > 0 ? 
                    subItems.map((items, index) => (
                        <div key={items._id || items.id || index} className='flex-shrink-0 w-[340px] h-[200px] mt-8 snap-center my-4 '>
                            <VideoCard
                                videoId={items._id || items.id}
                                img={items.thumbnailUrl || items.thumbnail}
                                heading={items.title}
                                level={items.level}
                                description={items.description}
                                duration={`${String(items.duration?.hours ?? 0).padStart(2, "0")}:${String(items.duration?.minutes ?? 0).padStart(2, "0")}:${String(items.duration?.seconds ?? 0).padStart(2, "0")}`}
                                courseId={courseId}
                                isEnrolled={isEnrolled}
                            />
                        </div>
                    ))
                : 
                    <div className="flex-shrink-0 w-full h-[200px] flex items-center justify-center">
                        <p className="text-gray-400">No videos available</p>
                    </div>
                }
            </div>
        </div>
    );
};

// VideoCard component remains the same
const VideoCard = ({ img, heading, description, duration, videoId, level, courseId, isEnrolled }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    
    const fetchVideo = () => {
        if (!isEnrolled) {
            // If not enrolled, navigate to cart page with courseId
            router.push(`/mycart?courseId=${courseId}`);
            return;
        }
        
        // If enrolled, navigate to player dashboard with course ID and video ID
        if (courseId) {
            dispatch(setSidebarTabIndex(0));
            router.push(`/dashboard/player-dashboard/${courseId}?videoId=${videoId}`);
        } 
    };

    return (
        <motion.div
            whileHover={{ scale: isEnrolled ? 1.05 : 1, boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", y: isEnrolled ? -10 : 0 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`bg-black-300 rounded-lg overflow-hidden ${isEnrolled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
            <motion.div 
                onClick={fetchVideo}
                whileTap={{ scale: isEnrolled ? 0.95 : 1 }}
                className='relative h-[160px]'
            >
                <Image 
                    src={img || "/placeholder-thumbnail.jpg"} 
                    alt='video thumbnail' 
                    fill 
                    style={{ objectFit: "cover" }} 
                    className={!isEnrolled ? 'opacity-60' : ''}
                />
                <span className='absolute top-2 right-2 rounded-lg px-3 py-1 video-timeline-bg text-xs text-white'>
                    {duration}
                </span>
                
                {/* Lock icon overlay for not-enrolled videos */}
                {!isEnrolled && (
                    <>
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/70 rounded-full p-3">
                                <Lock size={24} className="text-white" />
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            <div className='p-2'>
                <div className="flex items-start gap-2">
                    {!isEnrolled && (
                        <Lock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                        <h1 className={`text-sm font-semibold line-clamp-2 ${!isEnrolled ? 'text-gray-400' : ''}`}>
                            {heading}
                        </h1>
                        <p className={`text-xs font-medium line-clamp-2 ${!isEnrolled ? 'text-gray-500' : 'text-gray-300'}`}>
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TutorialCards;