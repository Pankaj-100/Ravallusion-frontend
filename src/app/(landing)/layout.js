"use client";
import Footer from "@/components/landingPage/Footer";
import { Toaster } from "@/components/ui/toaster";
import { setIsIndia } from "@/store/slice/general";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { publicIpv4 } from "public-ip";
import ipLocation from "iplocation";

export default function LandingLayout({ children }) {
  const isIndia = useSelector((state) => state.general.isIndia);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const ip = await publicIpv4();
        const data = await ipLocation(ip);
        console.log(data);
        if (data) {
          dispatch(setIsIndia(data?.country?.name === "India"));
          // dispatch(setIsIndia(false));
        }
      } catch (error) {
      
        console.error("Error fetching country:", error);
      }
    };
    fetchCountry();
  }, [isIndia]);

  return (
    <section className=" h-screen">
      {children}
      <Footer />
      <Toaster />
    </section>
  );
}
