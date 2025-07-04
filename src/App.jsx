import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import OnePage from './pages/OnePage'
import Login from './pages/Login'
import Register from './pages/Register'
import UserRecovery from './pages/UserRecovery'


function App() {
 
  return (
    <Routes>
      <Route path = "/" element = { <OnePage />} />
      <Route path = "/Login" element = { <Login />} />
      <Route path = "/Register" element =  {  <Register />} />
      <Route path = "/UserRecovery" element =  {  <UserRecovery />} />
    </Routes>
  )
}

export default App
