"use client";

import FAQSection from "@/components/landingPage/FAQSection";
import HeroSection from "@/components/landingPage/HeroSection";
import MainCarousel from "@/components/landingPage/MainCarousel";
import TutorialsSection from "@/components/landingPage/TutorialsSection";
import ModuleSection from "@/components/landingPage/ModuleSection";
import PlansSection from "@/components/landingPage/PlansSection";
import MentorsSection from "@/components/landingPage/MentorsSection";
import CertificateSection from "@/components/landingPage/CertificateSection";
import PageLoader from "@/components/common/PageLoader";
import {
  useGetCertificateQuery, useGetCurriculumQuery,
  useGetFaqQuery, useGetHeroSectionQuery, useGetLandingCarouselQuery,
  useGetLatestTutorialQuery, useGetMentorDataQuery,
  useGetModuleQuery, useGetPlanDataQuery
} from "@/store/Api/home";

import { publicIpv4 } from 'public-ip'
import ipLocation from "iplocation";


export default function Home() {

  const { data: heroSection, isLoading: heroLoading } = useGetHeroSectionQuery();
  const { data: carouselSection, isLoading: carouselLoading } = useGetLandingCarouselQuery();
  const { data: latestTutorialSection, isLoading: latestTutorialLoading } = useGetLatestTutorialQuery();
  const { data: curriculumSection, isLoading: curriculumLoading } = useGetCurriculumQuery();
  const { data: moduleSection, isloading: moduleLoading } = useGetModuleQuery();
  const { data: planSection, isLoading: planLoading } = useGetPlanDataQuery();
  const { data: mentorSection, isLoading: mentorLoading } = useGetMentorDataQuery();
  const { data: certificateSection, isLoading: certificateLoading } = useGetCertificateQuery();
  const { data: faqSection, isLoading: faqLoading } = useGetFaqQuery();

  const loading = heroLoading || faqLoading || certificateLoading || mentorLoading || planLoading || moduleLoading || curriculumLoading || latestTutorialLoading || carouselLoading

  return loading ? (
    <PageLoader />
    // <></>
  ) : (
    <div>
      <HeroSection data={heroSection?.data?.heroSection} />
      <MainCarousel data={carouselSection?.data?.carousals} />
      <TutorialsSection data={latestTutorialSection?.data?.tutorials} />
      <ModuleSection modules={moduleSection?.data?.modules} curriculum={curriculumSection?.data?.curriculum} />
      <PlansSection plans={planSection?.data?.plans} />
      <MentorsSection mentor={mentorSection?.data?.mentor} />
      <CertificateSection certificate={certificateSection?.data?.certificate} />
      <FAQSection faqs={faqSection?.data?.faqs} />
    </div>
  );
}
