"use client"
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useGetUserDetailQuery } from "@/store/Api/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const route = useRouter();
  const { data, isLoading } = useGetUserDetailQuery();
  useEffect(() => {
  
    if (!data?.data?.user?.hasSubscription && !isLoading) {
      route.push('/subscription-plan');
    }
  }, [isLoading,data])
  return (
    <div className="min-h-screen bg-[var(--Surface)]">
      <div className=" md:h-16 xl:h-10" />

      <div className="sticky top-0 z-50 md:px-20 xl:px-20 bg-[var(--Surface)]">
        <DashboardNavbar />
      </div>


      <div className=" md:px-20 xl:px-15 pb-2">
        {children}
      </div>
    </div>
  );
}
