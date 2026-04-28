import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Enroll from './pages/Enroll';

function App() {
  return (
    <div className="font-sans antialiased bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; 2026 Top Notch Insurance Brokers. All rights reserved. Professional Protection for a Better Tomorrow.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
