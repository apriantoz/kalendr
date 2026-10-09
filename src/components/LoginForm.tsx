import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/dashboard' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      if (onSuccess) onSuccess();
      navigate(redirectTo);
    }
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
      <div className="bg-indigo-600 px-6 py-8 text-center text-white">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <LogIn className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Login Admin</h2>
        <p className="mt-1 text-sm text-indigo-100">Silakan masuk untuk mengelola jadwal</p>
      </div>

      <div className="p-8">
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-12 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition active:scale-[0.98] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <LogIn className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Kalendr. Semua Hak Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};