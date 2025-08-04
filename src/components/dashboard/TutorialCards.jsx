'use client';
import Image from 'next/image';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TutorialCards = ({ title, subItems }) => {
    const carouselRef = useRef(null);

    const scroll = (direction) => {
        const { current } = carouselRef;
        if (!current) return;
        const scrollAmount = current.offsetWidth / 1.2; 
        direction === 'left' ? current.scrollBy({ left: -scrollAmount, behavior: 'smooth' }) : current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className='py-2 px-3 bg-[var(--card)] relative'>
            <div className='p-4'>
                <h1 className='text-lg font-semibold '>{title}</h1>
            </div>

            {/* Navigation Buttons */}
            <button onClick={() => scroll('left')} className='absolute top-[50%] left-1 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white hidden md:block'>
                <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className='absolute top-[50%] right-1 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white hidden md:block'>
                <ChevronRight size={18} />
            </button>

            {/* Carousel */}
            <div
                ref={carouselRef}
                className='flex overflow-x-auto h-60  ms-1 space-x-9  md:px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth'
            >
                {subItems.length > 0 && subItems.map((items) => (
                    <div key={items._id} className='flex-shrink-0 w-[300px] h-[180px] snap-center my-4 mx-auto'>
                        <VideoCard
                            videoId={items._id}
                            img={items.thumbnailUrl}
                            heading={items.title}
                            level={items.level}
                            description={items.description}
                            duration={`${String(items.duration.hours ?? 0).padStart(2, "0")}:${String(items.duration.minutes ?? 0).padStart(2, "0")}:${String(items.duration.seconds ?? 0).padStart(2, "0")}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const VideoCard = ({ img, heading, description, duration, videoId ,level}) => {
    const router = useRouter();
    const path = usePathname();

    const fetchVideo = () => {
if(level==1){
     router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
}
if(level==2){
     router.push(`/dashboard/player-dashboard/advance?videoId=${videoId}`);
}
       
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className='bg-black-300 cursor-pointer rounded-lg overflow-hidden'
        >
            <motion.div onClick={fetchVideo}
                whileTap={{ scale: 0.95 }}
                className='relative h-[130px]'>
                <Image src={img} alt='video thumbnail' fill style={{ objectFit: "cover" }} />
                <span className='absolute top-2 right-2 rounded-lg px-3 py-1 video-timeline-bg text-xs text-white'>{duration}</span>
            </motion.div>

            <div className='p-2'>
                <h1 className='text-sm font-semibold line-clamp-2'>{heading}</h1>
                <p className='text-xs text-gray-300 font-medium line-clamp-2'>{description}</p>
            </div>
        </motion.div>
    );
};

export default TutorialCards;
