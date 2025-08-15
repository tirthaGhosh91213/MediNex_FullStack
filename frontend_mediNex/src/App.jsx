
import React from "react"
import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Doctors from "./pages/Doctors"
import Login from "./pages/Login"
function App() {

  return (
    <>
     <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/doctors" element={<Doctors/>}/>
      <Route path="/doctors/:specilaty" element={<Doctors/>}/>
      <Route path="/login" element={<Login/>}/>
     </Routes>
    </>
  )
}

export default App
