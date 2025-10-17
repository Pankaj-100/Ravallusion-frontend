"use client";

import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
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
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { ChevronRight } from "lucide-react";
import { cdnDomain } from "@/lib/functions";
import { useDispatch, useSelector } from "react-redux";

// import shaka from 'shaka-player/dist/shaka-player.ui.js';
import 'shaka-player/dist/controls.css';

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
  playIcon = <FaPlay className="control-icons play-pause-restart cursor-pointer h-20 w-20" />,
  latestVideo = false,
  onPlayChange = () => {},
    onPlay = () => {},
  onPause = () => {},
  onEnded = () => {},
  showTimeStamp,
  setShowTimeStamp,
  iscourse,
  forward,
  chapterRef,
  chapters,
  
  setIsCompleted = false
}) => {

  const sidebarTabIndex = useSelector((state) => state.general.sidebarTabIndex);
  const firstsubmodule = useSelector((state) => state.general.beginnerFirstVideo);
  const [firstPlay, setFirstPlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(1080);
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
  const [currentChapter, setCurrentChapter] = useState("");
  const progressRef = useRef(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const timeoutId = useRef(null);
  const playbackOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const imgSrc = poster;
  // const [src, setSrc] = useState(`${cdnDomain}/${source}/1080p.mpd`);

  // DRM configuration
  // const assetId = "y"; // Your testing asset ID
// const checkAudioStatus = () => {
//   if (!videoRef.current) return;
  
//   console.log('=== AUDIO STATUS ===');
//   console.log('Volume:', videoRef.current.volume);
//   console.log('Muted:', videoRef.current.muted);
//   console.log('Paused:', videoRef.current.paused);
//   console.log('Ready state:', videoRef.current.readyState);
//   console.log('Current time:', videoRef.current.currentTime);
//   console.log('Duration:', videoRef.current.duration);

//   console.log('====================');
// };
  useEffect(() => {
    setIsClient(true);
  }, []);

useEffect(() => {
  if (!isClient || !videoRef.current) return;

  const initShaka = async () => {
    try {
      const shaka = await import("shaka-player/dist/shaka-player.compiled.js");
      console.log("🎬 Shaka imported successfully");

      shaka.polyfill.installAll();
      console.log("✅ Polyfills installed");

      if (shaka.polyfill.PatchedMediaKeysApple) {
        shaka.polyfill.PatchedMediaKeysApple.install();
        console.log("✅ PatchedMediaKeysApple installed");
      }

      if (!shaka.Player.isBrowserSupported()) {
        console.error("❌ Shaka Player not supported in this browser");
        return;
      }

      const player = new shaka.Player(videoRef.current);
      playerRef.current = player;

      if (typeof window !== "undefined") window.player = player;

      // Debug events
      player.addEventListener("error", (e) => console.error("Shaka Error:", e.detail));
      player.addEventListener("drmsessionupdate", () => console.log("DRM session updated"));
      player.addEventListener("drmmessage", () => console.log("DRM message triggered"));

      // Fetch FairPlay certificate
      const getFairPlayCertificate = async () => {
        const certUrl = "https://fairplay.keyos.com/api/v4/getCertificate?certHash=4bb365045b1f0973a0b782a6e3a76272";
        const res = await fetch(certUrl);
        if (!res.ok) throw new Error(`❌ FairPlay cert fetch failed: ${res.status}`);
        const cert = await res.arrayBuffer();
        return new Uint8Array(cert);
      };

      const fairPlayCert = await getFairPlayCertificate();

      // DRM configuration - EXACTLY as in documentation
      player.configure({
        drm: {
          servers: {
            "com.widevine.alpha": "https://widevine.keyos.com/api/v4/getLicense",
            "com.microsoft.playready": "https://playready.keyos.com/api/v4/getLicense",
            "com.apple.fps.1_0": "https://fairplay.keyos.com/api/v4/getLicense",
          },
          advanced: {
            "com.apple.fps.1_0": { serverCertificate: fairPlayCert },
          },
        },
      });

      // FairPlay initDataTransform - EXACTLY as in documentation
      player.configure("drm.initDataTransform", (initData, initDataType) => {
        if (initDataType === "skd") {
          // 'initData' is a buffer containing an "skd://" URL as a UTF-8 string
          const skdUri = shaka.util.StringUtils.fromBytesAutoDetect(initData);
          const contentId = skdUri.split("skd://")[1].substring(0, 32);
          if (typeof window !== "undefined") window.contentId = contentId;

          console.log("🔗 SKD URI:", skdUri);
          console.log("🆔 Content ID:", contentId);

          return shaka.util.FairPlayUtils.initDataTransform(initData, contentId, fairPlayCert);
        }
        return initData;
      });

      // LICENSE REQUEST FILTER - UPDATED TO MATCH DOCUMENTATION EXACTLY
      player.getNetworkingEngine().registerRequestFilter(async (type, request) => {
        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE) return;

        console.log("🎯 License Request for:", request.uris[0]);

        try {
          // Get authorization headers from your API
          const res = await fetch(`https://api.ravallusion.com/api/v1/video/getlicense/header?assetId=${source}`);
          const data = await res.json();

          // Add authorization header if available
          if (data.headers?.["x-keyos-authorization"]) {
            request.headers["x-keyos-authorization"] = data.headers["x-keyos-authorization"];
            console.log("✅ Added x-keyos-authorization header");
          }

          // Handle FairPlay license requests
         
            console.log("🍎 Processing FairPlay license request...");

            // Convert the SPC to base64 - EXACTLY as in documentation
            const originalPayload = new Uint8Array(request.body);
            const base64Payload = shaka.util.Uint8ArrayUtils.toStandardBase64(originalPayload);
            const contentId = window.contentId || source;

            console.log("📊 Request details:", {
              contentId: contentId,
              spcSize: originalPayload.length,
              base64Length: base64Payload.length
            });

            // FIXED: Create request body EXACTLY as shown in documentation
            // Documentation uses: 'spc=' + base64Payload + '&assetId=' + contentId
            const params = 'spc=' + base64Payload + '&assetId=' + contentId;
            
            console.log("📤 Request body preview:", params.substring(0, 100) + "...");
            console.log("📤 Full request body length:", params.length);

            // Update request EXACTLY as in documentation
            request.body = shaka.util.StringUtils.toUTF8(params);
            request.headers["Content-Type"] = "text/plain";

            console.log("✅ FairPlay license request prepared according to documentation");
          

        } catch (err) {
          console.error("❌ License Request Filter Error:", err);
        }
      });

      // LICENSE RESPONSE FILTER - UPDATED TO MATCH DOCUMENTATION EXACTLY
      player.getNetworkingEngine().registerResponseFilter((type, response) => {
        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE) return;

        console.log("📥 License Response from:", response.uri);

        try {
          if (response.uri?.includes("fps")) {
            console.log("🍎 Processing FairPlay license response...");

            // Convert response to text and trim whitespace - EXACTLY as in documentation
            let responseText = shaka.util.StringUtils.fromUTF8(response.data);
            responseText = responseText.trim();

            console.log("📄 Raw response length:", responseText.length);
            console.log("📄 Response preview:", responseText.substring(0, 200));

            // Handle different response formats
            let licenseData = responseText;
            
            // If response is JSON, extract the license data
            if (responseText.startsWith('{')) {
              try {
                const jsonResponse = JSON.parse(responseText);
                licenseData = jsonResponse.license || jsonResponse.ckc || jsonResponse.data || responseText;
                console.log("📋 Extracted license data from JSON response");
              } catch (jsonError) {
                console.error("❌ JSON parse error, using raw response");
                licenseData = responseText;
              }
            }

            // Decode the base64-encoded data into the format the browser expects
            // EXACTLY as in documentation: response.data = shaka.util.Uint8ArrayUtils.fromBase64(responseText).buffer;
            try {
              response.data = shaka.util.Uint8ArrayUtils.fromBase64(licenseData).buffer;
              console.log("✅ FairPlay license response transformed successfully");
              console.log("📦 Final license size:", response.data.byteLength, "bytes");
            } catch (base64Error) {
              console.error("❌ Base64 decode error:", base64Error);
              throw new Error("Failed to decode base64 license response");
            }
          }
        } catch (err) {
          console.error("❌ License Response Filter Error:", err);
        }
      });

      // Load the manifest
      await loadSource(player);

    } catch (err) {
      console.error("❌ Shaka Init Error:", err);
    }
  };

  initShaka();

  return () => {
    if (playerRef.current) playerRef.current.destroy();
    playerRef.current = null;
    delete window.player;
    delete window.contentId;
  };
}, [isClient, source]);


// Load Source Function
const loadSource = async (player) => {
  try {
    setLoading(true);
      const shaka = await import("shaka-player/dist/shaka-player.compiled.js");

    const support = await shaka.Player.probeSupport();
    console.log("Full Shaka support info:", support);

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log("Is Safari:", isSafari);

    const isHlsSupported = support?.manifest?.hls ?? false;

    const manifestUri = isHlsSupported || isSafari
      ? `${cdnDomain}/${source}/hls/1080p.m3u8`
      : `${cdnDomain}/${source}/1080p.mpd`;
    console.log("Using manifest URI:", manifestUri);

    await player.load(manifestUri);
    console.log("✅ Video source loaded");

    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleBuffer);
    video.addEventListener("playing", handleBufferEnd);
    video.addEventListener("canplay", handleReady);

    video.volume = volume;
    video.playbackRate = playbackSpeed;
    if (lastPositon > 0) video.currentTime = lastPositon;

    if (autoPlay && firstPlay) {
      setFirstPlay(false);
      setPlaying(true);
      onPlayChange(true);
      try {
        await video.play();
      } catch (playError) {
        console.error("Autoplay failed:", playError);
      }
    }

    setLoading(false);
  } catch (error) {
    // console.error("loadSource error:", error);
    setLoading(false);
  }
};






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
      if (videoRef.current) {
        videoRef.current.play();
      }
    },
    pause: () => {
      setPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    getCurrentTime: () => {
      return videoRef.current ? videoRef.current.currentTime : 0;
    },
    getDuration: () => {
      return videoRef.current ? videoRef.current.duration : 0;
    },
    reset: () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setPlaying(false);
      setFirstPlay(true);
    },
  }));

  // Handle autoplay prop changes
  useEffect(() => {
    if (autoPlay && firstPlay && videoRef.current) {
      setFirstPlay(false);
      setPlaying(true);
      onPlayChange(true);
      videoRef.current.play();
    }
  }, [autoPlay, videoRef.current]);

  const toggleFullScreen = () => {
    if (!videoRef.current) return;

    if (isIOS()) {
      if (videoRef.current.webkitEnterFullscreen) {
        if (!isFullScreen) {
          videoRef.current.webkitEnterFullscreen();
          setIsFullScreen(true);
          window.screen.orientation &&
            window.screen.orientation.lock("landscape").catch(() => {});
        } else {
          videoRef.current.webkitExitFullscreen();
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

    if (foundVideo) {
      setIsVideoCompleted(foundVideo.isCompleted === true);
      setLastPosition(foundVideo.lastPosition || 0);
    } else {
      setIsVideoCompleted(false);
      setLastPosition(0);
    }
  }, [courseProgress, videoId]);

  useEffect(() => {
    setIsVideoFullScreen && setIsVideoFullScreen(isFullScreen);
  }, [isFullScreen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          setPlaying(true);
          videoRef.current.play();
        } else if (videoRef.current) {
          setPlaying(false);
          videoRef.current.pause();
        }
      },
      {
        threshold: 0.5,
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

useEffect(() => {
  // Reset playback states for new video
  setFirstPlay(true);
  setPlaying(false);
  setShowRestartButton(false);
  setIsVideoCompleted(false);
  setCurrentTime(0);
  setPlayed(0);
  setDuration(0);
  setMaxWatchTime(0);
  setHoveredTime(null);
  setCurrentChapter("");
  setLastPosition(0);

  // Reset watch time
  if (setWatchTime) setWatchTime(0);

  // Clear previous interval
  if (intervalId) {
    clearInterval(intervalId);
    setIntervalId(null);
  }

  if (videoRef.current) {
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
  }
}, [videoId, source]);


  // Cleanup the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Event handlers for video events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    const played = (currentTime / duration) * 100;

    setCurrentTime(currentTime);
    setPlayed(played);

    // Update progress bar
    if (progressRef.current) {
      const progressBar = progressRef.current;
      const progressColor = `linear-gradient(to right, #2C68F6 ${
        played + 0.1
      }%, rgba(255,255,255,0.6) ${played}%, rgba(255,255,255,0.6) 100%)`;
      progressBar.style.background = progressColor;
    }

    // Update chapters if available
    if (chapters?.length > 0) {
      const current =
        [...chapters].reverse().find((ch) => currentTime >= ch.time) ||
        chapters[0];
      if (current.title !== currentChapter) {
        setCurrentChapter(current.title);
      }
    }

    // ✅ Only ever increase maxWatchTime
    if (!isVideoCompleted) {
      setMaxWatchTime((prev) => Math.max(prev, currentTime));
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleReady = () => {
    setLoading(false);
  };

  const handleBuffer = () => {
    setLoading(true);
  };

  const handleBufferEnd = () => {
    setLoading(false);
  };

const handlePlayPause = async () => {
  setFirstPlay(false);
  
  if (!videoRef.current) return;

  if (videoRef.current.paused) {
    setPlaying(true);
    onPlayChange(true);
    onPlay(); 
    await videoRef.current.play();

    // Clear existing interval if any
    if (intervalId) clearInterval(intervalId);

    // Set up new interval
    const id = setInterval(() => {
      if (videoRef.current && setWatchTime) {
        setWatchTime(videoRef.current.currentTime);
      }
    }, 5000);
    setIntervalId(id);

  } else {
    setPlaying(false);
    onPlayChange(false);
    onPause();
    videoRef.current.pause();

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }

  setShowRestartButton(false);
};

  const handleEnded = async () => {
    setPlaying(false);
    setShowRestartButton(true);
    setIsVideoCompleted(true);
    setIsCompleted(true);
     onEnded(); 
    
    try {
      // Your refetch logic here
    } catch (error) {
      console.error("Error refetching progress:", error);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setPlaying(true);
      setShowRestartButton(false);
      videoRef.current.play();
    }
  };

  const handleBackward = () => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime - 10;
      videoRef.current.currentTime = Math.max(0, newTime);
      setShowRestartButton(false);
    }
  };

  const handleSeekChange = (e) => {
    const value = parseFloat(e.target.value);
    const targetTime = (value / 100) * duration;

    // If course is not active or video is completed, allow seeking anywhere
    if (!iscourse || isVideoCompleted  || forward==false) {
      setPlayed(value);
      setShowRestartButton(false);
      if (videoRef.current) {
        videoRef.current.currentTime = targetTime;
      }
      return;
    }

    // the maxWatchTime restriction
    if (targetTime <= maxWatchTime) {
      setPlayed(value);
      setShowRestartButton(false);
      if (videoRef.current) {
        videoRef.current.currentTime = targetTime;
      }
    }
  };

  const handleSeekMouseDown = () => {
    const value = parseFloat(progressRef.current.value);
    
    // If course is not active or video is completed, allow seeking anywhere
    if (!iscourse || isVideoCompleted  || forward==false) {
      if (videoRef.current) {
        videoRef.current.currentTime = (value / 100) * duration;
      }
      return;
    }

    // maxWatchTime restriction
    const targetTime = (value / 100) * duration;
    if (targetTime <= maxWatchTime && videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleForward = () => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const newTime = currentTime + 10;

    // If course is not active or video is completed, allow forwarding anywhere
    if (!iscourse || isVideoCompleted || newTime <= maxWatchTime || forward==false) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleProgressHover = (e) => {
    if (!progressRef.current) return;
    
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    
    if (videoRef.current) {
      videoRef.current.volume = value;
    }

    const volumeTrack = document.querySelector(".volume-track");
    if (volumeTrack) {
      const coloredWidth = value * 100 + "%";
      volumeTrack.style.background = `linear-gradient(to right, #CAA257 ${coloredWidth}, rgba(255,255,255,0.8) ${coloredWidth})`;
    }
  };

  const handleMute = () => {
    if (volume === 0) {
      setVolume(1);
      if (videoRef.current) {
        videoRef.current.volume = 1;
      }
    } else {
      setVolume(0);
      if (videoRef.current) {
        videoRef.current.volume = 0;
      }
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
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    toggleSettings();
  };

  const handleVideoPlayerInteraction = () => {
    onPlayChange(true); 
  };

  const handleQualityChange = async (quality) => {
    if (!playerRef.current || !videoRef.current) return;

    setSelectedQuality(quality);
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;

    try {
      // Show loader on top of current frame
      setLoading(true);

      // Pause playback temporarily
      videoRef.current.pause();
  const shaka = await import('shaka-player/dist/shaka-player.ui.js');
      // Detect which manifest to use for new quality
         const support = shaka.Player.probeSupport?.();
    const isHlsSupported = support?.supportedManifestTypes?.includes('hls') ?? false;
      const newManifestUri = isHlsSupported 
        ? `${cdnDomain}/${source}/hls/${quality}p.m3u8`
        : `${cdnDomain}/${source}/1080p.mpd`;

      // Load new quality
      await playerRef.current.load(newManifestUri);

      // Restore playback position
      videoRef.current.currentTime = currentTime;

      if (wasPlaying) {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error switching quality:", error);
      toast.error("Unable to switch video quality");
    } finally {
      // Hide loader after new video is ready
      setLoading(false);
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
                  className={selectedQuality === 720 ? "active" : ""}
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

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={`video-container rounded-xl ${
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
        
        <video
          ref={videoRef}
          className="react-player"
          poster={poster}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onClick={handlePlayPause}
        />
        
        {firstPlay && (
          <div
            className="flex justify-center items-center thumbnail-container"
            style={{
              height: "100%",
              width: "100%",
              zIndex: 99,
              background: "rgba(0,0,0)",
              position: "absolute",
              top: 0,
              left: 0,
              cursor: 'pointer'
            }}
            onClick={() => {
              setLoading(true);
              setPreloaded(true);
              handlePlayPause();
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
              />
              <div className="absolute inset-0 flex items-center justify-center ">
                {playIcon }
              </div>
            </div>
          </div>
        )}
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
                videoRef.current &&
                (isVideoCompleted || (duration && (played / 100) * duration <= maxWatchTime || iscourse==false))
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
                className="track-range cursor-pointer"
                ref={progressRef}
                min={0}
                max={100}
                 value={isNaN(played) ? 0 : played}
                step="any"
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
              />
            </div>

            <div className="flex">
              <div className="volume-wrapper flex items-center ">
                {volumeIcon()}
                {!isTouchDevice ? null : (
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