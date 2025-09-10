"use client"
import { Assignment, CrownIcon, Logout, UserFilled, BookmarkBoldUnfilled, LogoutCard, CrownFilled, UserIcon, User, AssignmentFilled, BookmarkBold, SettingFilled } from '@/lib/svg_icons'
import { Settings } from 'lucide-react'
import React from 'react'
import CustomDialog from '../common/CustomDialog'
import AccountControlCard from '../dashboard/AccountControlCard'
import { useLogoutMutation } from '@/store/Api/auth'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Trophy } from "lucide-react";


const ProfileSidebar = ({ setActiveItem, activeItem, setIsOpenLogout, isOpenLogout, setShowMobileSidebar }) => {
    const route = useRouter();
    const [logout, { isLoading }] = useLogoutMutation();
    const handleLogout = async () => {
        try {
            const res = await logout().unwrap();
            const { success } = res;
            if (success) {
                route.push('/');
            }

        } catch (error) {
            console.log(error)
            toast.error(error?.data?.message);
        }
    }

    return (
        <div className=' w-72 bg-[var(--card)] h-full rounded-xl px-7 py-9 flex flex-col gap-5'>
            <MenuItem icon={<User />} icon1={<UserFilled />} title="Personal Information" activeItem={activeItem} setActiveItem={setActiveItem} setShowMobileSidebar={setShowMobileSidebar} />
            <MenuItem icon={<CrownIcon />} icon1={<CrownFilled />} title="My Subscription" activeItem={activeItem} setActiveItem={setActiveItem} setShowMobileSidebar={setShowMobileSidebar} />
            <MenuItem icon={<Assignment />} icon1={<AssignmentFilled />} title="My Assignments" activeItem={activeItem} setActiveItem={setActiveItem} setShowMobileSidebar={setShowMobileSidebar} />
             <MenuItem icon={<Trophy />} icon1={<Trophy />} title="My Learnings" activeItem={activeItem} setActiveItem={setActiveItem} setShowMobileSidebar={setShowMobileSidebar} />
            <MenuItem icon={<BookmarkBoldUnfilled />} icon1={<BookmarkBold width={25} height={25} />} title="Bookmarked Videos" activeItem={activeItem} setActiveItem={setActiveItem} setShowMobileSidebar={setShowMobileSidebar} />
            <MenuItem icon={<Settings />} icon1={<SettingFilled />} title="Settings" activeItem={activeItem} setActiveItem={setActiveItem} setShowMobileSidebar={setShowMobileSidebar} />
            <MenuItem icon={<Logout />} icon1={<Logout />} title="Logout" setIsOpenLogout={setIsOpenLogout} setShowMobileSidebar={setShowMobileSidebar} />

            <CustomDialog open={isOpenLogout} close={() => setIsOpenLogout(false)}>
                <AccountControlCard
                    onClick={handleLogout}
                    isLoading={isLoading}
                    onCancel={() => setIsOpenLogout(false)}
                    icon={<LogoutCard />}
                    title="Log Out"
                    text="Are you sure you want to logout ?"
                />
            </CustomDialog>
        </div>
    )
}

export const MenuItem = ({ icon, icon1, title,
    activeItem, setActiveItem, setIsOpenLogout,
    setShowMobileSidebar }) => {
    const isActive = activeItem === title;
    const handleActiveItem = () => {
        if (title == "Logout") {
            setIsOpenLogout(true);
            setShowMobileSidebar(false);
        }
        else {
            setActiveItem(title);
            setShowMobileSidebar(false);
        }
    }

    return (
        <div
            onClick={handleActiveItem}
            className={` flex items-center gap-x-3 p-3 rounded-lg cursor-pointer transition-colors 
                ${isActive ? " bg-gradient-to-b from-[rgba(201,155,253,0.15)] to-[rgba(133,116,246,0.15)] text-white" : "hover:bg-gray-700"} 
                ${title === "Settings" && "mb-2"}`}
        >
            <div>{isActive ? icon1 : icon}</div>
            <div>
                <p className={`text-sm font-bold ${title === "Logout" && "text-red-600"}`}>
                    {title}
                </p>
            </div>
        </div >
    )
}

export default ProfileSidebar;
