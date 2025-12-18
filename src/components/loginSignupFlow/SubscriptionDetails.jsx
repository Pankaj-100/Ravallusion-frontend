"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Add this import
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const SubscriptionDetails = ({ 
  courseType, 
  cart = false, 
  price = 5999, 
  usd_price = 30, 
  profile = false, 
  data, 
  isIndia = true,
  courseData = null,
  onDelete = null
}) => {
  const router = useRouter();

  const invoice = data?.data?.subscriptionDetails?.invoice_url;
  const paidOn = data?.data?.subscriptionDetails?.paidOn;
  const remainingDays = data?.data?.subscriptionDetails?.remainingDays;
  const planType = data?.data?.subscriptionDetails?.planType;

  const [dropdown, setDropdown] = useState(profile || cart);

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
  };

  const handleDownloadInvoice = () => {
    if (!invoice) {
      toast.warning("Invoice not found")
      return;
    }
    const a = document.createElement("a");
    a.href = invoice;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Get course benefits from courseData.points
  const courseBenefits = courseData?.points || [];

  return (
    <div className={`${profile || cart ? "mx-0" : "mx-4"} p-4 rounded-[17px] bg-[var(--navy-blue)]
     ${profile && "w-full !bg-[var(--card)] mx-0"}
     ${cart && "w-full mx-0 px-0"}`}>

      {/* Header Section */}
      <div className={`flex justify-between items-center ${cart && "px-2"}`}>
        <h2 className='text-white font-semibold text-sm md:text-lg'>Course details</h2>

        <div className='flex gap-2'>
          {!dropdown && (
            <div className='flex gap-2 items-center'>
              <span className='text-[var(--yellow)] text-sm'>{courseType || courseData?.title}</span>
              <span className='text-xs'>•</span>
              <span className='text-sm'>{isIndia ? `₹${price || courseData?.inr_price}` : `$${usd_price || courseData?.usd_price}`}</span>
            </div>
          )}
          {profile && (
            <div className='flex items-center gap-x-1'>
              <p onClick={handleDownloadInvoice} className="cursor-pointer text-xs md:text-sm underline text-[var(--neon-purple)] font-semibold">
                Download Invoice
              </p>
            </div>
          )}
          {cart && (
            <div className='flex items-center gap-2 cursor-pointer' onClick={onDelete || (() => router.push('/subscription-plan'))}>
              <p className="text-xs md:text-sm text-blue-500 font-semibold">
                Delete
              </p>
            </div>
          )}
          {!dropdown && (
            <ChevronDown
              size={"18px"}
              className='cursor-pointer text-gray-300'
              onClick={() => setDropdown(true)}
            />
          )}
          {dropdown && !profile && !cart && (
            <ChevronUp
              size={"18px"}
              className="cursor-pointer text-gray-300"
              onClick={() => setDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Dropdown Section */}
      <motion.div
        initial="hidden"
        animate={dropdown ? "visible" : "hidden"}
        variants={dropdownVariants}
        transition={{ duration: 0.3 }}
        className='overflow-hidden'
      >
        <div className={`${profile && "py-2 px-0"}
        ${cart && "px-2"}
          mt-1 px-0 py-3  rounded-lg text-gray-200`}>

          {/* Course Info with Image */}
          <div className='flex items-start gap-4 mb-4'>
            {/* Course Image - Added this section */}
            {courseData?.courseImage && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={courseData.courseImage || "/logocard.png"}
                  alt={courseData.title || "Course"}
                  fill
                  className="object-cover rounded-lg"
                  sizes="64px"
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-[12px] text-gray-400'>Course</p>
                  <h2 className='text-white text-lg md:text-2xl font-semibold'>{courseType || courseData?.title || "Course Name"}</h2>
                </div>

                <div className='text-right'>
                  <p className='text-[12px] text-gray-400'>Price</p>
                  <h2 className='font-semibold text-2xl'>
                    {isIndia ? `₹${price || courseData?.inr_price || "0"}` : `$${usd_price || courseData?.usd_price || "0"}`}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <hr className='border-t border-gray-700 my-4' />

          {/* Benefits Section - Only show if there are points */}
          {courseBenefits.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className='text-white font-semibold mb-2'>Benefits</h3>
                <div className="space-y-2">
                  {courseBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="min-w-[6px] h-[6px] bg-[var(--yellow)] rounded-full mt-2"></div>
                      <span className='text-sm text-gray-200'>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <hr className='border-t border-gray-700 my-4' />
            </>
          )}

         
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionDetails;