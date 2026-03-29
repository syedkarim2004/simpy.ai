import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TPALayout from './components/layout/TPALayout'
import TPADashboard from './pages/tpa/index'
import PreAuth from './pages/tpa/pre-auth'
import Approval from './pages/tpa/approval'
import Admission from './pages/tpa/admission'
import Enhancement from './pages/tpa/enhancement'
import Discharge from './pages/tpa/discharge'
import Settlement from './pages/tpa/settlement'

export default function App() {
  return (
    <Routes>
      <Route path="/tpa" element={<TPALayout />}>
        <Route index element={<TPADashboard />} />
        <Route path="pre-auth" element={<PreAuth />} />
        <Route path="approval" element={<Approval />} />
        <Route path="admission" element={<Admission />} />
        <Route path="enhancement" element={<Enhancement />} />
        <Route path="discharge" element={<Discharge />} />
        <Route path="settlement" element={<Settlement />} />
      </Route>
      <Route path="*" element={<Navigate to="/tpa" replace />} />
    </Routes>
  )
}
