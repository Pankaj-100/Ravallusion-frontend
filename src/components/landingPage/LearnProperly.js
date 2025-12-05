import LandingContainer from "../common/LandingContainer";
import CoursesList from "../common/CoursesList";

const LearnProperly = ({data}) => {
  return (
    <LandingContainer className="!h-fit flex flex-col gap-10 px-8 sm:mt-[-30px]">
      <div className="flex justify-center items-center flex-wrap gap-4">
        <div>
      
        </div>
        {/* <CustomButton className="!p-5 !py-6 !text-base 2xl:!text-lg !rounded-lg">
          Get more videos <ArrowRight />
        </CustomButton> */}
      </div>
        <CoursesList data={data} />
    </LandingContainer>
  );
};

export default LearnProperly;
