import React from 'react';
import { ArrowUp, Shield } from 'lucide-react';
import { playCyberClick } from '../utils/sound';
import { BRAND_SLUG_ENTRIES, buildPhonesHubPath } from '../utils/slugs';

interface FooterProps {
  onNavigate?: (path: string, hash?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    playCyberClick('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    hash?: string
  ) => {
    if (!onNavigate) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    playCyberClick('click');
    onNavigate(path, hash);
  };

  return (
    <footer className="w-full bg-[#030604] border-t border-zinc-900 pt-10 pb-8 px-4 sm:px-6 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
          
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-black border border-[#00FF66]/40 flex items-center justify-center overflow-hidden p-0.5 shadow-[0_0_12px_rgba(0,255,102,0.3)] shrink-0">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/favicon-48x48.webp" type="image/webp" />
                <img
                  src="/favicon-48x48.png"
                  alt="SensiVerse Official Logo"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </picture>
            </div>
            <div>
              <span className="font-cyber font-black text-lg text-white tracking-wider">
                SENSI<span className="text-[#00FF66]">VERSE</span>
              </span>
              <p className="text-[11px] text-zinc-500 font-mono-code">
                Device Touch & Sensitivity Engine • Built for Mobile Esports
              </p>
            </div>
          </a>

          <nav aria-label="Footer Quick Links" className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 text-xs font-mono-code text-zinc-400">
            <a href="#device-selector" onClick={(e) => handleLinkClick(e, '/', '#device-selector')} title="Phone selector for Free Fire India sensitivity and DPI" className="text-white hover:text-[#00FF66] transition-colors font-medium">
              Free Fire India 🇮🇳
            </a>
            <span aria-hidden="true">•</span>
            <a href="#step-6-results" onClick={(e) => handleLinkClick(e, '/', '#step-6-results')} title="Generated Free Fire MAX 0-200 sensitivity settings" className="text-white hover:text-[#00FF66] transition-colors font-medium">
              Free Fire MAX 🔥
            </a>
            <span aria-hidden="true">•</span>
            <a href="#fire-button-hud" onClick={(e) => handleLinkClick(e, '/', '#fire-button-hud')} title="Free Fire fire button size and claw/thumb HUD layout" className="text-zinc-300 hover:text-[#00FF66] transition-colors">
              Fire Button HUD
            </a>
            <span aria-hidden="true">•</span>
            <a href="#training-ground" onClick={(e) => handleLinkClick(e, '/', '#training-ground')} title="Free Fire Training Ground sensitivity verification workflow" className="text-zinc-300 hover:text-[#00FF66] transition-colors">
              Training Ground
            </a>
            <span aria-hidden="true">•</span>
            <a href="#seo-guides-heading" onClick={(e) => handleLinkClick(e, '/', '#seo-guides-heading')} title="Free Fire sensitivity, Android DPI and touch physics guides" className="text-zinc-300 hover:text-[#00FF66] transition-colors">
              DPI &amp; Sensitivity Guides
            </a>
            <span aria-hidden="true">•</span>
            <a href="#faq" onClick={(e) => handleLinkClick(e, '/', '#faq')} title="Free Fire India and MAX sensitivity FAQ" className="text-zinc-300 hover:text-[#00FF66] transition-colors">
              FAQ
            </a>
          </nav>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-[#00FF66] transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

        </div>

        <nav
          aria-label="Browse by Phone Brand"
          className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1.5 pb-4 border-b border-zinc-900/80 text-[11px] font-mono-code text-zinc-400"
        >
          <a
            href={buildPhonesHubPath()}
            onClick={(e) => handleLinkClick(e, buildPhonesHubPath())}
            className="text-[#00FF66] font-semibold hover:underline"
          >
            All 26 Brands
          </a>
          {BRAND_SLUG_ENTRIES.map((entry) => (
            <React.Fragment key={entry.slug}>
              <span aria-hidden="true" className="text-zinc-800">•</span>
              <a
                href={entry.path}
                onClick={(e) => handleLinkClick(e, entry.path)}
                className="hover:text-[#00FF66] transition-colors"
              >
                {entry.brand}
              </a>
            </React.Fragment>
          ))}
        </nav>

        <nav
          aria-label="Legal and Information Links"
          className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 pb-4 border-b border-zinc-900/80 text-[11px] font-mono-code text-zinc-400"
        >
          <a
            href="/about-us"
            onClick={(e) => handleLinkClick(e, '/about-us')}
            className="hover:text-[#00FF66] transition-colors"
          >
            About Us
          </a>
          <span aria-hidden="true" className="text-zinc-700">•</span>
          <a
            href="/contact-us"
            onClick={(e) => handleLinkClick(e, '/contact-us')}
            className="hover:text-[#00FF66] transition-colors"
          >
            Contact Us
          </a>
          <span aria-hidden="true" className="text-zinc-700">•</span>
          <a
            href="/privacy-policy"
            onClick={(e) => handleLinkClick(e, '/privacy-policy')}
            className="hover:text-[#00FF66] transition-colors"
          >
            Privacy Policy
          </a>
          <span aria-hidden="true" className="text-zinc-700">•</span>
          <a
            href="/terms-and-conditions"
            onClick={(e) => handleLinkClick(e, '/terms-and-conditions')}
            className="hover:text-[#00FF66] transition-colors"
          >
            Terms &amp; Conditions
          </a>
          <span aria-hidden="true" className="text-zinc-700">•</span>
          <a
            href="/cookie-policy"
            onClick={(e) => handleLinkClick(e, '/cookie-policy')}
            className="hover:text-[#00FF66] transition-colors"
          >
            Cookie Policy
          </a>
        </nav>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono-code">
          <p>
            © {new Date().getFullYear()} SensiVerse. All rights reserved. Not affiliated with Garena.
          </p>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Fair-Play Certified • Zero 3rd Party Injections</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
