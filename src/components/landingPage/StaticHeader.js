import React from "react";
import CustomBreadcrum from "../common/CustomBreadcrum";

const StaticHeader = ({ list, heading, subHeading, className }) => {
  return (
    <div
      className={
        "pt-40 pb-9 md:pb-[3.75rem] flex flex-col gap-5 items-center " +
        className
      }
    >
      <CustomBreadcrum list={list} />
      <div className="flex flex-col gap-4 items-center">
        <div className="text-[32px] md:text-5xl  font-bold sm:w-[20rem] md:w-[32rem] text-center flex justify-center">
          {heading}
        </div>
        {subHeading && (
          // <div
          //   className={`text-base md:text-lg !text-center text-[var(--light-gray)] px-8 sm:px-20 xl:px-36  
          //       ${
          //         heading.props.children === "Terms and Condition"
          //           ? "  !px-0"
          //           : ""
          //       }`
          //     }
          // >
          <div
            className={`text-base md:text-lg !text-center text-[var(--light-gray)] px-8 sm:px-20 xl:px-36`}
          >
            {subHeading}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticHeader;
