import React from 'react'

const MainLayout = ({ children }) => {
  return (
    <div className="container mx-auto mt-24 mb-20 px-4 sm:px-6">
      {children}
    </div>
  )
}

export default MainLayout