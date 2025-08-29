"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionDetails from "./SubscriptionDetails";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { SubmitButton } from "../common/CustomButton";
import { handleClick } from "@/lib/paymentGateway";
import { useGetActivePaymentGatewayQuery } from "@/store/Api/auth";
import { toast } from "react-toastify";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import axios from "axios";
import { useSelector } from "react-redux";
import InvoiceDetail from "./InvoiceDetail"; // 👈 import your modal

const MyCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false); // 👈 new state
  const [proceedPayment, setProceedPayment] = useState(false); // 👈 to trigger payment after invoice

  const isIndia = useSelector((state) => state.general.isIndia);

  const { data } = useGetActivePaymentGatewayQuery();
  const activePaymentGateway = data?.data?.activeGateways[0];

  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get("planId");
  const courseType = params.get("planType");
  const price = params.get("price");
  const usd_price = params.get("usdPrice");

  const handleCheckout = async () => {
    setIsLoading(true);
    if (!activePaymentGateway || !planId) {
      toast.error("Payment gateway not found or plan ID is missing.");
      setIsLoading(false);
      return;
    }
    try {
      await handleClick({ planId, activePaymentGateway });
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const paypalCreateOrder = async () => {
    try {
      let response = await axios.post("/api/v1/order/paypal", {
        plan: planId,
      });
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

  return (
    <>
      {/* Invoice Modal */}
      <InvoiceDetail
        open={showInvoice}
        setOpen={(val) => {
          setShowInvoice(val);
          if (!val && proceedPayment) {
            // proceed to payment only after invoice modal closes successfully
            handleCheckout();
            setProceedPayment(false);
          }
        }}
      />

      <div className="w-full p-5 sm:p-10 rounded-[28px] bg-[var(--card-bg)] backdrop-blur-lg sm:min-w-[500px]">
        <Button
          variant="default"
          className="bg-transparent hover:bg-[var(--navy-blue)]  mb-[20px] -ml-4"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Back
        </Button>

        <h2 className="text-center text-3xl font-semibold mb-[20px]">My Cart</h2>

        <SubscriptionDetails
          courseType={courseType}
          price={price}
          usd_price={usd_price}
          cart={true}
          isIndia={isIndia}
        />

        {isIndia ? (
          <SubmitButton
            disabled={isLoading}
            className={"w-full rounded-[12px] text-md mt-4"}
            onClick={() => {
              // instead of direct checkout → show invoice first
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
                style={{
                  color: "gold",
                  shape: "rect",
                  label: "pay",
                  height: 50,
                }}
                createOrder={async () => {
                  // open invoice first
                  setProceedPayment(true);
                  setShowInvoice(true);
                  return ""; // PayPal requires a string, will be replaced after invoice
                }}
                onApprove={async (data) => {
                  await paypalCaptureOrder(data.orderID);
                }}
              />
            </div>
          </PayPalScriptProvider>
        )}
      </div>
    </>
  );
};

export default MyCart;
