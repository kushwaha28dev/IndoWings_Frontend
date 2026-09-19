import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenFeedback }) => {
  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoPlatform = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('platform');
    window.history.pushState({}, '', '/platform');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoCommandCenter = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('command-center');
    window.history.pushState({}, '', '/command-center');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoGcs = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('gcs');
    window.history.pushState({}, '', '/gcs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoDownloads = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('downloads');
    window.history.pushState({}, '', '/downloads');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoVersions = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('versions');
    window.history.pushState({}, '', '/release-notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07111d] text-slate-300 py-16 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <a href="/" onClick={handleGoHome} className="inline-block">
              <img 
                src="/indowings-logo-white.svg" 
                alt="IndoWings" 
                className="h-7 w-auto object-contain"
              />
              <span className="block text-sm text-slate-400 font-medium mt-1.5">
                Enterprise drone operations
              </span>
            </a>
            <p className="text-sm text-slate-300/90 leading-relaxed max-w-xs">
              Ground control, fleet coordination, role-based operations, and audit-ready Command Center workflows.
            </p>
            <p className="text-[13px] text-slate-400">
              Official site: indowings.com. Owned by IndoWings Technologies.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h2 className="text-[15px] font-bold text-white mb-4">Product</h2>
            <ul className="space-y-3 text-sm text-slate-300/85">
              <li>
                <a 
                  href="/platform" 
                  onClick={handleGoPlatform}
                  className="hover:text-white transition-colors"
                >
                  How IndoWings Works
                </a>
              </li>
              <li>
                <a 
                  href="/gcs" 
                  onClick={handleGoGcs} 
                  className="hover:text-white transition-colors"
                >
                  IndoWings GCS
                </a>
              </li>
              <li>
                <a 
                  href="/command-center" 
                  onClick={handleGoCommandCenter} 
                  className="hover:text-white transition-colors"
                >
                  Command Center
                </a>
              </li>
              <li><a href="/downloads" onClick={handleGoDownloads} className="hover:text-white transition-colors">Downloads</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h2 className="text-[15px] font-bold text-white mb-4">Resources</h2>
            <ul className="space-y-3 text-sm text-slate-300/85">
              <li>
                <a href="/docs" onClick={(e) => { e.preventDefault(); onNavigate?.('docs'); window.history.pushState({}, '', '/docs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/feedback" onClick={(e) => { e.preventDefault(); onNavigate?.('feedback'); window.history.pushState({}, '', '/feedback'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                  Feedback & Reviews
                </a>
              </li>
              <li>
                <a href="/support?tab=expert" onClick={(e) => { e.preventDefault(); onNavigate?.('support'); window.history.pushState({}, '', '/support?tab=expert'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <span>Talk to Expert</span>
                  <span className="text-[10px] bg-green-900/60 text-green-300 px-1.5 py-0.5 rounded font-mono">LIVE</span>
                </a>
              </li>
              <li>
                <a href="/support?tab=guide" onClick={(e) => { e.preventDefault(); onNavigate?.('support'); window.history.pushState({}, '', '/support?tab=guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-300 transition-colors">
                  Customer Guide
                </a>
              </li>
              <li>
                <a href="/support?tab=fix" onClick={(e) => { e.preventDefault(); onNavigate?.('support'); window.history.pushState({}, '', '/support?tab=fix'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-300 transition-colors">
                  Fix & Troubleshoot Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h2 className="text-[15px] font-bold text-white mb-4">Company</h2>
            <ul className="space-y-3 text-sm text-slate-300/85">
              <li><a href="/company" onClick={(e) => { e.preventDefault(); onNavigate?.('company'); window.history.pushState({}, '', '/company'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Company information</a></li>
              <li><a href="mailto:support@indowings.com" className="hover:text-white transition-colors text-purple-300 hover:underline">support@indowings.com</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-[15px] font-bold text-white mb-4">Legal</h2>
            <ul className="space-y-3 text-sm text-slate-300/85">
              {[
                { label: 'Privacy Policy', hash: 'privacy' },
                { label: 'Terms of Use', hash: 'terms' },
                { label: 'Security Disclosure', hash: 'security' },
                { label: 'Data Protection', hash: 'data-protection' },
              ].map(item => (
                <li key={item.hash}>
                  <a href={`/legal#${item.hash}`}
                    onClick={e => {
                      e.preventDefault();
                      if (onNavigate) onNavigate('legal');
                      window.history.pushState({}, '', `/legal#${item.hash}`);
                      window.scrollTo({ top: 0 });
                    }}
                    className="hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[13px] text-slate-400 gap-4">
          <span>&copy; 2026 IndoWings.</span>
          <span>Built for aviation-grade operational clarity. DGCA & Aerospace Compliance.</span>
        </div>
      </div>
    </footer>
  );
};


