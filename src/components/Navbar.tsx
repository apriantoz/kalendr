// src/components/Navbar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Home,
  LogOut,
  LogIn,
  GraduationCap,
  Database,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

  // Helper active tab
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-slate-900 text-lg"
          >
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span>
              kalendr<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Navigasi Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive("/")
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Publik</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive("/dashboard")
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/jadwal"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive("/jadwal")
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Kelola Jadwal</span>
                </Link>

                <Link
                  to="/master-semester"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive("/master-semester")
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Semester</span>
                </Link>
                <Link
                  to="/master-data"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive("/master-data")
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Master Data</span>
                </Link>
              </>
            )}
          </div>

          {/* Tombol Auth Login / Logout */}
          <div>
            {isAdmin ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            ) : (
              <Link
                to="/login"
                className={buttonVariants({variant:"default"})}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
