import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Zap,
  Package,
} from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onSuccess: (user: DeliveryUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  // Login method: 'email' (password login, no OTP) or 'phone' (SMS OTP)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email + Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone + OTP state
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpDestination, setOtpDestination] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  const routeByRole = (user: DeliveryUser) => {
    if (user.role === 'admin') {
      onNavigate('admin');
      window.history.pushState({}, '', '/admin');
    } else if (user.role === 'fleet_manager') {
      onNavigate('fleet');
      window.history.pushState({}, '', '/fleet');
    } else if (user.role === 'dispatcher') {
      onNavigate('dispatch');
      window.history.pushState({}, '', '/dispatch');
    } else if (user.role === 'client') {
      onNavigate('receiving');
      window.history.pushState({}, '', '/receiving');
    } else if (user.role === 'support') {
      onNavigate('support-desk');
      window.history.pushState({}, '', '/support-desk');
    } else {
      onNavigate('home');
      window.history.pushState({}, '', '/');
    }
  };

  // 1. DIRECT EMAIL + PASSWORD LOGIN (NO OTP)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setError('Please enter your authorized corporate email address.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access Denied: Invalid email or password.');
        return;
      }

      const user: DeliveryUser = data.user;
      const token: string = data.token;

      localStorage.setItem('iw_delivery_token', token);
      localStorage.setItem('iw_delivery_user', JSON.stringify(user));

      onSuccess(user, token);
      routeByRole(user);
    } catch {
      setError('Cannot connect to authentication server. Please ensure backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  // 2. PHONE SMS OTP REQUEST
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access Denied: Phone number not registered. Please contact Administrator.');
        return;
      }

      setOtpDestination(data.destination || `+91 ${cleanPhone}`);
      setOtpStep(true);
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch {
      setError('Cannot connect to authentication server. Please verify backend service.');
    } finally {
      setLoading(false);
    }
  };

  // 3. PHONE SMS OTP VERIFICATION
  const handleVerifyPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: fullOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired verification code.');
        return;
      }

      const user: DeliveryUser = data.user;
      const token: string = data.token;

      localStorage.setItem('iw_delivery_token', token);
      localStorage.setItem('iw_delivery_user', JSON.stringify(user));

      onSuccess(user, token);
      routeByRole(user);
    } catch {
      setError('Verification connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasted[i] || '';
      }
      setOtpDigits(updated);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ── LEFT: Classic Enterprise Branding Panel ─────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1b0736 0%, #290f4d 55%, #15062c 100%)',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient atmospheric glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />

        {/* Top brand header */}
        <div className="relative z-10">
          <button
            onClick={() => {
              onNavigate('home');
              window.history.pushState({}, '', '/');
            }}
            className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-bold transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </button>

          <img src="/indofleet-logo-white.svg" alt="IndoFleet" className="h-9 w-auto mb-8" />

          <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
            Autonomous Drone Fleet &amp; Delivery Management
          </h1>

          <p className="text-white/70 text-sm leading-relaxed max-w-md">
            Sign in with your enterprise credentials to access your designated role workspace for flight telemetry, QC compliance, and corridor dispatch.
          </p>
        </div>

        {/* Operational Roles Overview */}
        <div className="relative z-10 space-y-3 my-8">
          {[
            {
              icon: Zap,
              title: 'Real-Time Flight Telemetry',
              desc: 'Live corridor route tracking and waypoint milestones',
            },
            {
              icon: Shield,
              title: 'Multi-Point Hardware QC',
              desc: 'Avionics diagnostics, battery impedance, and DGCA NPNT',
            },
            {
              icon: Package,
              title: 'Digital Technical Handover',
              desc: 'Serial verification and digital acceptance challan sign-off',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">{title}</p>
                <p className="text-white/50 text-[11px] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-white/40">
          IndoFleet Aerospace Technologies Ltd. &middot; Internal Operations Portal
        </div>
      </div>

      {/* ── RIGHT: Form Panel ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-white py-12">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <img src="/indofleet-logo-dark.svg" alt="IndoFleet" className="h-7 w-auto" />
          <button
            onClick={() => {
              onNavigate('home');
              window.history.pushState({}, '', '/');
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header icon & title */}
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#3b0080] mb-5 shadow-sm">
            <KeyRound className="w-6 h-6 text-[#3b0080]" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to IndoFleet
          </h2>
          <p className="text-slate-500 text-sm mt-1 mb-6 leading-relaxed">
            Enter your corporate credentials to securely access your operations terminal.
          </p>

          {/* Login Method Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError('');
                setOtpStep(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'email'
                  ? 'bg-white text-[#3b0080] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email &amp; Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setError('');
                setOtpStep(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'phone'
                  ? 'bg-white text-[#3b0080] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile SMS OTP</span>
            </button>
          </div>

          {/* ── METHOD 1: EMAIL & PASSWORD (NO OTP) ─────────────────── */}
          {authMethod === 'email' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    placeholder="e.g. puneet@indowings.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3b0080] focus:ring-4 focus:ring-purple-50 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    placeholder="Enter password (e.g. 123 123)"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3b0080] focus:ring-4 focus:ring-purple-50 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#3b0080] hover:bg-[#2c0060] transition-all shadow-md shadow-purple-900/10 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
              </button>
            </form>
          )}

          {/* ── METHOD 2: PHONE NUMBER (SMS OTP) ────────────────────── */}
          {authMethod === 'phone' && !otpStep && (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError('');
                      }}
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3b0080] focus:ring-4 focus:ring-purple-50 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#3b0080] hover:bg-[#2c0060] transition-all shadow-md shadow-purple-900/10 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Sending Code...' : 'Send SMS OTP'}</span>
              </button>
            </form>
          )}

          {/* ── METHOD 2 STEP 2: PHONE OTP VERIFICATION ─────────────── */}
          {authMethod === 'phone' && otpStep && (
            <div>
              <button
                onClick={() => {
                  setOtpStep(false);
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#3b0080] mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change mobile number</span>
              </button>

              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Enter Verification Code
              </h3>
              <p className="text-slate-500 text-xs mt-1 mb-5">
                We sent a 6-digit SMS OTP to{' '}
                <span className="font-bold text-slate-900">{otpDestination}</span>
              </p>

              <form onSubmit={handleVerifyPhoneOtp} className="space-y-5">
                <div>
                  <div
                    className="flex gap-2 sm:gap-3 justify-center"
                    onPaste={handlePasteOtp}
                  >
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#3b0080] focus:ring-4 focus:ring-purple-50 transition-all bg-slate-50/50"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#3b0080] hover:bg-[#2c0060] transition-all shadow-md shadow-purple-900/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Didn't receive SMS?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => handleSendPhoneOtp()}
                      className="font-bold text-[#3b0080] hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-slate-400">Resend in {resendTimer}s</span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Clean Enterprise Assistance */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <span>Need assistance with your account? </span>
            <a
              href="/support"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('support');
                window.history.pushState({}, '', '/support');
              }}
              className="text-[#3b0080] font-semibold hover:underline"
            >
              Contact Support Desk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
