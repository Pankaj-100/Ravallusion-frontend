'use client'
import { Lock } from '@/lib/svg_icons'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { useGetSubmittedAssignmetQuery } from '@/store/Api/course';
import CustomDialog from '../common/CustomDialog';
import SubmitAssignment from './SubmitAssignment';
import { SimpleLoader } from '../common/LoadingSpinner';


const AssignmentSubmitList = () => {
    const [isActive, setIsActive] = useState(0);
    const { data, isLoading } = useGetSubmittedAssignmetQuery();


    const moduleName1 = data?.data?.assigments?.[0]?.moduleName;
    const moduleName2 = data?.data?.assigments?.[1]?.moduleName;

    const beginnerPhotoshopAssignment = data?.data?.assigments?.[0]?.videos;
    const advancedPhotoshopAssignment = data?.data?.assigments?.[2]?.videos;

    const photoshopAssignment = [...(beginnerPhotoshopAssignment || []), ...(advancedPhotoshopAssignment || [])];

    const beginnerPremierproAssignment = data?.data?.assigments?.[1]?.videos;
    const advancedPremierproAssignment = data?.data?.assigments?.[4]?.videos;

    const premierproAssignment = [...(beginnerPremierproAssignment || []), ...(advancedPremierproAssignment || [])]

    return isLoading ? <div className='flex items-center justify-center min-h-[60vh]'><SimpleLoader /> </div> : (
        <div className='my-2 lg:my-0 col-span-12 py-4 px-4 lg:col-span-4 rounded-2xl bg-[var(--card)] relative'>


            {/* {
                courseComplete && (
                    <div className='p-3 bg-[#3A3537] rounded-lg'>
                        <h1 className='text-sm mb-1 font-semibold'>🥳 Congrats! Your Course is completed</h1>
                        <p className='text-[10px] mb-2'>You can Download certificate from here anytime</p>
                        <div className='flex items-center gap-x-3'>
                            <h1 className='text-[var(--yellow)]'>Download Certificate</h1>
                            <YellowDownload />
                        </div>
                    </div>
                )
            } */}

            <div className='mb-2'>
                <div className='flex items-center gap-x-4 mb-3'>
                    <div>
                        <h1 className='text-sm font-semibold cursor-pointer mb-1' onClick={() => setIsActive(0)}>{moduleName1}</h1>
                        {isActive === 0 && (
                            <CourseProgressBar percentage={100} />
                        )}
                    </div>
                    <div>
                        <h1 className='text-sm font-semibold cursor-pointer mb-1' onClick={() => setIsActive(1)}>{moduleName2}</h1>
                        {isActive === 1 && (
                            <CourseProgressBar percentage={100} />
                        )}
                    </div>
                </div>

            </div>
            {
                isActive === 0 && (
                    <div>
                        {
                            photoshopAssignment && photoshopAssignment.map((video, index) => (

                                <SubmitAssignmentCard
                                    key={index}
                                    videoId={video._id}
                                    score={video.score}
                                    title={video.title}
                                    percentageWatched={video.percentageWatched}
                                    isCompleted={video.isCompleted}
                                    hasSubmitted={video.hasSubmitted}
                                />
                            ))
                        }
                    </div>
                )
            }
            {
                isActive === 1 && (
                    <div>
                        {
                            premierproAssignment && premierproAssignment.map((video, index) => (
                                <SubmitAssignmentCard
                                    key={index}
                                    videoId={video._id}
                                    score={video.score}
                                    percentageWatched={video.percentageWatched}
                                    title={video.title}
                                    isCompleted={video.isCompleted}
                                    hasSubmitted={video.hasSubmitted}
                                />
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}


const SubmitAssignmentCard = ({ isCompleted, percentageWatched, videoId, score, hasSubmitted, title }) => {
    const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
    const ongoing = percentageWatched > 0 && !isCompleted;
    const notStarted = percentageWatched === 0 && !ongoing;
    return (
        <div className='py-3 flex items-center justify-between min-w-full'>

            <div>
                <h1 className='text-sm mb-1 font-semibold'>{title}</h1>
                {
                    isCompleted && hasSubmitted && (
                        <p className='text-[11px] text-[var(--yellow)]'>Completed · <span className='text-[#7EFF9A]'>Assignment submitted</span></p>
                    )
                }

                {
                    isCompleted && !hasSubmitted && (
                        <p className='text-[11px] text-[var(--yellow)]'>Completed</p>
                    )
                }
                {
                    ongoing && (
                        <p className='text-[11px] text-[var(--yellow)]'>Ongoing</p>

                    )
                }
                {
                    notStarted && (
                        <p className='text-[11px] text-gray-300'>Not Started</p>

                    )
                }
            </div>

            {/* Right Side */}
            <div>
                {
                    isCompleted && !hasSubmitted ? (
                        <Button onClick={() => setIsAssignmentOpen(true)} variant="neonOutline">Submit </Button>

                    ) : isCompleted && hasSubmitted ? (
                        <div className='py-2 px-3 w-20 rounded-lg text-center' style={{ background: "linear-gradient(0deg, rgba(163, 127, 255, 0.25) 0%, rgba(163, 127, 255, 0.25) 100%), #030A14" }}>
                            <p className='text-[6px]'>Score</p>
                            <h1 className='text-sm font-bold' style={{ color: "var(--neon-purple, linear-gradient(180deg, #C99BFD 0%, #8574F6 100%))" }}>{score || "_"}</h1>
                        </div>

                    ) : (
                        <div className='relative cursor-not-allowed'>
                            <Button variant="neonOutline" className={"opacity-50"}>
                                Submit
                            </Button>
                            <div className='absolute top-0 h-full flex items-center justify-center backdrop-blur-xs bg-[#0000001F] w-full'>
                                <Lock />
                            </div>

                        </div>
                    )

                }


                <CustomDialog close={() => setIsAssignmentOpen(false)} open={isAssignmentOpen}>
                    <SubmitAssignment videoId={videoId} setIsAssignmentOpen={setIsAssignmentOpen} />
                </CustomDialog>
            </div>



        </div>
    )
}

export const CourseProgressBar = ({ percentage = 50, className = '' }) => {
    return (
        <div className={`w-full bg-black h-1 rounded-xl overflow-hidden ${className}`}>
            <div
                className="h-full transition-all duration-300 ease-in-out"
                style={{ width: `${percentage}%`, background: "var(--neon-purple, linear-gradient(180deg, #C99BFD 0%, #8574F6 100%))" }}
            />
        </div>
    )
}

export default AssignmentSubmitList