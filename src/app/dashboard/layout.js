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
      <div className=" md:h-2 xl:h-2" />

      <div className="sticky top-0 z-50 md:px-2 xl:px-1 pb-2 bg-[var(--Surface)]">
        <DashboardNavbar />
      </div>


      <div className=" md:px-2 xl:px-6 pb-2">
        {children}
      </div>
    </div>
  );
}
