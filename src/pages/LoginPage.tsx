import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Lock, Loader2, Shield, ArrowRight, CheckCircle2, ArrowLeft, RefreshCw, KeyRound, Radio } from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onSuccess: (user: DeliveryUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpDestination, setOtpDestination] = useState('');
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(p => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  const handleSendOtp = async (overrideVal?: string) => {
    const val = (overrideVal || identifier).trim();
    if (!val) {
      setError('Please enter your registered email address or 10-digit mobile number');
      return;
    }

    const isEmail = val.includes('@');
    const cleanPhone = val.replace(/[^0-9]/g, '').slice(-10);

    if (!isEmail && cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number or email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: val } : { phone: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access Denied: Account not registered. Contact your Administrator.');
        return;
      }

      setOtpDestination(data.destination || val);
      setDetectedRole(data.role || null);
      setOtpStep(true);
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch {
      setError('Cannot connect to authentication server. Please verify backend service.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    const isEmail = identifier.includes('@');
    const cleanPhone = identifier.replace(/[^0-9]/g, '').slice(-10);

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: isEmail ? identifier.trim() : undefined,
          phone: !isEmail ? cleanPhone : undefined,
          otp: fullOtp
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired verification code');
        return;
      }

      // Successful verification
      onSuccess(data.user, data.token);

      // Route immediately based on user role
      const role = data.user?.role;
      if (role === 'admin') {
        onNavigate('admin');
        window.history.pushState({}, '', '/admin');
      } else if (role === 'fleet_manager') {
        onNavigate('fleet');
        window.history.pushState({}, '', '/fleet');
      } else if (role === 'dispatcher') {
        onNavigate('dispatch');
        window.history.pushState({}, '', '/dispatch');
      } else if (role === 'client') {
        onNavigate('receiving');
        window.history.pushState({}, '', '/receiving');
      } else {
        onNavigate('home');
        window.history.pushState({}, '', '/');
      }
    } catch {
      setError('Verification connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleQuickSelect = (emailVal: string) => {
    setIdentifier(emailVal);
    setError('');
    handleSendOtp(emailVal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#09021a] via-[#12072e] to-[#09021a] text-white flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      {/* Top Bar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => { onNavigate('home'); window.history.pushState({}, '', '/'); }}
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to IndoWings Main Site</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-950/40 text-[11px] font-bold text-purple-300">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Restricted Personnel Access Only</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-950/50 relative overflow-hidden">
          
          {/* Subtle Glow Orb in Card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#bc13fe]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Headline */}
          <div className="relative text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3b0080] via-purple-600 to-[#bc13fe] shadow-lg shadow-purple-900/40 text-white mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-1.5">
              Operations Command Portal
            </h1>
            <p className="text-xs text-white/60 font-medium max-w-xs mx-auto">
              IndoWings Enterprise Drone Delivery & Fleet Supply Chain Management
            </p>
          </div>

          {/* Policy Banner: No Signup */}
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-900/30 border border-purple-500/30 text-xs text-purple-200/90 flex items-start gap-3">
            <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white font-semibold">Strict Provisioning:</strong> Public registration is disabled. User IDs and roles are assigned directly by the Administrator.
            </div>
          </div>

          {!otpStep ? (
            /* Step 1: Identifier Entry */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                  Registered Email or Mobile Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(''); }}
                    placeholder="e.g. puneet@indowings.com or 9876543201"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 font-medium"
                    onKeyDown={e => { if (e.key === 'Enter') handleSendOtp(); }}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-xl p-3 font-medium">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm text-white transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Checking Authorization...' : 'Send Secure OTP Code'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* 4 Roles Quick Test Bar */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3 text-center">
                  Instant Access for Seeded Roles (Click to Test)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleQuickSelect('puneet@indowings.com')}
                    className="p-3 text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-purple-900/30 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300">👑 Super Admin</span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate">puneet@indowings.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickSelect('fleet@indowings.com')}
                    className="p-3 text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-purple-900/30 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300">🛠️ Fleet Manager</span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate">fleet@indowings.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickSelect('dispatch@indowings.com')}
                    className="p-3 text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-purple-900/30 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300">🚚 Dispatcher</span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate">dispatch@indowings.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickSelect('client@defenselogistics.in')}
                    className="p-3 text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-purple-900/30 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300">🏢 Client Officer</span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate">client@defenselogistics.in</p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: 6-Digit OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                {detectedRole && (
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
                    Authorized Role: {detectedRole.replace('_', ' ')}
                  </span>
                )}
                <p className="text-xs text-white/70">
                  Enter the 6-digit verification code sent to <br />
                  <strong className="text-white font-bold">{otpDestination}</strong>
                </p>
              </div>

              {/* 6 Inputs */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpInputsRef.current[idx] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const copy = [...otpDigits];
                      copy[idx] = val;
                      setOtpDigits(copy);
                      if (val && idx < 5) otpInputsRef.current[idx + 1]?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                        otpInputsRef.current[idx - 1]?.focus();
                      }
                    }}
                    className="w-11 sm:w-12 h-14 text-center text-xl font-black rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                  />
                ))}
              </div>

              {error && (
                <div className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-xl p-3 font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length < 6}
                className="w-full py-4 rounded-xl font-black text-sm text-white transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{loading ? 'Authenticating Personnel...' : 'Verify OTP & Open Dashboard'}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-white/50 pt-1">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="hover:text-white transition-colors"
                >
                  Change Account ID
                </button>
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => handleSendOtp()}
                  className="text-purple-400 font-bold hover:text-purple-300 disabled:opacity-50 disabled:no-underline"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-white/40">
        © 2026 IndoWings Aerospace Pvt. Ltd. · Enterprise UAV Logistics & Defense Fulfillment Architecture
      </footer>
    </div>
  );
};
