"use client";

import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
import ReactPlayer from "react-player";
import {
  FaArrowLeft,
  FaBackward,
  FaCompress,
  FaExpand,
  FaForward,
  FaGear,
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeXmark,
} from "react-icons/fa6";
import { GiPauseButton } from "react-icons/gi";
import { GrBackTen, GrForwardTen } from "react-icons/gr";
import { Button, Image, Spinner } from "react-bootstrap";
import "../../app/videoPlayer.css";
import "rc-slider/assets/index.css";
import screenfull from "screenfull";
import { FaAngleRight, FaCog } from "react-icons/fa";
import {
  MdOutlineLanguage,
  MdOutlineSpeed,
  MdReplay,
  MdTune,
} from "react-icons/md";

import ErrorBoundary from "@/app/utils/errorBoundaries";
// import { imgAddr, vidAddr } from "../features/api";
import { useMediaQuery } from "react-responsive";
import {
  useGetCourseProgressQuery,
} from "@/store/Api/courseProgress";

import { toast } from "react-toastify";
import { ChevronRight } from "lucide-react";
import { cdnDomain } from "@/lib/functions";
import { useDispatch, useSelector } from "react-redux";

const VideoPlayer = ({
  source,
  poster,
  setIsVideoFullScreen,
  tooltipView = false,
  className = "",
  setWatchTime,
  courseProgress,
  videoId,
  ref,
  registerVideoRef,
  autoPlay,
  playIcon = <FaPlay className="control-icons play-pause-restart cursor-pointer h-20 w-20 " />,
  latestVideo = false,
   onPlayChange = () => {},
  showTimeStamp,
  setShowTimeStamp,
  iscourse,
  chapterRef,
  chapters,
  setIsCompleted
    // setVideoPlaying,
}) => {

  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  const firstsubmodule = useSelector((state) => state.general.beginnerFirstVideo);
  const [firstPlay, setFirstPlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(720);
  const [selectedLang, setSelectedLang] = useState([source]);
  const [maxWatchTime, setMaxWatchTime] = useState(0);

  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState("main");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [hoveredTime, setHoveredTime] = useState(null);
  const [preloaded, setPreloaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const isMobileDevice = useMediaQuery({ maxWidth: 600 });
  const [intervalId, setIntervalId] = useState(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(null);
  const [lastPositon, setLastPosition] = useState(0);
  const [isClient, setIsClient] = useState(null);
  const progressRef = useRef(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const playerRef = useRef(null);
  const timeoutId = useRef(null);
  const playbackOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const [currentChapter, setCurrentChapter] = useState("");

  const imgSrc = poster;

  const [src, setSrc] = useState(`${cdnDomain}/${source}/720p.m3u8`);
  
 
    const { refetch: refetchCourseProgress } = useGetCourseProgressQuery();

  if(sidebarTabIndex==1)
  {
    iscourse=false;
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const resetTimeout = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    if (!showSettings) {
      timeoutId.current = setTimeout(() => {
        if (containerRef?.current?.classList?.contains("show-controls")) {
          containerRef?.current?.classList.remove("show-controls");
          setShowControls(false);
        }
      }, 4000);
    }
  };

  // Expose methods to parent component via ref
  useImperativeHandle(ref || registerVideoRef, () => ({
    play: () => {
      setPlaying(true);
      setFirstPlay(false);
    },
    pause: () => {
      setPlaying(false);
    },
    getCurrentTime: () => {
      return playerRef.current ? playerRef.current.getCurrentTime() : 0;
    },
    getDuration: () => {
      return playerRef.current ? playerRef.current.getDuration() : 0;
    },
    reset: () => {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
      setPlaying(false);
      setFirstPlay(true);
    },
  }));

  // Handle autoplay prop changes
  useEffect(() => {
    if (autoPlay && firstPlay) {
      setFirstPlay(false);
      setPlaying(true);
       onPlayChange(true);
    }
  }, [autoPlay]);

  const toggleFullScreen = () => {
    const videoElement = playerRef.current.getInternalPlayer();

    if (isIOS()) {
      if (videoElement.webkitEnterFullscreen) {
        if (!isFullScreen) {
          videoElement.webkitEnterFullscreen();
          setIsFullScreen(true);
          window.screen.orientation &&
            window.screen.orientation.lock("landscape").catch(() => {});
        } else {
          videoElement.webkitExitFullscreen();
          setIsFullScreen(false);
          window.screen.orientation && window.screen.orientation.unlock();
        }
      }
    } else {
      if (screenfull.isEnabled) {
        if (!isFullScreen) {
          screenfull.request(containerRef.current);
          setIsFullScreen(true);
          window.screen.orientation &&
            window.screen.orientation.lock("landscape").catch(() => {});
        } else {
          screenfull.exit();
          setIsFullScreen(false);
          window.screen.orientation && window.screen.orientation.unlock();
        }
      }
    }
  };

  const fullScreenIcon = () => {
    return screenfull.isFullscreen ? (
      <FaCompress
        onClick={toggleFullScreen}
        className="fullscreen-button"
        size={18}
      />
    ) : (
      <FaExpand
        onClick={toggleFullScreen}
        className="fullscreen-button"
        size={18}
      />
    );
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowSettings(false);
    }
  };

useEffect(() => {
  const foundVideo = courseProgress?.data?.courseProgress?.find(
    (v) => v.video === videoId
  );

  setIsVideoCompleted(foundVideo?.isCompleted || false); 

  const lastPosition = foundVideo?.lastPosition || 0;
  setLastPosition(lastPosition);
}, [courseProgress, videoId]); 


  useEffect(() => {
    setIsVideoFullScreen && setIsVideoFullScreen(isFullScreen);
  }, [isFullScreen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting) {
    
          setPlaying(true);
        } else {
       
          setPlaying(false);
        }
      },
      {
        threshold: 0.5, // 50% of the video should be visible to trigger
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onTouchStart = () => {
      setIsTouchDevice(true);
    };

    if ("ontouchstart" in window || navigator.maxTouchPoints) {
      setIsTouchDevice(true);
    }

    window.addEventListener("touchstart", onTouchStart);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (latestVideo) {
        const isCurrentlyFullscreen = !isIOS()
          ? screenfull.isFullscreen
          : document.fullscreenElement != null;

        
        if (
          !isCurrentlyFullscreen &&
          window.lastDialogScrollPosition !== undefined
        ) {
          setTimeout(() => {
            window.scrollTo({
              top: window.lastDialogScrollPosition,
              behavior: "auto",
            });
          }, 100);
        }
        setIsFullScreen(isCurrentlyFullscreen);
      }
    };

    if (!isIOS() && screenfull.isEnabled) {
      screenfull.on("change", handleFullScreenChange);
      return () => {
        screenfull.off("change", handleFullScreenChange);
      };
    } else {
      document.addEventListener("fullscreenchange", handleFullScreenChange);
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleForward();
          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      setShowControls(true);
    }
  }, [playing]);

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        setIsFullScreen(screenfull.isFullscreen);
      });

      return () => {
        screenfull.off("change");
      };
    }
  }, []);

  useEffect(() => {
    resetTimeout();
  }, [showSettings]);

  useEffect(() => {
    fullScreenIcon();
  }, [screenfull.isFullscreen]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  if (!isClient) {
    return null;
  }

  //Functions.......................

  const handleReady = () => {
    setLoading(false);
    // setPlaying(true);
  };

  const handleBuffer = () => {
    setLoading(true);
  };

  const handleBufferEnd = () => {
    setLoading(false);
  };

  const handlePlayPause = () => {
    setFirstPlay(false);
    setPlaying((prevPlaying) => !prevPlaying);
    setShowRestartButton(false);
  };

const handleEnded = async () => {
  setPlaying(false);
  setShowRestartButton(true);
  setIsVideoCompleted(true);
  setIsCompleted(true);
// setVideoPlaying(false)  

  

  try {
      

    const data = await refetchCourseProgress();
  
  } catch (error) {
    console.error("Error refetching progress:", error);
  }
};

  const handleRestart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      setPlaying(true);
      setShowRestartButton(false);
    }
  };

  const handleBackward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(
        playerRef.current.getCurrentTime() - 10,
        "seconds"
      );
      setShowRestartButton(false);
    }
  };

