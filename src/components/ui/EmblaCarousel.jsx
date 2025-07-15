"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { NextButton, PrevButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";
import VideoPlayer from "../dashboard/VideoPlayer";
import Autoplay from "embla-carousel-autoplay";
import CustomPlayButton from "./customPlay";

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number, min, max) =>
  Math.min(Math.max(number, min), max);

const CarouselCard = ({ item, isActive, videoRefs, index, onPlayChange }) => {
 
  useEffect(() => {
    const videoRef = videoRefs.current[index];
    if (!videoRef) return;

    if (!isActive) {
      
      if (videoRef.pause) videoRef.pause();
      if (videoRef.seekTo) videoRef.seekTo(0); 
    } else {
     
      if (videoRef.pause) videoRef.pause();
    }
  }, [isActive, index]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full h-fit self-center">
        <div className="p-3 carousel-bg h-96">
          <VideoPlayer
            source={item.video.videoUrl}
            poster={item.video.thumbnailUrl}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            autoPlay={false} 
            iscourse={false}
            onPlayChange={onPlayChange}  
            playIcon={<CustomPlayButton />}
          />
        </div>
      </div>
    </div>
  );
};

const EmblaCarousel = ({ slides, options }) => {
  const autoplay = useRef(
    Autoplay(
      { delay: 6000, stopOnInteraction: false }, 
      (emblaRoot) => emblaRoot.parentElement
    )
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { ...options, loop: true },
    [autoplay.current]
  );
  const tweenFactor = useRef(0);
  const tweenNodes = useRef([]);
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize videoRefs with the correct length
  useEffect(() => {
    videoRefs.current = Array(slides.length).fill(null);
  }, [slides?.length]);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi) => {
    tweenNodes.current = emblaApi.slideNodes().map(slideNode =>
      slideNode.querySelector(".embla__slide__number")
    );
  }, []);

  const setTweenFactor = useCallback((emblaApi) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback((emblaApi, eventName) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = eventName === "scroll";

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            const sign = Math.sign(target);

            if (slideIndex === loopItem.index && target !== 0) {
              diffToTarget = sign === -1 ? scrollSnap - (1 + scrollProgress) : scrollSnap + (1 - scrollProgress);
            }
          });
        }

        const tweenValue = 1.4 - Math.abs(diffToTarget * tweenFactor.current);
        const scale = numberWithinRange(tweenValue, 0, 2).toString();
        const tweenNode = tweenNodes.current[slideIndex];
        tweenNode.style.transform = `scale(${scale})`;
      });
    });
  }, []);

  const handleVideoPlayChange = useCallback((isPlaying) => {
    if (!emblaApi || !autoplay.current) return;

    if (isPlaying) {
      autoplay.current.stop();     // Stop carousel autoplay
    } else {
      autoplay.current.reset();    // Resume carousel autoplay
    }
  }, [emblaApi]);

  const handleSlideChange = useCallback((emblaApi) => {
    if (!emblaApi) return;

    const currentIndex = emblaApi.selectedScrollSnap();
    setActiveIndex(currentIndex);

    // Ensure the new active video is paused at start
    const currentVideoRef = videoRefs.current[currentIndex];
    if (currentVideoRef) {
      if (currentVideoRef.pause) currentVideoRef.pause();
      if (currentVideoRef.seekTo) currentVideoRef.seekTo(0);
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);
    handleSlideChange(emblaApi);

    const events = ["reInit", "scroll", "slideFocus", "select"];
    events.forEach(event => emblaApi.on(event, tweenScale));
    emblaApi.on("select", handleSlideChange);

    return () => {
      events.forEach(event => emblaApi.off(event, tweenScale));
      emblaApi.off("select", handleSlideChange);
    };
  }, [emblaApi, tweenScale, setTweenNodes, setTweenFactor, handleSlideChange]);

  const handlePrev = useCallback(() => {
    if (videoRefs.current[activeIndex]?.pause) {
      videoRefs.current[activeIndex].pause();
    }
    onPrevButtonClick();
  }, [onPrevButtonClick, activeIndex]);

  const handleNext = useCallback(() => {
    if (videoRefs.current[activeIndex]?.pause) {
      videoRefs.current[activeIndex].pause();
    }
    onNextButtonClick();
  }, [onNextButtonClick, activeIndex]);

  return (
    <div className="embla relative">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides?.map((item, index) => (
            <div className="embla__slide p-1" key={index}>
              <div className="embla__slide__number">
                <CarouselCard
                  isActive={index === activeIndex}
                  videoRefs={videoRefs}
                  index={index}
                  item={item}
                  onPlayChange={handleVideoPlayChange}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__buttons">
          <PrevButton
            className="absolute left-[9%] 2xl:left-[10rem] top-[50%] -translate-y-[50%] bg-gray-700 hover:bg-gray-900 text-white w-7 h-7 rounded-full z-[1000]"
            onClick={handlePrev}
            disabled={prevBtnDisabled}
          />
          <NextButton
            className="absolute right-[9%] pl-1 2xl:right-[10rem] top-[50%] -translate-y-[50%] bg-gray-700 hover:bg-gray-900 text-white w-7 h-7 rounded-full z-[1000]"
            onClick={handleNext}
            disabled={nextBtnDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;