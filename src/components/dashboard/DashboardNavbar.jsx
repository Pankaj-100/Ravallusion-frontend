"use client";

import {
  BulbIcon,
  CrownIcon,
  EllipseOfSearch,
  Gear,
  HamburgerMenu,
  NeonElipse,
} from "@/lib/svg_icons";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { setSidebarTabIndex, setCourseType, setCourseId, setShouldPlayFirstVideo } from  "@/store/slice/general";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import CustomDialog from "../common/CustomDialog";
import SearchDialog, { SearchInput } from "./SearchDialog";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserDetailQuery } from "@/store/Api/auth";
import { setSearchValue } from "@/store/slice/general";
import { setSearchHistory } from "@/store/slice/general";
import YourProgress from "../progress/YourProgress";
import { useGetCoursesWithStatusQuery } from "../../store/Api/courseslist"; 

const DashboardNavbar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [urlpath, setUrlPath] = useState("");
  const { introductoryVideosCount, videoTitle } = useSelector(
    (state) => state.general
  );

  const { searchValue, searchHistory } = useSelector((state) => state.general);
  const { data } = useGetUserDetailQuery();
  const avatar = data?.data?.user?.avatar;
  
  // Use the new API to get courses with enrollment status
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useGetCoursesWithStatusQuery();

  useEffect(() => {
    if (pathname === "/dashboard") {
      setShow(false);
      setUrlPath("dashboard");
    } else if (pathname === "/dashboard/introductory") {
      setShow(true);
      setUrlPath("introductory");
    } else if (pathname === "/dashboard/profile") {
      setShow(true);
      setUrlPath("profile");
    } else if (pathname === "/dashboard/search") {
      setShow(true);
      setUrlPath("search");
    } else if (pathname.includes("/dashboard/player-dashboard/")) {
      setShow(true);
      setUrlPath("playerDashboard");
    } else {
      setShow(true);
    }
  }, [pathname]);

  // Separate enrolled and not enrolled courses
  const enrolledCourses = coursesData?.filter(course => course.isEnrolled) || [];
  const notEnrolledCourses = coursesData?.filter(course => !course.isEnrolled) || [];

  return (
    <div
      className={`${
        urlpath == "dashboard" ? "rounded-none" : "rounded-none md:rounded-xl"
      } bg-[#181F2B] w-full p-4 lg:px-8 lg:py-4 flex items-center justify-between relative`}
    >
      {openSidebar && (
        <SideBar
          avatar={avatar}
          setOpenSidebar={setOpenSidebar}
          openSidebar={openSidebar}
          urlpath={urlpath}
          enrolledCourses={enrolledCourses}
          notEnrolledCourses={notEnrolledCourses}
          coursesLoading={coursesLoading}
        />
      )}
      {show ? (
        <div className="flex gap-x-5 lg:gap-x-6 items-center w-2/3 lg:w-1/2">
          <button
            className="cursor-pointer"
            onClick={() => {
              urlpath === "playerDashboard"
                ? router.push("/dashboard")
                : router.back();
            }}
          >
            <ArrowLeft />
          </button>

          <div className="flex-grow">
            {urlpath === "profile" && (
              <h1 className="lg:text-lg font-semibold  ">Profile</h1>
            )}
            {urlpath === "introductory" && (
              <>
                <h1 className="text-lg font-semibold mb-1">Learn properly</h1>
                <p className="text-xs text-[#CDCED1]">
                  {introductoryVideosCount} Videos
                </p>
              </>
            )}
            {urlpath === "playerDashboard" && (
              <>
                <p
                  className="text-lg font-bold text-[#CDCED1] line-clamp-2 max-w-[90vw] lg:max-w-full"
                >
                  {videoTitle}
                </p>
              </>
            )}

            {urlpath === "search" && (
              <SearchInput
                searchValue={searchValue}
                searchHistory={searchHistory}
                setSearchHistory={setSearchHistory}
                setSearchValue={setSearchValue}
                headerSearch={true}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 relative">
            <Image src="/logo.png" alt="logo" fill className="object-contain" />
          </div>
          <span className="hidden lg:inline lg:text-lg font-semibold whitespace-nowrap">
            Ravallusion Academy
          </span>
        </div>
      )}

      <div className="flex gap-x-5 items-center my-auto">
        <div className="hidden lg:flex gap-x-2">
          <BoxComponent
            show={show}
            icon={<Gear />}
            title={"My Courses"}
            enrolledCourses={enrolledCourses}
            notEnrolledCourses={notEnrolledCourses}
            coursesLoading={coursesLoading}
            coursesError={coursesError}
          />

          <BoxComponent
            show={show}
            icon={<BulbIcon />}
            title={"Learn Properly"}
            introductory={true}
            href={"/dashboard/introductory"}
          />
        </div>

        <ProfileComponent
          show={show}
          href={"/dashboard/profile"}
          avatar={avatar}
        />

        <div
          onClick={() => setOpenSidebar(true)}
          className="p-3 border relative cursor-pointer lg:hidden border-[var(--neon-purple)] bg-[#040C19] "
        >
          <EllipseOfSearch />
          <HamburgerMenu width={24} />
        </div>

        <CustomDialog open={searchDialog} close={() => setSearchDialog(false)}>
          <SearchDialog setSearchDialog={setSearchDialog} />
        </CustomDialog>
      </div>
    </div>
  );
};

const SideBar = ({ openSidebar, setOpenSidebar, avatar, enrolledCourses, notEnrolledCourses, coursesLoading }) => {
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15,
      },
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };
  const show = false;
  const backdropVariants = {
    open: { opacity: 1, pointerEvents: "auto" },
    closed: { opacity: 0, pointerEvents: "none" },
  };
  
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
        initial="closed"
        animate={openSidebar ? "open" : "closed"}
        variants={backdropVariants}
        onClick={() => setOpenSidebar(false)}
      />

      <motion.div
        className="absolute bg-[var(--Surface)] w-72 pt-12 pb-8 px-4 h-screen top-0 left-0 z-20 lg:hidden overflow-y-auto"
        initial="closed"
        animate={openSidebar ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-2xl italic font-bold">Ravallusion</h1>

          <div onClick={() => setOpenSidebar(false)}>
            <X />
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          {/* Enrolled Courses */}
          {coursesLoading ? (
            <div className="px-4 py-3 bg-[#040C19] border border-[var(--neon-purple)] text-center">
              <p className="text-sm text-gray-400">Loading courses...</p>
            </div>
          ) : (
            <>
              {/* Show enrolled courses first */}
              {enrolledCourses && enrolledCourses.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[var(--neon-purple)] mb-2 px-2">My Enrolled Courses</h3>
                  {enrolledCourses.map((course) => (
                    <BoxComponentMobile
                      key={course.courseId}
                      setOpenSidebar={setOpenSidebar}
                      course={course}
                      show={show}
                      icon={<Gear />}
                      title={course.title}
                      isEnrolled={true}
                    />
                  ))}
                </div>
              )}
              
              {/* Show not enrolled courses */}
              {notEnrolledCourses && notEnrolledCourses.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[var(--neon-purple)] mb-2 px-2">Available Courses</h3>
                  {notEnrolledCourses.map((course) => (
                    <BoxComponentMobile
                      key={course.courseId}
                      setOpenSidebar={setOpenSidebar}
                      course={course}
                      show={show}
                      icon={<Gear />}
                      title={course.title}
                      isEnrolled={false}
                    />
                  ))}
                </div>
              )}
              
              {(!enrolledCourses || enrolledCourses.length === 0) && (!notEnrolledCourses || notEnrolledCourses.length === 0) && (
                <div className="px-4 py-3 bg-[#040C19] border border-[var(--neon-purple)] text-center">
                  <p className="text-sm text-gray-400">No courses available</p>
                </div>
              )}
            </>
          )}
          
          <BoxComponentMobile
            setOpenSidebar={setOpenSidebar}
            href={"/dashboard/introductory"}
            show={show}
            icon={<BulbIcon />}
            title={"Learn Properly"}
            introductory={true}
          />
          <BoxComponentMobile
            setOpenSidebar={setOpenSidebar}
            href={"/dashboard/profile"}
            show={show}
            icon={
              <div className="bg-gray-300 rounded-full w-6 h-6 relative">
                <Image
                  src={avatar || "/profilepic.jpeg"}
                  alt="Profile pic"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
            }
            title={"Profile"}
            profileMobile={true}
          />
        </div>
      </motion.div>
    </>
  );
};