const handleSeekChange = (e) => {
  const value = parseFloat(e.target.value);
  const targetTime = (value / 100) * duration;

  // If course is not active or video is completed, allow seeking anywhere
  if (!iscourse || isVideoCompleted||firstsubmodule) {
    setPlayed(value);
    setShowRestartButton(false);
    playerRef.current?.seekTo(value / 100, "fraction");
    return;
  }

  // the maxWatchTime restriction
  if (targetTime <= maxWatchTime) {
    setPlayed(value);
    setShowRestartButton(false);
    playerRef.current?.seekTo(value / 100, "fraction");
  }
};

const handleSeekMouseDown = () => {
  const value = parseFloat(progressRef.current.value);
  
  // If course is not active or video is completed, allow seeking anywhere
  if (!iscourse || isVideoCompleted||firstsubmodule) {
    playerRef.current?.seekTo(value / 100, "fraction");
    return;
  }

  // maxWatchTime restriction
  const targetTime = (value / 100) * duration;
  if (targetTime <= maxWatchTime) {
    playerRef.current?.seekTo(value / 100, "fraction");
  }
};

const handleForward = () => {
  if (!playerRef.current) return;
  
  const currentTime = playerRef.current.getCurrentTime();
  const newTime = currentTime + 10;

  // If course is not active or video is completed, allow forwarding anywhere
  if (!iscourse || isVideoCompleted || newTime <= maxWatchTime||firstsubmodule) {
    playerRef.current.seekTo(newTime, "seconds");
  }
};


 const handleProgress = (state) => {
   if (!progressRef.current) return;
  const { played, playedSeconds, loaded } = state;
  
  const progressPercentage = played * 100;
  const loadedPercentage = loaded * 100;

  setPlayed(progressPercentage);
  setCurrentTime(playedSeconds);


  if (!isVideoCompleted && playedSeconds > maxWatchTime) {
    setMaxWatchTime(playedSeconds);
     
  }

  if (chapters?.length > 0) {
    const current =
      [...chapters].reverse().find((ch) => playedSeconds >= ch.time) ||
      chapters[0];
    if (current.title !== currentChapter) {
      setCurrentChapter(current.title);
    }
  }

  const progressBar = progressRef.current;
  if (progressBar) {
    const progressColor = `linear-gradient(to right, #2C68F6 ${
      progressPercentage + 0.1
    }%, rgba(255,255,255,0.6) ${progressPercentage}%, rgba(255,255,255,0.6) ${loadedPercentage}%, rgba(255,255,255,0.2) ${loadedPercentage}%)`;
    progressBar.style.background = progressColor;
  }
};

  const handleProgressHover = (e) => {
    const barWidth = progressRef.current.getBoundingClientRect().width;
    const mouseX = e.clientX - progressRef.current.getBoundingClientRect().left;
    const hoverTime = (mouseX / barWidth) * duration;
    setHoveredTime(hoverTime);

    const tooltip = document.querySelector(".tooltip-progress");
    if (tooltip) {
      const tooltipWidth = tooltip.getBoundingClientRect().width;
      const tooltipWidthPercentage = (tooltipWidth / barWidth) * 100;

      let tooltipPositionX = (mouseX / barWidth) * 100;
      if (tooltipPositionX < tooltipWidthPercentage) {
        tooltipPositionX = tooltipWidthPercentage;
      } else if (tooltipPositionX + tooltipWidthPercentage > 100) {
        tooltipPositionX = 100 - tooltipWidthPercentage;
      }
      tooltip.style.left = `calc(${tooltipPositionX}% )`;
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);

    const volumeTrack = document.querySelector(".volume-track");
    if (volumeTrack) {
      const coloredWidth = value * 100 + "%";
      volumeTrack.style.background = `linear-gradient(to right, #CAA257 ${coloredWidth}, rgba(255,255,255,0.8) ${coloredWidth})`;
    }
  };

  const handleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  const volumeIcon = () => {
    if (volume === 0) {
      return (
        <FaVolumeXmark
          onClick={handleMute}
          className="volume-button"
          size={18}
        />
      );
    } else if (volume < 0.5) {
      return (
        <FaVolumeLow onClick={handleMute} className="volume-button" size={18} />
      );
    } else {
      return (
        <FaVolumeHigh
          onClick={handleMute}
          className="volume-button"
          size={18}
        />
      );
    }
  };

  const toggleSettings = () => {
    setActiveMenu("main");
    setShowSettings(!showSettings);
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    toggleSettings();
  };

  // const handleError = (error) => {
  //   console.error("An error occurred while loading the video:", error);
  //   toast.error("An error occurred while loading the video");
  // };
