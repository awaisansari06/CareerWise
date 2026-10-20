export const maxDuration = 60;
import React from 'react'
import CareerJobCenter from '@/components/career-job-center';

const MainLayout = ({ children }) => {
  return (
    <div className="career-main-layout container mx-auto mt-24 mb-20 px-4 sm:px-6">
      <CareerJobCenter />
      {children}
    </div>
  )
}

export default MainLayout
