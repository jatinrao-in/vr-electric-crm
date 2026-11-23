import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS } from '../lib/constants';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Brand Hero Panel (VR Electric Navy Blue & Action Green Gradient) */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#062463] via-[#0A3D91] to-[#062463] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#65B32E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Clean Typography-Only Brand Title (Zero Icons) */}
        <div className="relative z-10">
          <div className="font-display font-extrabold text-2xl tracking-tight leading-none text-white">
            VR <span className="text-[#65B32E]">ELECTRIC</span>
          </div>
          <div className="text-[11px] font-bold text-[#65B32E] tracking-wider uppercase mt-1.5">
            Ride The Future
          </div>
        </div>

        {/* Content */}
        <div className="my-8 lg:my-0 space-y-4 max-w-sm relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#65B32E]">
            <span className="w-2 h-2 rounded-full bg-[#65B32E]" />
            Official Dealership CRM
          </span>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-white">
            E-Scooter Sales & Lead Management
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Centralized platform for WhatsApp inquiry capture, showroom walk-ins, test rides, and closed vehicle sales.
          </p>
        </div>

        <div className="text-[11px] text-slate-400 relative z-10 hidden lg:block">
          VR Electric Mobility Pvt. Ltd. • Authorized Personnel Only
        </div>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-subtle space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter your verified CRM credentials</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vrelectric.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91] focus:outline-none min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 min-h-[44px]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0A3D91] hover:bg-[#062463] text-white text-xs font-bold rounded-lg shadow-subtle flex items-center justify-center gap-2 min-h-[44px] transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CRM'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Accounts are provisioned by the Master Admin. Self-registration is disabled for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