const handleVideoPlayerInteraction = () => {

 
    onPlayChange(true); 
  
};
  const handleQualityChange = (quality) => {
    // if (quality === 360) {
    //   setSelectedQuality("Auto");
    // } else {
    //   setSelectedQuality(quality);
    // }
    setSelectedQuality(quality);

    const newSrc = `${cdnDomain}/${source}/${quality}p.m3u8`;
    if (newSrc !== src) {
      const currentTime = playerRef.current.getCurrentTime();
      setPlaying(true);
      setSrc(newSrc);

      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(currentTime);
        }
      }, 500);
    }
    toggleSettings();
  };

  const settingsMenu = () => {
    return (
      <div className={`settings-wrapper  ${showSettings ? "show" : ""}`}>
        <div className="settings-menu">
          <div className="menu-header mb-2">
            {activeMenu !== "main" && (
              <FaArrowLeft
                className="back-icon"
                onClick={() => handleMenuChange("main")}
              />
            )}
            <span className="menu-title ">
              {activeMenu === "main"
                ? "Settings"
                : activeMenu === "quality"
                ? "Quality"
                : activeMenu === "playbackspeed" && "Playback Rate"}
            </span>
          </div>

          <ul className="menu-items">
            {activeMenu === "main" && (
              <>
                <li
                  onClick={() => handleMenuChange("quality")}
                  className="my-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <MdTune className="me-1" />
                    <p>Quality:</p>
                  </div>

                  <span className="flex items-center cursor-pointer z-50">
                    {selectedQuality}p <FaAngleRight />
                  </span>
                </li>

                <li
                  onClick={() => handleMenuChange("playbackspeed")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <MdOutlineSpeed className=" me-1" />
                    Playback Rate:
                  </span>

                  <span className="flex items-center">
                    {playbackSpeed}x <FaAngleRight />
                  </span>
                </li>
              </>
            )}
            {activeMenu === "quality" && (
              <>
                <li
                  onClick={() => handleQualityChange(1080)}
                  className={selectedQuality === 1080 ? "active" : ""}
                >
                  1080p
                </li>
                <li
                  onClick={() => handleQualityChange(720)}
                  className={selectedQuality === "720" ? "active" : ""}
                >
                  720p
                </li>
              </>
            )}
            {activeMenu === "playbackspeed" &&
              playbackOptions?.map((speed, index) => (
                <li
                  key={speed}
                  className={playbackSpeed === speed ? "active" : ""}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  };

  function mergeRefs(...refs) {
    return (element) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(element);
        } else if (ref != null) {
          ref.current = element;
        }
      });
    };
  }

  return (
    <div
      className={`video-container  ${
        playing ? "playing" : "paused"
      } !z-0 !${className}`}
      ref={containerRef}
      onMouseMove={() => {
        containerRef.current.classList.add("show-controls");
        setShowControls(true);
        resetTimeout();
        handleVideoPlayerInteraction();
      }}
      onTouchStart={() => {
        containerRef.current.classList.add("show-controls");
        setShowControls(true);
          handleVideoPlayerInteraction();

        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
      }}
      onTouchEnd={() => {
        resetTimeout();
      }}
    >
      {loading ? (
        <div className="loading-indicator text-white">
          <Spinner size="xl" />
        </div>
      ) : null}

      <div className="video-player">
        <ReactPlayer
          className="react-player"
          ref={mergeRefs(playerRef, chapterRef)}
          // ref={playerRef || chapterRef}
          url={src}
          playing={playing}
          controls={false}
        
          width="100%"
          height="100%"
          playbackRate={playbackSpeed}
          volume={volume}
          // light={false}
             playIcon={<div className="absolute"   style={{
            
                zIndex: 199,height:60,width:60,
              
              }}>{playIcon} </div>}
          light={
            <div
              className="flex justify-center items-center thumbnail-container"
              style={{
                height: "100%",
                width: "100%",
                zIndex: 99,
                background: "rgba(0,0,0)",
                position: "relative",
              }}
            >
              <div className="thumbnail-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src={imgSrc}
                  alt="Thumbnail"
                  
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                  className="thumbnail-image"
                  onClick={() => {
                    setLoading(true);
                    setPreloaded(true);
                  }}
                />
              </div>
            </div>
          }
          // onReady={()=>setPlaying(true)}
          playsinline={true}
          onClickPreview={() => {
            if (!playing) {
              setLoading(true);
              handlePlayPause();
            }
          }}
          // onStart={() => setPlaying(true)}
          onStart={() => {
            setPlaying(true);
            if (playerRef.current) {
              playerRef.current.seekTo(lastPositon, "seconds");
            }
          }}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleEnded}
          onBuffer={handleBuffer}
          // onError={handleError}
          onBufferEnd={handleBufferEnd}
          onPlay={() => {

          
            setPlaying(true);
             onPlayChange(true); 
            

            const id = setInterval(() => {
              if (playerRef.current && setWatchTime) {
                const currentTime = playerRef.current.getCurrentTime();
               setWatchTime(currentTime);
               
              }
            }, 5000); //Todo:  need to change in 1 minutes
            setIntervalId(id);
          
          }}
          onPause={() => {
            setPlaying(false);
            onPlayChange(false); 
            if (intervalId) {
              clearInterval(intervalId);
              setIntervalId(null);
            }
          }}
          config={{
            hls: {
              forceHLS: true,
            },
            // dash: {
            //   forceDASH: true
            // },
          }}
        />
      </div>

      {!firstPlay && (
        <div
          className={`player-controls ${
            isFullScreen ? "fullscreen-controls" : ""
          } `}
        >
          <div className="on-screen-controls">
            <GrBackTen
              className="control-icons cursor-pointer"
              onClick={handleBackward}
            />

            {showRestartButton ? (
              <MdReplay
                onClick={handleRestart}
                className="control-icons play-pause-restart cursor-pointer"
              />
            ) : playing ? (
              <GiPauseButton
                onClick={handlePlayPause}
                className="control-icons play-pause-restart cursor-pointer"
              />
            ) : (
              <FaPlay
                className="control-icons play-pause-restart cursor-pointer"
                onClick={handlePlayPause}
              />
            )}
         <GrForwardTen
  className={`control-icons ${
    playerRef.current &&
     isVideoCompleted || (duration && (played / 100) * duration <= maxWatchTime|| iscourse==false)
      ? "cursor-pointer"
      : "cursor-not-allowed"
  }`}
  onClick={handleForward}
/>

          </div>

          <div className="bottom-controls">
            <div className="flex items-center">
              <span className="text-white ms-2 duration-counter">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {
                chapters?.length>0 && (
                  <div className="flex items-center cursor-pointer" onClick={() => { setShowTimeStamp(!showTimeStamp) }}>
                    <span className="ml-2 uppercase text-sm flex items-center">
                      {currentChapter}
                    </span>
                    <ChevronRight size={18} />
                  </div>
                )
              }

            </div>

            <div
              className={`progress-bar-wrapper me-2`}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoveredTime(null)}
            >
              {tooltipView && !isTouchDevice && (
                <div className="tooltip-progress">
                  <p>{formatTime(hoveredTime)}</p>
                </div>
              )}

<input
  type="range"
 className="track-range cursor-pointer" // Always show pointer cursor
  ref={progressRef}
  min={0}
  max={100}
  value={played}
  step="any"
  onChange={handleSeekChange}
  onMouseDown={handleSeekMouseDown}
/>


            </div>

            <div className="flex">
              <div className="volume-wrapper flex items-center ">
                {volumeIcon()}
                {isTouchDevice ? null : (
                  <input
                    type="range"
                    className="volume-track"
                    style={{
                      background: `linear-gradient(to right, #2C68F6 ${
                        volume * 100
                      }%, rgba(255,255,255,0.8) ${volume * 100}%)`,
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                )}
              </div>

              <div className="quality mx-3" ref={menuRef}>
                {settingsMenu()}

                <FaCog
                  size={18}
                  onClick={toggleSettings}
                  className={`settings-button ${showSettings ? "active" : ""}`}
                />
              </div>

              <span className="me-2">{fullScreenIcon()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
