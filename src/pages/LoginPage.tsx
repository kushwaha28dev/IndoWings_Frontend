import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Phone,
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
  const [identifier, setIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpDestination, setOtpDestination] = useState('');
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
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

  const handleSendOtp = async (overrideVal?: string) => {
    const val = (overrideVal || identifier).trim();
    if (!val) {
      setError('Please enter your email address or 10-digit mobile number');
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
        body: JSON.stringify(isEmail ? { email: val } : { phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access Denied: Account not registered. Please contact Administrator.');
        return;
      }

      setOtpDestination(data.destination || val);
      setDetectedRole(data.role || null);
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
          otp: fullOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired verification code');
        return;
      }

      const user: DeliveryUser = data.user;
      const token: string = data.token;

      localStorage.setItem('iw_delivery_token', token);
      localStorage.setItem('iw_delivery_user', JSON.stringify(user));

      onSuccess(user, token);

      // Auto-route based on role
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
      {/* ── LEFT: Classic Branding Panel ───────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
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

          <img src="/indowings-logo-white.svg" alt="IndoWings" className="h-9 w-auto mb-8" />

          <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
            Autonomous Drone Fleet &amp; Delivery Management
          </h1>

          <p className="text-white/70 text-sm leading-relaxed max-w-md">
            Connect directly with your authorized role terminal to oversee factory assembly, pre-delivery hardware QC, air corridor dispatch, and base handovers.
          </p>
        </div>

        {/* Key Operational Features */}
        <div className="relative z-10 space-y-3.5 my-8">
          {[
            {
              icon: Zap,
              title: 'Real-Time Flight Telemetry',
              desc: 'Live corridor route tracking and waypoint milestones',
            },
            {
              icon: Shield,
              title: 'Multi-Point Hardware QC',
              desc: 'Dual-avionics, battery impedance, and DGCA NPNT compliance',
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
          IndoWings Aerospace Technologies Ltd.
        </div>
      </div>

      {/* ── RIGHT: Clean, Light Form Panel ─────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-white py-12">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <img src="/indowings-logo-dark.svg" alt="IndoWings" className="h-7 w-auto" />
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
          {!otpStep ? (
            /* ── STEP 1: Email / Phone Entry ─────────────────────── */
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#3b0080] mb-5 shadow-sm">
                <KeyRound className="w-6 h-6 text-[#3b0080]" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Sign In to IndoWings
              </h2>
              <p className="text-slate-500 text-sm mt-1 mb-6 leading-relaxed">
                Enter your registered email address or mobile phone to receive a one-time verification code.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Registered Email or Phone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError('');
                      }}
                      required
                      placeholder="e.g. puneet@indowings.com or 9876543201"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3b0080] focus:ring-4 focus:ring-purple-50 transition-all font-medium"
                    />
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
                  <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                </button>
              </form>

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
                  Contact Support
                </a>
              </div>
            </div>
          ) : (
            /* ── STEP 2: 6-Digit OTP Verification ────────────────── */
            <div>
              <button
                onClick={() => {
                  setOtpStep(false);
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#3b0080] mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to email/phone</span>
              </button>

              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#3b0080] mb-5 shadow-sm">
                <Mail className="w-6 h-6 text-[#3b0080]" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Enter Verification Code
              </h2>
              <p className="text-slate-500 text-sm mt-1 mb-6 leading-relaxed">
                We sent a 6-digit OTP code to{' '}
                <span className="font-bold text-slate-900">{otpDestination}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
                    Enter 6-Digit Code
                  </label>
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
                        className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold text-slate-900 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#3b0080] focus:ring-4 focus:ring-purple-50 transition-all bg-slate-50/50"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium text-center">
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

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>Didn't receive code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
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
        </div>
      </div>
    </div>
  );
};
