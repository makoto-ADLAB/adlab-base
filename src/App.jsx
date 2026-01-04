import { Routes, Route, Navigate } from "react-router-dom"
import Gate from "./pages/Gate.jsx"
import Jobs from "./pages/Jobs.jsx"
import Apply from "./pages/Apply.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Gate />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/apply/:jobId" element={<Apply />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
