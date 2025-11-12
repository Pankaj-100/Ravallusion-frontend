import PageLoader from '@/components/common/PageLoader'
import QuizScreen from '@/components/quiz/QuizScreen';
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div className='w-full'>
      <Suspense fallback={<PageLoader />}>
    <QuizScreen/>
      </Suspense>
    </div>
  )
}

export default page;