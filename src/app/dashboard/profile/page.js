"use client"
import PersonalInfoCard from '@/components/dashboard/PersonalInfoCard'
import BookmarkVideos from '@/components/profile/BookmarkVideos'
import MobileProfileHeader, { MobileProfileSidebar } from '@/components/profile/MobileProfileSidebar'
import MyAssignment from '@/components/profile/MyAssignment'
import MyLearning from '@/components/profile/MyLearning'
import MySubscription from '@/components/profile/MySubscription'
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import Settings from '@/components/profile/Settings'
import { AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'

const Page = () => {
    const [activeItem, setActiveItem] = useState("Personal Information");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [isOpenLogout, setIsOpenLogout] = useState(false);


    return (
        <div className='lg:mt-7 w-full flex flex-col lg:flex-row gap-x-6'>
            <div className='hidden lg:block'>
                <ProfileSidebar
                    setShowMobileSidebar={setShowMobileSidebar}
                    isOpenLogout={isOpenLogout}
                    setIsOpenLogout={setIsOpenLogout}
                    activeItem={activeItem} setActiveItem={setActiveItem} />
            </div>
            <div className='lg:hidden'>
                <MobileProfileHeader title={activeItem} setShowMobileSidebar={setShowMobileSidebar} />
            </div>

            <div className='h-full w-full rounded-xl px-3 md:px-0'>
                {
                    activeItem === "Personal Information" &&
                    <PersonalInfoCard />
                }
                {
                    activeItem === "My Subscription" &&
                    <MySubscription />
                }
                {
                    activeItem === "My Assignments" &&
                    <MyAssignment />
                }
                   {
                    activeItem === "My Learnings" &&
                    <MyLearning />
                }
                {
                    activeItem === "Bookmarked Videos" &&
                    <BookmarkVideos />
                }
                {
                    activeItem === "Settings" &&
                    <Settings />
                }
            </div>

            <AnimatePresence>
                {
                    showMobileSidebar &&
                    <MobileProfileSidebar
                        setIsOpenLogout={setIsOpenLogout}
                        setShowMobileSidebar={setShowMobileSidebar}
                        activeItem={activeItem} setActiveItem={setActiveItem} />
                }
            </AnimatePresence>


        </div>
    )
}

export default Page;




















// "use client"
// import React from 'react'
// import AssignmentSubmitList from '@/components/dashboard/AssignmentSubmitList';
// import CourseDashboard from '@/components/dashboard/CourseDashboard';

// const page = () => {

//     return (

//         <div className={` p-4 md:p-0 md:mt-6 grid grid-cols-12`}>

//             <CourseDashboard />

//             {/* Assignment submission data */}
//             <AssignmentSubmitList />

//         </div>

//     )
// }
// export default page;
