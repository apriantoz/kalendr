import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  TableProperties,
  X,
  Database,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const masterRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (masterRef.current && !masterRef.current.contains(target)) {
        setMasterOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tutup semua menu ketika berpindah halaman
  useEffect(() => {
    setMobileOpen(false);
    setMasterOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const navItemClass = (path: string) => {
    const active = location.pathname === path;

    return `
      inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
      transition-all duration-200
      ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `;
  };

  const mobileNavItemClass = (path: string) => {
    const active = location.pathname === path;

    return `
      flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
      transition-colors
      ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `;
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="Kalendr - Beranda"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <GraduationCap size={21} strokeWidth={2.2} />
            </div>

            <div className="leading-none">
              <div className="text-[19px] font-bold tracking-tight text-slate-900">
                kalendr<span className="text-indigo-600">.</span>
              </div>

              <div className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:block">
                Academic Scheduler
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className={navItemClass("/")}>
              <BookOpen size={16} />
              Jadwal Publik
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/dashboard"
                  className={navItemClass("/dashboard")}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <Link
                  to="/jadwal"
                  className={navItemClass("/jadwal")}
                >
                  <TableProperties size={16} />
                  Kelola Jadwal
                </Link>

                {/* Master Data */}
                <div ref={masterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setMasterOpen((prev) => !prev);
                      setProfileOpen(false);
                    }}
                    className={`
                      inline-flex items-center gap-2 rounded-lg px-3 py-2
                      text-sm font-medium transition-all duration-200
                      ${
                        masterOpen ||
                        location.pathname === "/master-semester" ||
                        location.pathname === "/master-data"
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <Database size={16} />
                    Master Data
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        masterOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {masterOpen && (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                      <Link
                        to="/master-semester"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => setMasterOpen(false)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <BookOpen size={16} />
                        </div>

                        <div>
                          <div className="font-medium">Semester</div>
                          <div className="text-xs text-slate-400">
                            Kelola semester
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/master-data"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => setMasterOpen(false)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Database size={16} />
                        </div>

                        <div>
                          <div className="font-medium">Data Master</div>
                          <div className="text-xs text-slate-400">
                            Mata kuliah & ruang
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-2 md:flex">
            {isAdmin ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setMasterOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
                    A
                  </div>

                  <div className="hidden text-left lg:block">
                    <div className="text-xs font-semibold text-slate-800">
                      Administrator
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Admin
                    </div>
                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <div className="text-sm font-semibold text-slate-800">
                        Administrator
                      </div>
                      <div className="text-xs text-slate-400">
                        Pengelola sistem
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400"
                    >
                      <Settings size={16} />
                      Pengaturan
                      <span className="ml-auto text-[10px]">
                        Segera
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
              >
                <LogIn size={16} />
                Login Admin
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <nav className="space-y-1">
              <Link to="/" className={mobileNavItemClass("/")}>
                <BookOpen size={18} />
                Jadwal Publik
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/dashboard"
                    className={mobileNavItemClass("/dashboard")}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  <Link
                    to="/kelola-jadwal"
                    className={mobileNavItemClass("/kelola-jadwal")}
                  >
                    <TableProperties size={18} />
                    Kelola Jadwal
                  </Link>

                  <div className="my-3 border-t border-slate-100" />

                  <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Master Data
                  </div>

                  <Link
                    to="/master-semester"
                    className={mobileNavItemClass("/master-semester")}
                  >
                    <BookOpen size={18} />
                    Semester
                  </Link>

                  <Link
                    to="/master-data"
                    className={mobileNavItemClass("/master-data")}
                  >
                    <Database size={18} />
                    Data Master
                  </Link>

                  <div className="my-3 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </>
              )}

              {!isAdmin && (
                <Link
                  to="/login"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <LogIn size={18} />
                  Login Admin
                </Link>
              )}
            </nav>

            {isAdmin && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
                  A
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Administrator
                  </div>
                  <div className="text-xs text-slate-400">
                    Pengelola sistem
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;