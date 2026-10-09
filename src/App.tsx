// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { JadwalTable } from "@/pages/JadwalTable";
import { MasterSemesterPage } from "@/pages/MasterSemesterPage";
import { MasterDataPage } from "@/pages/MasterDataPage";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  const { isAdmin, loading } = useAuth();
  const location = useLocation(); // Mendapatkan informasi URL saat ini

  // Cek apakah user sedang berada di halaman login
  const isLoginPage = location.pathname === "/login";

  // Spinner saat cek session Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm font-medium">Memuat sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar hanya akan dirender jika BUKAN di halaman login */}
      {!isLoginPage && <Navbar />}
      
      <main className={isLoginPage ? "" : "py-6"}>
        <Routes>
          {/* Halaman Publik */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Halaman Khusus Admin */}
          <Route
            path="/dashboard"
            element={isAdmin ? <DashboardPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/kelola-jadwal"
            element={isAdmin ? <JadwalTable /> : <Navigate to="/" replace />}
          />
          <Route
            path="/master-semester"
            element={
              isAdmin ? <MasterSemesterPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/master-data"
            element={isAdmin ? <MasterDataPage /> : <Navigate to="/" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}