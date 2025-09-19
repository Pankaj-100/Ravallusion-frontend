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
import { setSidebarTabIndex,setCourseType,setShouldPlayFirstVideo } from  "@/store/slice/general";

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
    } else if (
      pathname === "/dashboard/player-dashboard/[advanced]" ||
      "/dashboard/player-dashboard/[beginner]"
    ) {
      setShow(true);
      setUrlPath("playerDashboard");
    } else {
      setShow(true);
    }
  }, [pathname]);

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
                {/* <h1 className="text-lg font-semibold mb-1">Opening file</h1> */}
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

      <div className="flex gap-x-1 items-center my-auto">
        {urlpath != "search" && (
          <div
            className="p-3 border border-gray-600 relative cursor-pointer"
            onClick={() => {
              setSearchDialog(true), dispatch(setSearchValue(""));
            }}
          >
            <EllipseOfSearch />
            <SearchIcon size={24} />
          </div>
        )}

        <div className="hidden lg:flex gap-x-2">
          <BoxComponent
            show={show}
            icon={<CrownIcon />}
            title={" VFX "}
            title1={"Photoshop"}
            title2={"Premier pro"}
            href={"/dashboard/player-dashboard/advanced"}
          />

          <BoxComponent
            show={show}
            icon={<Gear />}
            title={"Editorial"}
            title1={"Photoshop"}
            title2={"Premier pro"}
            href={"/dashboard/player-dashboard/beginner"}
          />

          <BoxComponent
            show={show}
            icon={<BulbIcon />}
            title={"Learn Properly"}
            introductory={true}
            href={"/dashboard/introductory"}
          />
        </div>

        <YourProgress />

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

const SideBar = ({ openSidebar, setOpenSidebar, avatar }) => {
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
        className="absolute bg-[var(--Surface)] w-72 pt-12 pb-8 px-4 h-screen top-0 left-0 z-20 lg:hidden"
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
          <BoxComponentMobile
            setOpenSidebar={setOpenSidebar}
            href={"/dashboard/player-dashboard/advanced"}
            show={show}
            icon={<CrownIcon />}
            title={"VFX"}
            title1={"Photoshop"}
            title2={"Premier pro"}
          />
          <BoxComponentMobile
            setOpenSidebar={setOpenSidebar}
            href={"/dashboard/player-dashboard/beginner"}
            show={show}
            icon={<Gear />}
            title={"EDITORIAL"}
            title1={"Photoshop"}
            title2={"Premier pro"}
          />
          <BoxComponentMobile
            setOpenSidebar={setOpenSidebar}
            href={"/dashboard/introductory"}
            show={show}
            icon={<BulbIcon />}
            title={"Introductory"}
            introductory={true}
          />
          <BoxComponentMobile
            setOpenSidebar={setOpenSidebar}
            href={"/dashboard/profile"}
            show={show}
            icon={
              <div className="bg-gray-300  rounded-full w-6 h-6 relative">
                <Image
                  src={avatar || "/profilepic.jpeg"}
                  alt="Profile pic"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />{" "}
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
  title1,
  title2,
  show,
  href,
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
          href={href}
          title1={title1}
          title2={title2}
          setIsOpenBoxDropdown={setIsOpenBoxDropdown}
        />
      )}
    </div>
  );
};

const BoxDropdown = ({ title1, title2, href, setIsOpenBoxDropdown }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const handleClick = (title) => {
     dispatch(setSidebarTabIndex(0));
       dispatch(setCourseType(title === "Photoshop" ? "photoshop" : "premier-pro"));
    router.push(href);
    setIsOpenBoxDropdown(false);
  };
  return (
    <motion.div
      className="absolute top-full left-0 right-0 w-full border-x border-b border-[var(--neon-purple)] bg-[#040C19] px-4 py-2 z-10 overflow-hidden"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-y-1">
        <span
                onClick={() => handleClick(title1)}
          className="block px-3 py-2 text-md text-white hover:text-[var(--yellow)] hover:bg-[#0e1624] transition-colors duration-200 cursor-pointer"
        >
          {title1}
        </span>
        <span
                onClick={() => handleClick(title2)}
          className="block px-4 py-2 text-md text-white hover:text-[var(--yellow)] hover:bg-[#0e1624] transition-colors duration-200 cursor-pointer"
        >
          {title2}
        </span>
      </div>
    </motion.div>
  );
};

const BoxComponentMobile = ({
  setOpenSidebar,
  profileMobile,
  icon,
  title,
  introductory,
  title1,
  title2,
  show,
  href,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const boxRefMobile = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        boxRefMobile.current &&
        !boxRefMobile.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    if (introductory) {
      router.push("/dashboard/introductory");
      setOpenSidebar(false);
    } else if (profileMobile) {
      router.push("/dashboard/profile");
      setOpenSidebar(false);
    } else {
      setIsOpen((prev) => !prev);
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
          ) : (
            !profileMobile && (
              <div className="cursor-pointer ml-3">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </div>
            )
          )}
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex justify-center">
          <NeonElipse />
        </div>
      </div>

      {isOpen && (
        <BoxDropdownMobile
          title1={title1}
          title2={title2}
          href={href}
          setOpenSidebar={setOpenSidebar}
        />
      )}
    </div>
  );
};

const BoxDropdownMobile = ({ setOpenSidebar, title1, title2, href }) => {
  const router = useRouter();

  const handleClick = (path) => {
    router.push(path);
    setOpenSidebar(false);
  };

  return (
    <motion.div
      className="w-full border-x border-b border-[var(--neon-purple,#C99BFD)] bg-[#040C19] 
        px-4 py-2 flex flex-col gap-y-2 "
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <button
        className="text-xs text-white flex justify-between w-full"
        onClick={() => handleClick(href)}
      >
        {title1} <ArrowRight size={21} />
      </button>
      <button
        className="text-xs text-white flex justify-between w-full"
        onClick={() => handleClick(href)}
      >
        {title2} <ArrowRight size={21} />
      </button>
    </motion.div>
  );
};

export default DashboardNavbar;