import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'

const HomePage = () => {
    console.log("HomePage rendered ✅");
  return (
    <div>
      <Header/>
      <SpecialityMenu/>
      
    </div>
  )
}

export default HomePage;