const ProfileComponent = ({ href, avatar }) => {
  const router = useRouter();

  return (
    <div
      className=" bg-gray-300 rounded-full xl:w-11 xl:h-11  lg:w-9 lg:h-9 relative hidden lg:block cursor-pointer"
      onClick={() => {
        router.push(href);
      }}
    >
      <Image
        src={avatar || "/profilepic.jpeg"}
        alt="Profile pic"
        layout="fill"
        objectFit="cover"
        className="rounded-full"
      />
    </div>
  );
};

const BoxComponent = ({
  icon,
  title,
  introductory,
  enrolledCourses,
  notEnrolledCourses,
  coursesLoading,
  coursesError,
  show,
}) => {
  const [isOpenBoxDropdown, setIsOpenBoxDropdown] = useState(false);
  const router = useRouter();
  const boxRef = useRef(null);
 
  const handleClick = () => {
    if (introductory) {
      router.push("/dashboard/introductory");
    } else {
      setIsOpenBoxDropdown((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setIsOpenBoxDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative hidden lg:block" ref={boxRef}>
      <div
        onClick={handleClick}
        className={`xl:px-7 lg:px-4 py-3 flex flex-col bg-[#040C19] border-x border-t ${
          isOpenBoxDropdown ? "" : "border-b"
        } border-[var(--neon-purple)] cursor-pointer relative`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-x-2 items-center">
            {icon}
            <span className="text-sm font-semibold">
              {show && !isOpenBoxDropdown ? "" : title}
            </span>
          </div>

          {introductory ? (
            <span className="text-[9px] text-[var(--yellow)] rounded-sm bg-[#7b40006e] px-2 py-[1px] ml-2">
              Free
            </span>
          ) : (
            <div className="cursor-pointer ml-3">
              {isOpenBoxDropdown ? <ChevronUp /> : <ChevronDown />}
            </div>
          )}

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex justify-center">
            <NeonElipse />
          </div>
        </div>
      </div>

      {isOpenBoxDropdown && (
        <BoxDropdown
          enrolledCourses={enrolledCourses}
          notEnrolledCourses={notEnrolledCourses}
          coursesLoading={coursesLoading}
          coursesError={coursesError}
          setIsOpenBoxDropdown={setIsOpenBoxDropdown}
        />
      )}
    </div>
  );
};

const BoxDropdown = ({ enrolledCourses, notEnrolledCourses, coursesLoading, coursesError, setIsOpenBoxDropdown }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const handleCourseClick = (course) => {
    if (course.isEnrolled) {
      dispatch(setSidebarTabIndex(0));
      dispatch(setCourseType(course.courseId));
      dispatch(setCourseId(course.courseId));
      router.push(`/dashboard/player-dashboard/${course.courseId}`);
    } else {
      // Navigate to cart with courseId as URL parameter
      router.push(`/mycart?courseId=${course.courseId}`);
    }
    setIsOpenBoxDropdown(false);
  };

  // ... rest of the component ...

  return (
    <motion.div
      className="absolute top-full left-0 right-0 w-full border-x border-b border-[var(--neon-purple)] bg-[#040C19] px-4 py-2 z-10 overflow-y-auto max-h-80"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Enrolled Courses Section */}
      {enrolledCourses && enrolledCourses.length > 0 && (
        <>
          <div className="flex flex-col gap-y-1 mb-4">
            {enrolledCourses.map(course => (
              <span
                key={course.courseId}
                onClick={() => handleCourseClick(course)}
                className="block px-3 py-2 text-sm text-white hover:text-[var(--yellow)] hover:bg-[#0e1624] transition-colors duration-200 cursor-pointer flex justify-between items-center"
              >
                {course.title}
                <ArrowRight size={21} />
              </span>
            ))}
          </div>
        </>
      )}
      
      {/* Not Enrolled Courses Section */}
      {notEnrolledCourses && notEnrolledCourses.length > 0 && (
        <>
          <div className="flex flex-col gap-y-1">
            {notEnrolledCourses.map(course => (
              <div
                key={course.courseId}
                className="px-3 py-2 hover:bg-[#0e1624] transition-colors duration-200 flex justify-between items-center"
              >
                <span
                  onClick={() => handleCourseClick(course)}
                  className="text-sm text-white hover:text-[var(--yellow)] cursor-pointer flex-grow"
                >
                  {course.title}
                </span>
                <button 
                  onClick={() => {
                    // Navigate to cart with courseId as URL parameter
                    router.push(`/mycart?courseId=${course.courseId}`);
                    setIsOpenBoxDropdown(false);
                  }}
                  className="text-[14px] text-white px-2 rounded border-2 border-[var(--neon-purple)] hover:bg-purple-900/30 transition-colors"
                >
                  Get
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      
      {(!enrolledCourses || enrolledCourses.length === 0) && (!notEnrolledCourses || notEnrolledCourses.length === 0) && (
        <p className="text-sm text-gray-400 text-center py-2">No courses available</p>
      )}
    </motion.div>
  );
};

const BoxComponentMobile = ({
  setOpenSidebar,
  profileMobile,
  icon,
  title,
  introductory,
  isEnrolled,
  course,
  show,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const boxRefMobile = useRef(null);
  const dispatch = useDispatch();

  // ... existing code ...

  const handleClick = () => {
    if (introductory) {
      router.push("/dashboard/introductory");
      setOpenSidebar(false);
    } else if (profileMobile) {
      router.push("/dashboard/profile");
      setOpenSidebar(false);
    } else if (isEnrolled && course) {
      dispatch(setSidebarTabIndex(0));
      dispatch(setCourseType(course.courseId));
      dispatch(setCourseId(course.courseId));
      router.push(`/dashboard/player-dashboard/${course.courseId}`);
      setOpenSidebar(false);
    } else if (course) {
      // Navigate to cart with courseId as URL parameter
      router.push(`/mycart?courseId=${course.courseId}`);
      setOpenSidebar(false);
    }
  };

  return (
    <div className="w-full" ref={boxRefMobile}>
      <div
        onClick={handleClick}
        className={`px-4 py-3 w-full flex flex-col bg-[#040C19] border-t border-x border-[var(--neon-purple,#C99BFD)]
          cursor-pointer relative ${isOpen ? "" : "border-b"}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-x-2 items-center">
            {icon}
            <span className="text-sm font-semibold">
              {show && !isOpen ? "" : title}
            </span>
          </div>

          {introductory ? (
            <span className="text-[9px] text-orange-300 rounded-sm bg-red-950 px-2 py-[1px] ml-2">
              Free
            </span>
          ) : isEnrolled ? (
            <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded">
            
            </span>
          ) : (
            !profileMobile && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent div click
                  router.push(`/mycart?courseId=${course.courseId}`);
                  setOpenSidebar(false);
                }}
                className="text-[10px] bg-[var(--neon-purple)] text-white px-2 py-0.5 rounded hover:bg-purple-600 transition-colors"
              >
                Get
              </button>
            )
          )}
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex justify-center">
          <NeonElipse />
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;