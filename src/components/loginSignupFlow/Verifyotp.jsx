"use client"
import React, { useState, useEffect } from "react";
import OTPInput from "../ui/otpInput";
import { SubmitButton } from "../common/CustomButton";
import { Button } from "../ui/button";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSigninMutation, useSwitchDeviceMutation, useVerifyUserMutation } from "@/store/Api/auth";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CustomDialog from "../common/CustomDialog";
import LogoutDialog from "./LogoutDialog";

const VerifyOtp = () => {
    const { signinEmail, userId, isNewUser, keepMeSignedIn, hasSubscription } = useSelector((state) => state.signInState);
    const { planId, planType, planPrice,usdPrice} = useSelector((state) => state.general);
    const [isOpenLogout, setIsOpenLogout] = useState(false);
    const route = useRouter();

    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(90);
    const [canResend, setCanResend] = useState(false);

    const [verifyUser, { isLoading }] = useVerifyUserMutation();
    const [signin, { isLoading: isResending }] = useSigninMutation();
    const [switchDevice, { isLoading: switchDeviceLoading }] = useSwitchDeviceMutation();

    // Countdown timer logic
    useEffect(() => {
        let countdown;
        if (timer > 0) {
            countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setCanResend(true);
            clearInterval(countdown);
        }
        return () => clearInterval(countdown);
    }, [timer]);

    const handleVerifyUser = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        try {

            const type = isNewUser ? "account_verification" : "two_step_auth";

            const response = await verifyUser({ otp, email: signinEmail, type, userId, keepMeSignedIn }).unwrap();

            if (hasSubscription) {
                router.push("/dashboard");
            }
            else if (!hasSubscription && planId) {
                router.push(`/mycart?courseId=${planId}&planType=${planType}&price=${planPrice}`);
            }
            else{
                router.push("/subscription-plan");
            }

        } catch (err) {
            if (err?.status == 409) {
                setIsOpenLogout(true);
            }
            toast.error(err?.data?.message);
        }
    };


    const handleSwitchDevice = async () => {
        try {
            const res = await switchDevice()
            setIsOpenLogout(false);
            route.refresh('/verify-otp');

        } catch (error) {
            console.error("Error switching device:", error);
            toast.error( error?.data?.message||"Failed to switch device. Please try again.");
        }
    };

    const handleResendOtp = async () => {
        try {
            setTimer(90); // Reset timer
            setCanResend(false);
            await signin({ email: signinEmail }).unwrap();
        } catch (error) {
            console.error("Resend OTP Failed:", error);
            toast.error(error?.data?.message || "Failed to resend OTP. Please try again.");
        }
    };

    return (
        <>
            <div className="mx-4 p-10 rounded-[28px] bg-[var(--card-bg)] backdrop-blur-lg mt-28">
                <Button variant="default" className="bg-transparent hover:bg-[var(--navy-blue)] mb-[30px] -ml-4" onClick={() => router.push("/login")}>
                    <ArrowLeft /> Back
                </Button>
                <h2 className="text-center text-3xl font-bold mb-[30px]">Verify OTP</h2>

                <div className="mb-[30px]">
                    <p className="text-sm text-center">Please enter the OTP sent to your email</p>
                    <p className="text-sm text-center">
                        {signinEmail}
                        <span className="text-orange-300 underline ml-2 cursor-pointer" onClick={() => router.push("/login")}>
                            Change
                        </span>
                    </p>
                </div>

                <OTPInput onComplete={(otp) => setOtp(otp)} />

                <p className="text-center text-sm my-[30px]">
                    {timer > 0 && !isResending ? (
                        <>
                            <span className="text-orange-300 ">Resend in</span>  {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
                        </>
                    ) : (
                        <span className="underline text-orange-300 ml-1 cursor-pointer" onClick={handleResendOtp} disabled={!canResend || isResending}>
                            {isResending ? "Resending..." : "Resend"}
                        </span>
                    )}
                </p>

                <SubmitButton className={`w-full rounded-[12px] text-md`} onClick={handleVerifyUser} disabled={!otp || isLoading}>
                    {isLoading ?<LoaderCircle className='animate-spin !h-8 !w-8' /> : "Verify OTP"}
                </SubmitButton>


                <CustomDialog open={isOpenLogout} close={() => setIsOpenLogout(false)}>
                    <LogoutDialog setIsOpenLogout={setIsOpenLogout} onClick={handleSwitchDevice} switchDeviceLoading={switchDeviceLoading} />
                </CustomDialog>
            </div >
        </>
    );
};

export default VerifyOtp;
