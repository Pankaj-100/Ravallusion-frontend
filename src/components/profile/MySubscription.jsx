import { CrownIcon } from '@/lib/svg_icons'
import React from 'react'
import SubscriptionDetails from '../loginSignupFlow/SubscriptionDetails'
import Link from 'next/link'
import { SimpleLoader } from '../common/LoadingSpinner'
import { useGetSubscriptionDetailQuery } from '@/store/Api/course'

const MySubscription = () => {
    const { data, isLoading } = useGetSubscriptionDetailQuery();
   const plantype =data?.data?.subscriptionDetails?.planType;


    return isLoading ? <div className='flex items-center justify-center min-h-[70vh]'><SimpleLoader /></div> :  (
        <div className='pt-4 lg:pt-0'>
            <h2 className='text-lg font-semibold'>My Subscription</h2>

            <div className={"my-9"}>
               {plantype=="Beginner"?      <UpgradePlan /> : ""}
          
            </div>

            <div>
                <SubscriptionDetails profile={true} data={data} />
            </div>

        </div>
    )
}

const UpgradePlan = () => {
    return (
        <div
            style={{
                background: `linear-gradient(90deg, rgba(0, 0, 0, 0.00) 21.35%, rgba(133, 116, 246, 0.35) 100%), 
                         linear-gradient(180deg, rgba(201, 155, 253, 0.10) 0%, rgba(133, 116, 246, 0.10) 100%)`,
                boxShadow: `-4px -2px 10.1px 0px rgba(255, 255, 255, 0.10) inset, 2px 4px 11.9px 0px rgba(255, 255, 255, 0.10) inset`

            }}
            className='backdrop-blur-lg cursor-pointer p-4 md:p-8 flex items-center  rounded-xl border border-gray-600 gap-x-4'>
            <div
                style={{ background: "linear-gradient(180deg, rgba(201, 155, 253, 0.25) 0%, rgba(133, 116, 246, 0.25) 100%)" }}
                className='w-14 h-14 flex-shrink-0 rounded-lg border border-gray-400 flex items-center justify-center'>
                <CrownIcon />
            </div>

            <div className='w-full'>
                <h2 className='text-sm md:text-lg font-semibold'>Join Advanced course</h2>
                <p className='text-[9px] md:text-xs text-gray-200'>Upgrade your plan to Advanced to get Advance courses</p>
            </div>

            <div className=' bg-[var(--Surface)] backdrop-blur-lg border border-[var(--neon-purple)] px-5 py-2 rounded-lg flex items-center justify-center'>
                <Link href={'/subscription-plan'} className='text-sm md:text-lg font-medium'>Upgrade</Link>
            </div>

        </div >
    )
}

export default MySubscription;