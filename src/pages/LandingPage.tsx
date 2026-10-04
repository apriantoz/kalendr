// src/pages/LandingPage.tsx
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import AppPreview from '@/components/AppPreview';
import CalendarGrid from '@/components/CalendarGrid';
import Footer from '@/components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AppPreview/>
      <CalendarGrid jadwalList={[]} />
      <FeaturesSection/>
      <Footer/>
    </div>
  );
};