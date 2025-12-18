"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionDetails from "./SubscriptionDetails";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { SubmitButton } from "../common/CustomButton";
import { handleClick } from "@/lib/paymentGateway";
import { useGetActivePaymentGatewayQuery } from "@/store/Api/auth";
import { useGetCourseByIdQuery } from "@/store/Api/courseslist"; // Import the API hook
import { toast } from "react-toastify";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import InvoiceDetail from "./InvoiceDetail";
import { clearPlanData, setPlanId, setPlanType, setPlanPrice, setUsdPrice, setCourseData } from "@/store/slice/general";

const MyCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [proceedPayment, setProceedPayment] = useState(false);

  const isIndia = useSelector((state) => state.general.isIndia);
  const planId = useSelector((state) => state.general.planId);
  const planType = useSelector((state) => state.general.planType);
  const planPrice = useSelector((state) => state.general.planPrice);
  const usdPrice = useSelector((state) => state.general.usdPrice);
  const reduxCourseData = useSelector((state) => state.general.courseData);

  const { data } = useGetActivePaymentGatewayQuery();
  const activePaymentGateway = data?.data?.activeGateways[0];
  const dispatch = useDispatch();

  const router = useRouter();
  const params = useSearchParams();
  
  // Get courseId from URL params
  const courseIdFromParams = params.get('courseId');
  
  // Determine which course ID to use (URL param takes priority)
  const effectiveCourseId = courseIdFromParams || planId;

  // Use the new API to fetch course details
  const { 
    data: apiResponse, 
    isLoading: isLoadingCourse,
    error: courseError
  } = useGetCourseByIdQuery(effectiveCourseId, {
    skip: !effectiveCourseId, // Skip if no course ID
  });

  // Get course data from API response
  const apiCourseData = apiResponse?.data?.course;

  // When API data loads, update Redux with the fresh data
  useEffect(() => {
    if (apiCourseData) {
      // Update Redux with fresh data from API
      dispatch(setPlanId(apiCourseData._id));
      dispatch(setPlanType(apiCourseData.title || apiCourseData.heading));
      dispatch(setPlanPrice(apiCourseData.inr_price));
      dispatch(setUsdPrice(apiCourseData.usd_price));
      dispatch(setCourseData(apiCourseData));
    }
  }, [apiCourseData, dispatch]);

  // Handle page load - if we have URL param but Redux is empty
  useEffect(() => {
    if (courseIdFromParams && !planId) {
      dispatch(setPlanId(courseIdFromParams));
    }
  }, [courseIdFromParams, planId, dispatch]);

  // Use API data if available, otherwise use existing Redux data
  const courseData = apiCourseData || reduxCourseData;

  const handleDeleteCourse = () => {
    dispatch(clearPlanData());
    toast.success("Course removed from cart");
    router.push('/subscription-plan');
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    if (!activePaymentGateway || !effectiveCourseId) {
      toast.error("Payment gateway not found or course ID is missing.");
      setIsLoading(false);
      return;
    }
    try {
      await handleClick({ planId: effectiveCourseId, activePaymentGateway });
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const paypalCreateOrder = async () => {
    try {
      let response = await axios.post("/api/v1/order/paypal", { plan: effectiveCourseId });
      return response.data.data.order.order_id;
    } catch (err) {
      toast.error(err.response?.data?.message || "Paypal order failed");
      return null;
    }
  };

  const paypalCaptureOrder = async (orderID) => {
    try {
      let response = await axios.post(`/api/v1/order/paypal/${orderID}`, {
        orderID,
      });
      if (response.data.success) {
        toast.success("Payment successful");
        router.push("/rajorpay-payment-success");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  // Show loading while fetching course from API
  if (isLoadingCourse && effectiveCourseId) {
    return (
      <div className="w-full p-5 sm:p-10 rounded-[28px] mt-32 bg-[var(--card-bg)] backdrop-blur-lg sm:min-w-[500px] flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoaderCircle className="animate-spin !h-12 !w-12 mx-auto mb-4" />
          <p className="text-gray-300">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Show error if API fails
  if (courseError && effectiveCourseId) {
    return (
      <div className="w-full p-5 sm:p-10 rounded-[28px] mt-32 bg-[var(--card-bg)] backdrop-blur-lg sm:min-w-[500px]">
        <Button
          variant="default"
          className="bg-transparent hover:bg-[var(--navy-blue)] mb-[20px] -ml-4"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Back
        </Button>

        <div className="text-center py-10">
          <p className="text-red-400 mb-4">Failed to load course details</p>
          <Button 
            onClick={() => router.push('/subscription-plan')}
          >
            Select Another Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <InvoiceDetail
        open={showInvoice}
        setOpen={setShowInvoice}
        onSuccess={() => {
          if (proceedPayment) {
            handleCheckout();
            setProceedPayment(false);
          }
        }}
      />

      <div className="w-full p-5 sm:p-10 rounded-[28px] mt-32 bg-[var(--card-bg)] backdrop-blur-lg sm:min-w-[500px]">
        <Button
          variant="default"
          className="bg-transparent hover:bg-[var(--navy-blue)] mb-[20px] -ml-4"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Back
        </Button>

        <h2 className="text-center text-3xl font-semibold mb-[20px]">My Cart</h2>

        {/* Show empty state if no course selected */}
        {!effectiveCourseId ? (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">No course selected</p>
            <Button 
              onClick={() => router.push('/subscription-plan')}
            >
              Browse Courses
            </Button>
          </div>
        ) : (
          <>
            <SubscriptionDetails
              courseType={courseData?.title || planType}
              price={courseData?.inr_price || planPrice}
              usd_price={courseData?.usd_price || usdPrice}
              cart={true}
              isIndia={isIndia}
              courseData={courseData} // This will have fresh API data with image and points
              onDelete={handleDeleteCourse}
            />

            {isIndia ? (
              <SubmitButton
                disabled={isLoading || !effectiveCourseId}
                className={`w-full rounded-[12px] text-md mt-4 ${!effectiveCourseId ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!effectiveCourseId) {
                    toast.error("Please select a course first");
                    return;
                  }
                  setProceedPayment(true);
                  setShowInvoice(true);
                }}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin !h-8 !w-8" />
                ) : (
                  "Checkout"
                )}
              </SubmitButton>
            ) : (
              <PayPalScriptProvider
                options={{
                  "client-id":
                    "AYcITR01g4NIxYbO4d4KmdLP4ub9C2AZLRrmcKJWAVb7DgRtejR2l_aqH7fhT9qLcTzudldUEYZhhvXY",
                  currency: "USD",
                  intent: "capture",
                }}
              >
                <div style={{ overflowY: "auto", maxHeight: "80vh" }}>
                  <PayPalButtons
                    style={{ color: "gold", shape: "rect", label: "pay", height: 50 }}
                    createOrder={async () => {
                      if (!effectiveCourseId) {
                        toast.error("Please select a course first");
                        return "";
                      }
                      setProceedPayment(true);
                      setShowInvoice(true);
                      return "";
                    }}
                    onApprove={async (data) => {
                      await paypalCaptureOrder(data.orderID);
                    }}
                  />
                </div>
              </PayPalScriptProvider>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MyCart;