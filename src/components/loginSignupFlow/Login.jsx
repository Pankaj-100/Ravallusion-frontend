'use client';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { SubmitButton } from '../common/CustomButton';
import { Button } from '../ui/button';
import SubscriptionDetails from './SubscriptionDetails';
import { AppleIcon, GoogleIcon } from '@/lib/svg_icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyHasSubscriptionQuery, useSigninMutation, useSwitchDeviceMutation } from '@/store/Api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { setUserId, setSigninEmail, setIsNewUser, setkeepMeSignedIn, setHasSubscription } from '@/store/slice/signInStates';
import { useGoogleLogin } from '@react-oauth/google';
import CustomDialog from '../common/CustomDialog';
import LogoutDialog from './LogoutDialog';
import { LoaderCircle } from 'lucide-react';

const Login = () => {
    const route = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isOpenLogout, setIsOpenLogout] = useState(false);

    const { planId, planType, planPrice } = useSelector((state) => state.general);
    const isChecked = useSelector((state) => state.signInState.keepMeSignedIn);
    const [hasSubscription] = useLazyHasSubscriptionQuery();
    const [signin, { isLoading }] = useSigninMutation();
    const [switchDevice, { isLoading: switchDeviceLoading }] = useSwitchDeviceMutation();

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        // Clear error if the email becomes valid
        if (isValidEmail(value)) {
            setEmailError('');
        }
    };

    const handleEmailBlur = () => {
        if (!email) {
            setEmailError('Please enter your email');
        } else if (!isValidEmail(email)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!email || !isValidEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }

        try {
            const response = await signin({ email }).unwrap();
            dispatch(setSigninEmail(email));
            const userId = response?.data?.user?._id;
            dispatch(setUserId(userId));
            dispatch(setIsNewUser(response?.data?.isNewUser));

            const subs = await hasSubscription(userId);
            const hasPlan = subs?.data?.data?.hasSubscription;
            dispatch(setHasSubscription(hasPlan));

           // toast.success(response?.message);
             toast.success("OTP sent to your registered email.");
            route.push('/verify-otp');
        } catch (err) {
            console.error("API Call Failed:", err);
            toast.error("Invalid Email! Please try again.");
        }
    };

    const handleSwitchDevice = async () => {
        try {
            await switchDevice();
            setIsOpenLogout(false);
            route.refresh('/login');
        } catch (error) {
            console.error("Error switching device:", error);
            toast.error(error?.data?.message || "Failed to switch device. Please try again.");
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (response) => {
            const res = await fetch("/api/v1/user/google-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ googleToken: response.access_token }),
            });

            const data = await res.json();

            if (res.status === 409) {
                setIsOpenLogout(true);
                return;
            }

            const userId = data?.data?.user?._id;
            const subs = await hasSubscription(userId);
            const hasPlan = subs?.data?.data?.hasSubscription;

            if (hasPlan) {
                route.push('/dashboard');
            } else if (!hasPlan && planId) {
                route.push(`/mycart?planId=${planId}&planType=${planType}&price=${planPrice}`);
            } else {
                route.push(`/subscription-plan`);
            }
        },
        onError: (error) => {
            console.log("Login Failed:", error);
            toast.error(error.message || "Login failed. Please try again.");
        }
    });

    return (
        <>
            <div className={`w-full sm:min-w-[500px] sm:w-auto ${planId && "mt-40 md:mt-20 min-h-[750px] sm:min-h-[500px] lg:min-h-[500px]"}`}>
                {planId && (
                    <SubscriptionDetails price={planPrice} courseType={planType} />
                )}

                <div className='mx-4 px-4 py-5 lg:p-10 rounded-[28px] bg-[var(--card-bg)] backdrop-blur-lg mt-4'>
                    <h2 className='text-center text-2xl md:text-[2.13rem] font-bold mb-[30px]'>Login to continue</h2>

                    <form onSubmit={handleSignIn}>
                        <div className='mb-4'>
                            <label className='text-gray-100 text-sm mb-[6px]' htmlFor="email">
                                Your Email Id <span className='text-red-500'>*</span>
                            </label>
                            <Input
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                                type="email"
                                placeholder="John@gmail.com"
                                name="email"
                                className={`w-full py-5 px-3 border-2 rounded-[12px] mt-1 input-shadow ${emailError ? 'border-red-500' : 'border-gray-500'}`}
                            />
                            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                        </div>

                        <div className='flex gap-x-2 items-center mb-5'>
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => dispatch(setkeepMeSignedIn(!isChecked))}
                                className="border-2 border-[var(--neon-purple,#C99BFD)] data-[state=checked]:bg-[var(--neon-purple)]"
                            />
                            <p className='text-sm'>Keep me signed in</p>
                        </div>

                        <SubmitButton
                            className="w-full mb-[30px] text-md"
                            onClick={handleSignIn}
                            disabled={isLoading || !!emailError || !email}
                        >
                            {isLoading ? <LoaderCircle className='animate-spin !h-8 !w-8' /> : "Continue"}
                        </SubmitButton>
                    </form>

                    <div className="flex items-center mb-[30px]">
                        <div className="flex-1 relative">
                            <div className="absolute top-1/2 left-0 right-0 border-t border-transparent">
                                <div className="h-px bg-gradient-to-l from-white via-gray-400 to-black"></div>
                            </div>
                        </div>
                        <span className="mx-4 text-gray-100">Or</span>
                        <div className="flex-1 relative">
                            <div className="absolute top-1/2 left-0 right-0 border-t border-transparent">
                                <div className="h-px bg-gradient-to-r from-white via-gray-400 to-black"></div>
                            </div>
                        </div>
                    </div>

                    <div className='flex md:flex-row gap-x-4 flex-col gap-y-4'>
                        <Button variant="neonOutline" className="py-6 rounded-[12px] w-full" onClick={() => googleLogin()}>
                            <GoogleIcon />
                            Continue with Google
                        </Button>
                        {/* <Button variant="neonOutline" className="py-6 rounded-[12px]">
                            <AppleIcon />
                            Continue with Apple
                        </Button> */}
                    </div>
                </div>
            </div>

            <CustomDialog open={isOpenLogout} close={() => setIsOpenLogout(false)}>
                <LogoutDialog setIsOpenLogout={setIsOpenLogout} onClick={handleSwitchDevice} switchDeviceLoading={switchDeviceLoading} />
            </CustomDialog>
        </>
    );
};

export default Login;
