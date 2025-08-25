import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDctor from '../components/TopDctor';
import Banner from '../components/Banner';

const HomePage = () => {
    console.log("HomePage rendered ✅");
  return (
    <div>
      <Header/>
      <SpecialityMenu/>
      <TopDctor/>
      <Banner/>
      
    </div>
  )
}

export default HomePage;
