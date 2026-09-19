import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, User, Lock, Loader2, Truck, Shield, Zap, ArrowLeft, CheckCircle2, RotateCcw, KeyRound } from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onSuccess: (user: DeliveryUser, token: string) => void;
  defaultMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // OTP Verification Step State (Supports both Email and Phone)
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpPhone, setActiveOtpPhone] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone'>('phone');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
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

  const isAdminLogin = loginEmail.toLowerCase().trim().endsWith('@indowings.com');

  // Handle OTP sending (Email or Phone)
  const handleSendOtp = async ({
    targetPhone,
    targetEmail,
    userName
  }: {
    targetPhone?: string;
    targetEmail?: string;
    userName?: string;
  }) => {
    const isEmail = Boolean(targetEmail && targetEmail.includes('@') && !targetPhone);
    const cleanPhone = targetPhone ? targetPhone.replace(/[^0-9]/g, '').slice(-10) : '';

    if (!isEmail && cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number or email address');
      return false;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone || undefined,
          email: targetEmail?.trim() || undefined,
          name: userName
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code. Please try again.');
        return false;
      }

      setOtpChannel(isEmail ? 'email' : 'phone');
      setOtpDestination(isEmail ? targetEmail!.trim() : `+91 ${cleanPhone}`);
      if (cleanPhone) setActiveOtpPhone(cleanPhone);
      setOtpStep(true);
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      return true;
    } catch {
      setError('Cannot connect to server. Please verify backend service.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submit -> triggers Phone + Email OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Full name is required'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email address is required'); return; }
    await handleSendOtp({ targetPhone: phone, userName: name, targetEmail: email });
  };

  // Verify OTP and Complete Account Creation / Login
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpChannel === 'phone' ? activeOtpPhone : undefined,
          email: otpChannel === 'email' ? otpDestination : (email.trim() || undefined),
          otp: fullOtp,
          name: name.trim() || undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid verification code. Please check and try again.');
        return;
      }

      localStorage.setItem('iw_delivery_token', data.token);
      localStorage.setItem('iw_delivery_user', JSON.stringify(data.user));
      onSuccess(data.user, data.token);

      if (data.user.role === 'admin') {
        onNavigate('dispatch');
        window.history.pushState({}, '', '/dispatch');
      } else {
        onNavigate('order');
        window.history.pushState({}, '', '/order');
      }
    } catch {
      setError('Verification failed. Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle direct Password / Admin login OR Email/Phone OTP login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = loginEmail.trim();
    if (!val) { setError('Please enter your email or mobile number'); return; }

    // If Admin with password filled, submit password login
    if (isAdminLogin && loginPassword) {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/delivery/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: val,
            password: loginPassword
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Admin sign in failed. Check password.');
          return;
        }

        localStorage.setItem('iw_delivery_token', data.token);
        localStorage.setItem('iw_delivery_user', JSON.stringify(data.user));
        onSuccess(data.user, data.token);
        onNavigate('dispatch');
        window.history.pushState({}, '', '/dispatch');
        return;
      } catch {
        setError('Cannot connect to server. Ensure port 5000 is running.');
        return;
      } finally {
        setLoading(false);
      }
    }

    // If user typed an email address -> Send Email OTP
    if (val.includes('@')) {
      await handleSendOtp({ targetEmail: val });
      return;
    }

    // If user typed a phone number -> Send SMS OTP
    const phoneDigits = val.replace(/[^0-9]/g, '');
    if (phoneDigits.length >= 10) {
      await handleSendOtp({ targetPhone: phoneDigits });
      return;
    }

    setError('Please enter a valid email address or 10-digit mobile number');
  };

  // OTP Box inputs navigation
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    // Auto advance focus
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
    <div className="min-h-screen flex">
      {/* LEFT — Branding Panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #09090b 55%, #141418 100%)' }}>
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        
        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <button onClick={() => { onNavigate('home'); window.history.pushState({}, '', '/'); }}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <img src="/indowings-logo-white.svg" alt="IndoWings" className="h-10 w-auto mb-8"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-bold text-white/80 tracking-widest uppercase mb-6">
            <Truck className="w-3.5 h-3.5 text-zinc-300" />
            <span>Autonomous Drone Delivery System</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Instant Air Logistics,<br />
            Certified by DGCA.
          </h1>

          <p className="text-white/70 text-base leading-relaxed max-w-md">
            Order drone deliveries in seconds across NCR, Noida, and Delhi corridors. Track every package with live telemetry down to the meter.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-1 gap-3.5">
          {[
            { icon: Zap, title: '24-Minute Average Delivery', desc: 'Point-to-point aerial transit bypassing road bottlenecks' },
            { icon: Shield, title: 'DGCA Compliant & Secure', desc: 'End-to-end encrypted payload verification and pilot-in-the-loop' },
            { icon: Truck, title: '1,000+ Autonomous Drones', desc: 'IndoWings Cyberone Pro & Max operational fleet' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-white/50 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form & OTP Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-white py-12">
        {/* Mobile back */}
        <button onClick={() => { onNavigate('home'); window.history.pushState({}, '', '/'); }}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors mb-8 lg:hidden">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="w-full max-w-md mx-auto">
          {/* Top Logo for mobile */}
          <div className="lg:hidden mb-6">
            <img src="/indowings-logo-dark.svg" alt="IndoWings" className="h-8 w-auto" />
          </div>

          {/* OTP VERIFICATION STEP */}
          {otpStep ? (
            <div>
              <button 
                onClick={() => { setOtpStep(false); setError(''); }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-zinc-900 mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to {otpChannel === 'email' ? 'Email' : 'Phone'} Entry
              </button>

              <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-900 mb-5 shadow-sm">
                {otpChannel === 'email' ? <Mail className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
              </div>

              <h2 className="text-2xl font-bold text-[#171222] mb-1.5">
                {otpChannel === 'email' ? 'Verify Email Address' : 'Verify Phone Number'}
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                We sent a 6-digit verification code to <span className="font-semibold text-[#171222]">{otpDestination}</span>
              </p>

              <div className="mb-6 p-4 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center gap-3">
                {otpChannel === 'email' ? (
                  <Mail className="w-5 h-5 text-zinc-900 shrink-0" />
                ) : (
                  <Shield className="w-5 h-5 text-zinc-900 shrink-0" />
                )}
                <p className="text-xs text-slate-600">
                  {otpChannel === 'email'
                    ? 'A 6-digit verification code has been dispatched to your email inbox. Please check your inbox or spam folder.'
                    : 'SMS with 6-digit verification code has been dispatched to your mobile number. Please check your SMS inbox.'}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* 6-box OTP Pin Inputs */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex gap-2.5 sm:gap-3 justify-between on-paste-area" onPaste={handlePasteOtp}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpInputsRef.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleDigitChange(idx, e.target.value)}
                        onKeyDown={e => handleDigitKeyDown(idx, e)}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-[#171222] border-2 border-slate-200 rounded-xl focus:outline-none focus:border-black focus:ring-4 focus:ring-zinc-300 transition-all bg-slate-50/50"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-lg shadow-black/10">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                </button>

                {/* Resend timer */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>Didn't receive the code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (otpChannel === 'email') {
                          handleSendOtp({ targetEmail: otpDestination });
                        } else {
                          handleSendOtp({ targetPhone: activeOtpPhone });
                        }
                      }}
                      className="font-bold text-zinc-900 hover:underline inline-flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Resend Code
                    </button>
                  ) : (
                    <span className="font-semibold text-slate-400">
                      Resend in {resendTimer}s
                    </span>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* NORMAL LOGIN / SIGNUP VIEW */
            <div>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#171222] mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Create Customer Account'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {mode === 'login'
                    ? 'Access your delivery command center and live tracking'
                    : 'Get started with instant drone package dispatch'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-8">
                {(['login', 'register'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      mode === m ? 'bg-white text-zinc-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {m === 'login' ? 'Sign In' : 'Sign Up with Phone OTP'}
                  </button>
                ))}
              </div>

              {/* SIGN UP FORM (triggers phone OTP flow) */}
              {mode === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="e.g. Puneet Kushwaha"
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm text-[#171222] placeholder:text-slate-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-zinc-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@company.com"
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm text-[#171222] placeholder:text-slate-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-zinc-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Mobile Number (for OTP verification)
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3.5 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-500 text-sm font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-r-xl text-sm text-[#171222] placeholder:text-slate-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-zinc-300 transition-all font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      A 6-digit OTP will be dispatched to this number to authenticate your account.
                    </p>
                  </div>

                  {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-base shadow-lg shadow-black/10 mt-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                    <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                  </button>
                </form>
              ) : (
                /* LOGIN FORM (Admin or Customer) */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {isAdminLogin && (
                    <div className="mb-4 px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-zinc-900 shrink-0" />
                      <p className="text-xs text-zinc-900 font-semibold">
                        Admin identity recognized. Please provide your secure admin password.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Email Address or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        required
                        placeholder="puneet@indowings.com or +91..."
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm text-[#171222] placeholder:text-slate-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-zinc-300 transition-all"
                      />
                    </div>
                  </div>

                  {isAdminLogin ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                          Admin Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm text-[#171222] placeholder:text-slate-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-zinc-300 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleSendOtp({ targetEmail: loginEmail.trim() })}
                          className="text-xs text-zinc-900 font-semibold hover:underline flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Or send OTP to admin email instead
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl p-3 bg-zinc-100 border border-zinc-200/80 flex items-center gap-2.5">
                      {loginEmail.includes('@') ? (
                        <Mail className="w-4 h-4 text-zinc-900 shrink-0" />
                      ) : (
                        <Phone className="w-4 h-4 text-zinc-900 shrink-0" />
                      )}
                      <p className="text-xs text-slate-600">
                        {loginEmail.includes('@')
                          ? 'A 6-digit verification code will be sent to your email.'
                          : 'Enter your 10-digit mobile number or email address above.'}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-base shadow-lg shadow-black/10 mt-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isAdminLogin && loginPassword ? (
                      <Lock className="w-5 h-5" />
                    ) : loginEmail.includes('@') ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                    <span>
                      {loading
                        ? 'Sending Code...'
                        : isAdminLogin && loginPassword
                        ? 'Sign In with Password'
                        : loginEmail.includes('@')
                        ? 'Send Email OTP'
                        : 'Send Mobile SMS OTP'}
                    </span>
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-slate-400 mt-6">
                {mode === 'login' ? "New to IndoWings Delivery? " : 'Already registered? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  className="text-zinc-900 font-semibold hover:underline">
                  {mode === 'login' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
