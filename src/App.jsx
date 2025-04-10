import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import MemoRecords from "./pages/MemoRecords"
import CreateMemoRecord from "./pages/CreateMemoRecord"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import UpdateSubjectType from "./pages/UpdateSubjectType"
import UpdateStudyScope from "./pages/UpdateStudyScope"
import CreateOneTimeEvent from "./pages/OneTimeEvents"
import OneTimeEvents from "./pages/OneTimeEvents"
import Blog from "./pages/Blog"
import BlogDetail from "./pages/BlogDetail"
import DailyCheckUp from "./pages/DailyCheckUp"
import AI from "./pages/AI"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/memo-records" element={<MemoRecords />} />
        <Route path="/create-memo-record" element={<CreateMemoRecord />} />
        <Route path="/create-one-time-event" element={<CreateOneTimeEvent />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/one-time-events" element={<OneTimeEvents />} />
        <Route path="/update-subject-type" element={<UpdateSubjectType />} />
        <Route path="/update-study-scope" element={<UpdateStudyScope />} />
        <Route path="/daily-check-up" element={<DailyCheckUp />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App