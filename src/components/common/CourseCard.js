import { CrossIcon, Like, Views } from "@/lib/svg_icons";
import Image from "next/image";
import Card from "./Card";
import VideoPlayer from "../dashboard/VideoPlayer";
import CustomDialog from "./CustomDialog";
import { useState } from "react";

const CourseCard = ({ course }) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const { title, description, videoUrl, thumbnailUrl } = course?.video;


  const handleOpenDialog = () => {
    // Store the scroll position when opening the dialog
    window.lastDialogScrollPosition = window.scrollY;
    setIsCustomOpen((prev) => !prev);
  };
  return (
    <>
      <Card className={"group cursor-pointer hover:scale-95 hover:rotate-1 relative h-[290px] 2xl:h-[330px]"} onClick={handleOpenDialog}>
        <Image
          src={thumbnailUrl}
          alt={title}
          width={1000}
          height={1000}
          className="w-full h-40 2xl:!h-48 object-cover rounded-2xl"
        />



        <div className="flex flex-col gap-2 2xl:gap-4 h-auto">
          <div>
            <div className="h-auto">
              <h3 className="text-lg xl:text-xl font-medium leading-tight line-clamp-2">{title}</h3>
            </div>

            <div className="mt-2">
              <p className="text-gray-400 text-xs 2xl:text-base line-clamp-2">{description}</p>
            </div>
          </div>

          {/* <div className="absolute bottom-3">
          <span className="flex items-center space-x-1 text-xs 2xl:text-base text-gray-400">
            <Views />
            <span>{"270k"}</span>
          </span>
        </div> */}
        </div>

      </Card >

   <CustomDialog
  open={isCustomOpen}
  close={() => setIsCustomOpen((prev) => !prev)}
  variant="latest-video" // this applies the custom size
>
  <LatestTutorialVideo
    videoUrl={videoUrl}
    thumbnailUrl={thumbnailUrl}
    setIsCustomOpen={setIsCustomOpen}
    isCustomOpen={isCustomOpen}
  />
</CustomDialog>
    </>
  );
};

const LatestTutorialVideo = ({ videoUrl, thumbnailUrl, setIsCustomOpen }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full flex items-center justify-center border-2 border-gray-500 backdrop-blur-lg rounded-xl overflow-hidden mt-2 ">
        <button className="flex items-center justify-center outline-none absolute top-1 right-2 z-50 rounded-full border border-gray-300"
          onClick={(e) => { setIsCustomOpen((prev) => !prev); e.stopPropagation() }}>
          <CrossIcon width={24} height={24} />
        </button>
        <div className="w-[300px] md:w-full h-auto relative">
          <VideoPlayer source={videoUrl} poster={thumbnailUrl} latestVideo={true} iscourse={false} />
        </div>
      </div>
    </div>
  )
}

export default CourseCard;
