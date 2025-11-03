import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'

const RelatedDoct = ({docId,specilaty}) => {
  const {doctors}=useContext(AppContext)
  const [relDoct,setRelDoct]=useState([])
  useEffect(()=>{
    if(doctors.length>0 && specilaty){
      const doctData=doctors.filter((doc)=>doc.specilaty===specilaty && doc._id !==docId)
      setRelDoct(doctData)
    }
  })

  return (
    <div>
      
    </div>
  )
}

export default RelatedDoct
