'use client';

import React from 'react';
import { useGetPlanDataQuery } from '@/store/Api/home';
import { SimpleLoader } from '../common/LoadingSpinner';
import { DevicesIcon, VideoIcon } from '@/lib/svg_icons';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPlanId,
  setPlanPrice,
  setPlanType,
  setUsdPrice,
} from '@/store/slice/general';
import { toast } from 'react-toastify';
import { useGetActivePaymentGatewayQuery } from '@/store/Api/auth';
import { LoaderCircle } from 'lucide-react';
import { SubmitButton } from '../common/CustomButton';
import { Button } from '../ui/button';
import { handleClick } from '@/lib/paymentGateway';

const UpgradePlan = () => {
  const { data, isLoading: planLoading } = useGetPlanDataQuery();
  const plans = data?.data?.plans || [];
  const advancedPlan = plans.find(
    (plan) =>
      plan.plan_type?.toLowerCase() === 'advanced' ||
      plan.plan_type?.toLowerCase() === 'advance'
  );
  const isIndia = useSelector((state) => state.general.isIndia);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const { data: gatewayData, isLoading: loadingGateway } =
    useGetActivePaymentGatewayQuery();
  const activePaymentGateway = gatewayData?.data?.activeGateways[0];

  const getValidity = (daysInSeconds) => {
    const days = daysInSeconds / (60 * 60 * 24);
    switch (days) {
      case 365:
        return 'One year validity';
      case 180:
        return 'Six months validity';
      case 730:
        return 'Two years validity';
      default:
        return '';
    }
  };

  if (planLoading) return <SimpleLoader />;

  if (!advancedPlan) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 rounded-[28px] bg-[var(--card-bg)] backdrop-blur-lg mb-4 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-2">No Advanced Plan Found</h2>
        <p className="text-gray-400">Please contact support or try again later.</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    setIsLoading(true);
    if (!activePaymentGateway || !advancedPlan?._id) {
      toast.error('Payment gateway not found or plan ID is missing.');
      setIsLoading(false);
      return;
    }
    try {
      await handleClick({ planId: advancedPlan._id, activePaymentGateway });
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-20 ">
      <div className="w-full max-w-2xl rounded-[32px] bg-[#0D213D59] p-0  relative overflow-hidden">
        {/* Back Button */}
        <button
          className="absolute top-8 left-8 flex items-center text-white text-lg font-medium opacity-80 hover:opacity-100 z-10"
          onClick={() => router.back()}
        >
          <svg width="28" height="28" fill="none" className="mr-1">
            <path
              d="M18 22L10 14L18 6"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        {/* Title & Subtitle */}
        <div className="pt-16 pb-2 text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Upgrade to Advanced
          </h2>
          <p className="text-gray-300 text-lg">
            Upgrade to get More Advanced course
          </p>
        </div>

        {/* Plan Card */}
        <div className="mt-10 mx-6 bg-[#17203A] rounded-2xl px-8 py-7 shadow-inner">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">Plan</div>
              <div className="text-2xl font-semibold text-yellow-400">
                Advance
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Price</div>
              <div className="text-2xl font-bold text-white">
                {isIndia
                  ? `₹${advancedPlan.inr_price}`
                  : `$${advancedPlan.usd_price}`}
              </div>
            </div>
          </div>
          <hr className="border-[#232B3B] mb-4" />
          <div className="flex flex-row justify-between gap-y-6">
            <div className="flex flex-col items-center w-1/4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#232B3B] border border-[#3A4664] text-white font-bold text-sm">
                x1
              </span>
              <span className="mt-2 text-xs text-gray-300 text-center">
                Watch on 1 device
              </span>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <svg width="28" height="28" fill="none" className="mx-auto">
                <circle
                  cx="14"
                  cy="14"
                  r="13"
                  stroke="#3A4664"
                  strokeWidth="2"
                  fill="#232B3B"
                />
                <path
                  d="M10 14l3 3 5-5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="mt-2 text-xs text-gray-300 text-center">
                Access to all content
              </span>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <svg width="28" height="28" fill="none" className="mx-auto">
                <rect
                  x="5"
                  y="9"
                  width="18"
                  height="10"
                  rx="2"
                  fill="#232B3B"
                  stroke="#3A4664"
                  strokeWidth="2"
                />
                <rect x="12" y="13" width="4" height="2" rx="1" fill="#fff" />
              </svg>
              <span className="mt-2 text-xs text-gray-300 text-center">
                Standard FHD quality
              </span>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <svg width="28" height="28" fill="none" className="mx-auto">
                <rect
                  x="4"
                  y="8"
                  width="20"
                  height="12"
                  rx="3"
                  fill="#232B3B"
                  stroke="#3A4664"
                  strokeWidth="2"
                />
                <rect x="8" y="20" width="12" height="2" rx="1" fill="#3A4664" />
                <rect
                  x="7"
                  y="10"
                  width="14"
                  height="8"
                  rx="2"
                  fill="#232B3B"
                  stroke="#3A4664"
                  strokeWidth="1"
                />
              </svg>
              <span className="mt-2 text-xs text-gray-300 text-center">
                Watch on Laptop, Mobile, Tab and ipad
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <div className="px-6 pb-8 pt-10">
          <Button
            className="w-full py-6 rounded-xl bg-gradient-to-r from-[#5B7CFA] to-[#A07CFA] text-white font-semibold text-lg shadow-lg transition hover:from-[#7C5BFA] hover:to-[#7CA0FA]"
            disabled={isLoading}
            onClick={handleCheckout}
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin !h-8 !w-8" />
            ) : (
              'Upgrade'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;