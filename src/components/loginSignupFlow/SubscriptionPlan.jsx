'use client'

import React from 'react'
import Plans from '../common/Plans'
import { useGetPlanDataQuery } from '@/store/Api/home';
import { SimpleLoader } from '../common/LoadingSpinner';

// const plans = [
//     {
//         id: 1,
//         plan_type: "BEGINNER",
//         watch: "Watch on 1 device",
//         access: "Access to all content",
//         quality: "Standard FHD quality",
//         devices: "Watch on Laptop, Mobile, Tab and ipad",
//         inr_price: "5999",
//         validity: 31536000,
//     },
//     {
//         id: 2,
//         plan_type: "ADVANCED",
//         watch: "Watch on 1 device",
//         access: "Access to all content",
//         quality: "Standard FHD quality",
//         devices: "Watch on Laptop, Mobile, Tab and ipad",
//         inr_price: "9999",
//         validity: 31536000,
//     },
// ];


const SubscriptionPlan = () => {

    const { data, isLoading, error } = useGetPlanDataQuery();

    const plans = data?.data?.plans || [];

    return isLoading ? <SimpleLoader /> : (
        <div className='overflow-y-auto my-subscription mx-4 mt-20 md:mt-14 p-6 rounded-[28px] bg-[var(--card-bg)] backdrop-blur-lg mb-4'>
            <h2 className='text-center text-[34px] font-bold'>Select Subscription Plan</h2>
            <p className='text-[16px] text-center mb-[30px]'>Please Select subscription plan to Continue</p>

            <Plans plans={plans} showSkeleton={false} />

        </div>
    )
}
export default SubscriptionPlan;