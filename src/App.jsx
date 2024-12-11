import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import MemoRecords from "./pages/MemoRecords"
import CreateAMemoRecord from "./pages/CreateAMemoRecord"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import UpdateSubjectType from "./pages/UpdateSubjectType";
import UpdateStudyScope from "./pages/UpdateStudyScope"

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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/memo-records" element={<MemoRecords />} />
        <Route path="/create-a-memo-record" element={<CreateAMemoRecord />} />
        <Route path="/update-subject-type" element={<UpdateSubjectType />} />
        <Route path="/update-study-scope" element={<UpdateStudyScope />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App