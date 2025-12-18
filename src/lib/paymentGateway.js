"use client";

import { load } from "@cashfreepayments/cashfree-js";
import axios from "axios";
import { toast } from "react-toastify";

export const handleClick = async ({ planId, activePaymentGateway }) => {
  if (activePaymentGateway === "Cashfree") {
    let cashfree;
    var initializeSDK = async function () {
      cashfree = await load({
        mode: "production",
        // mode: "sandbox",
      });
    };
    initializeSDK();
    let sessionId;
    try {
      const res = await axios.post("/api/v1/order/cash-free", { courseId: planId });
      sessionId = res?.data?.data?.payment_session_id;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }

    let checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_self",
    };
    cashfree.checkout(checkoutOptions).then((result) => {
      if (result.error) {
        // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
        console.log(
          "User has closed the popup or there is some payment error, Check for Payment Status"
        );
        console.log(result.error);
      }
      if (result.redirect) {
        // This will be true when the payment redirection page couldnt be opened in the same window
        // This is an exceptional case only when the page is opened inside an inAppBrowser
        // In this case the customer will be redirected to return url once payment is completed
        console.log("Payment will be redirected");
      }
      if (result.paymentDetails) {
        // This will be called whenever the payment is completed irrespective of transaction status
        console.log("Payment has been completed, Check for Payment Status");
        console.log(result.paymentDetails.paymentMessage);
      }
    });
  } else {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    // Load Razorpay script if not already loaded
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Create order
    const response = await fetch("/api/v1/order/razor-pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: planId }),
    });
    const res = await response.json();
    if (!response.ok) {
      toast.error(res.message);
      return;
    }
    const {
      data: { order },
    } = res;

    // Fetch Razorpay key
    const response2 = await fetch("/api/v1/order/get-key");
    const { data } = await response2.json();
    const key_id = data?.key;

    const options = {
      key: key_id,
      amount: order.inr_price,
      currency: "INR",
      name: "Ravallusion",
      order_id: order.order_id,
      callback_url: "/api/v1/order/razor-pay/verify",
      theme: {
        color: "#C99BFD",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }
};
