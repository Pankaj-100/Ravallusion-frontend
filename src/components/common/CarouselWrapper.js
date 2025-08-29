import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const CarouselWrapper = ({
  navigation = false,
  showDots = false,
  children,
  autoScrollInterval = 3000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = React.Children.count(children);
  const slideRef = useRef(null);

  // Function to navigate to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  // Function to navigate to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (totalSlides <= 1) return; // No auto-scroll if only one slide
    const autoScroll = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, autoScrollInterval);

    return () => clearInterval(autoScroll);
  }, [autoScrollInterval, totalSlides]);

  // Dynamic styling for slides
  const slideStyles = {
    transform: `translateX(-${currentIndex * 100}%)`,
    transition: "transform 0.5s ease-in-out",
  };

  // Dot navigation handler
  const goToSlide = (idx) => setCurrentIndex(idx);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Slider Container */}
      <div
        ref={slideRef}
        className="flex w-full h-full"
        style={slideStyles}
      >
        {React.Children.map(children, (child, index) => (
          <div className="w-full h-full flex-shrink-0">{child}</div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {navigation && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700  text-white rounded-full p-2 hover:bg-gray-900"
            onClick={prevSlide}
          >
            <ChevronLeft />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white rounded-full p-2 hover:bg-gray-900"
            onClick={nextSlide}
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dots Navigation (only if showDots is true) */}
      {showDots && totalSlides > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-1 z-10">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "bg-[var(--neon-purple)] scale-110 shadow"
                  : "bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ outline: "none" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselWrapper;
