import React from 'react'
import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import TPASidebar from './TPASidebar'

export default function TPALayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EC', fontFamily: '"Instrument Sans", Inter, sans-serif' }}>
      <Nav />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)' }}>
        <TPASidebar />
        <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
