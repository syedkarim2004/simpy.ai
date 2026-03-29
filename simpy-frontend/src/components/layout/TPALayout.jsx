import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import TPASidebar from './TPASidebar'

const initialCases = [
  { id: 1, patient: "Rajesh Kumar", uhid: "BH-2024-9911", tpa: "MediAssist", diagnosis: "Dengue Fever", estimatedCost: 85000, stage: 1, tat: 35 },
  { id: 2, patient: "Priya Sharma", uhid: "BH-2024-9912", tpa: "Vidal Health", diagnosis: "Appendicitis", estimatedCost: 120000, stage: 2, tat: 70 },
  { id: 3, patient: "Deepak Singh", uhid: "BH-2024-9913", tpa: "MD India", diagnosis: "Fracture Femur", estimatedCost: 240000, stage: 3, tat: 20 },
  { id: 4, patient: "Kavita Rao", uhid: "BH-2024-9914", tpa: "MediAssist", diagnosis: "Pneumonia", estimatedCost: 98000, stage: 4, tat: 45 },
  { id: 5, patient: "Ankit Verma", uhid: "BH-2024-9915", tpa: "Vidal Health", diagnosis: "Gallbladder Stones", estimatedCost: 175000, stage: 5, tat: 55 },
  { id: 6, patient: "Neha Gupta", uhid: "BH-2024-9916", tpa: "MD India", diagnosis: "Migraine Severe", estimatedCost: 45000, stage: 2, tat: 25 },
  { id: 7, patient: "Suresh Babu", uhid: "BH-2024-9917", tpa: "MediAssist", diagnosis: "Typhoid", estimatedCost: 65000, stage: 1, tat: 15 },
  { id: 8, patient: "Amit Yadav", uhid: "BH-2024-9918", tpa: "Vidal Health", diagnosis: "Kidney Stones", estimatedCost: 140000, stage: 6, tat: 30 },
  { id: 9, patient: "Pooja Mehta", uhid: "BH-2024-9919", tpa: "MD India", diagnosis: "Asthma Severe", estimatedCost: 72000, stage: 3, tat: 50 },
  { id: 10, patient: "Rohan Kapoor", uhid: "BH-2024-9920", tpa: "MediAssist", diagnosis: "Spinal Injury", estimatedCost: 310000, stage: 7, tat: 65 }
];

export default function TPALayout() {
  const [cases, setCases] = useState(initialCases);
  const [loading, setLoading] = useState(false);
  const [activeCase, setActiveCase] = useState(null);

  const simulateApi = (callback) => {
    setLoading(true);
    setTimeout(() => {
      callback();
      setLoading(false);
    }, Math.random() * 800 + 300);
  };

  const moveStage = (id, nextStage) => {
    simulateApi(() => {
      setCases(prev => prev.map(c => c.id === id ? { ...c, stage: nextStage } : c));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Minor success feedback
      const c = cases.find(x => x.id === id);
      console.log(`Case ${c?.patient} moved to stage ${nextStage}`);
    });
  };

  const getTatStatus = (tat) => {
    if (tat > 60) return { text: "BREACHED", color: "#C0392B", bg: "#FEE2E2" };
    if (tat > 40) return { text: "URGENT", color: "#D97706", bg: "#FEF3C7" };
    return { text: "WITHIN TAT", color: "#2D6A4F", bg: "#D8F3DC" };
  };

  const getExtraInfo = (id) => {
    const doctors = ["Dr. Sharma", "Dr. Mehta", "Dr. Singh", "Dr. Vikram", "Dr. Rao"];
    const rooms = ["Ward A-12", "ICU-3", "General-21", "TPA-Deluxe-4", "O-7B"];
    // Deterministic based on ID
    return {
      doctor: doctors[id % doctors.length],
      room: rooms[id % rooms.length],
      admissionTime: `${(id * 3) % 24 + 1} hrs ago`
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EC', fontFamily: '"Instrument Sans", Inter, sans-serif' }}>
      <Nav />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)' }}>
        <TPASidebar />
        <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
          <Outlet context={{ data: cases, loading, moveStage, getTatStatus, getExtraInfo, activeCase, setActiveCase }} />
        </main>
      </div>
    </div>
  )
}
