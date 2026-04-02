import Login from "../src/Login"
import Jobs from "../src/Jobs"
import Home from "./Home"
import { Routes, Route } from "react-router-dom"
import JobItemDetails from "./JobItemDetails"
import ProtectedRoute from "./ProtectedRoute"

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><JobItemDetails /></ProtectedRoute>} />
    </Routes>
  )
}

export default App