"use client";

import LandingContainer from "@/components/common/LandingContainer";
import PageLoader from "@/components/common/PageLoader";
import StaticHeader from "@/components/landingPage/StaticHeader";
import { useGetRefundPolicyQuery } from "@/store/Api/home";
import EnrollmentForm from "@/components/landingPage/EnrollmentForm";
const list = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Enrollment Form",
    link: "/enrollment-form",
  },
];

const EnrollmentPage = () => {
  const { data, isLoading } = useGetRefundPolicyQuery();

  const heading = "Ready to Expand your skills?";
 
  const subHeading = (
    <>Fill out the form below to connect with our team. We’ll guide you through course options, schedules, and how to get started with your dream career in design.</>
  );
  return isLoading ? <PageLoader /> : (
    <LandingContainer className="flex flex-col items-center !h-fit" bg2={true}>
      <StaticHeader list={list} heading={heading} subHeading={subHeading} />
      
        <EnrollmentForm />
    </LandingContainer>
  );
};

export default EnrollmentPage;
