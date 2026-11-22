import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Info,
  Mail,
  Cookie,
  ExternalLink,
  AlertTriangle,
  Database,
  Scale,
  Crosshair,
  Smartphone,
} from 'lucide-react';
import { LegalRoutePath } from '../utils/seo';
import { playCyberClick } from '../utils/sound';

interface LegalPagesProps {
  route: LegalRoutePath;
  onNavigate: (path: string, hash?: string) => void;
}

const LAST_UPDATED_LABEL = 'November 20, 2026';

const POLICY_NAV_ITEMS: Array<{ path: LegalRoutePath; label: string }> = [
  { path: '/about-us', label: 'About Us' },
  { path: '/contact-us', label: 'Contact Us' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms-and-conditions', label: 'Terms & Conditions' },
  { path: '/cookie-policy', label: 'Cookie Policy' },
];

export const LegalPages: React.FC<LegalPagesProps> = ({ route, onNavigate }) => {
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    hash?: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    playCyberClick('click');
    onNavigate(path, hash);
  };

  const renderBadgeAndHeader = (
    icon: React.ReactNode,
    badge: string,
    title: string,
    subtitle: string
  ) => (
    <div className="border-b border-zinc-800/80 pb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#00FF66]/50 text-xs font-mono-code text-zinc-200 hover:text-[#00FF66] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>Back to Sensitivity Generator</span>
        </a>

        <span className="text-[11px] font-mono-code px-2.5 py-1 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
          Last Updated: {LAST_UPDATED_LABEL}
        </span>
      </div>

      <div className="flex items-start gap-3.5 pt-1">
        <div className="w-11 h-11 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] shrink-0">
          {icon}
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#00FF66] block">
            {badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-cyber text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        </div>
      </div>

      <nav
        aria-label="Policy and Information Pages"
        className="flex flex-wrap items-center gap-2 pt-2"
      >
        {POLICY_NAV_ITEMS.map((item) => {
          const active = item.path === route;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleLinkClick(e, item.path)}
              aria-current={active ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-colors border ${
                active
                  ? 'bg-[#00FF66] text-black font-bold border-[#00FF66]'
                  : 'bg-black/60 text-zinc-300 border-zinc-800 hover:border-[#00FF66]/40 hover:text-[#00FF66]'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );

  const renderPrivacyPolicy = () => (
    <article className="space-y-6">
      {renderBadgeAndHeader(
        <ShieldCheck className="w-6 h-6" />,
        'Legal Documentation • Privacy',
        'PRIVACY POLICY',
        'How SensiVerse handles browser storage (localStorage), shared preset URLs, advertising placements, Google AdSense cookies, and your privacy rights.'
      )}

      <div className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            1. Overview &amp; No-Account Client-Side Architecture
          </h2>
          <p>
            SensiVerse (<strong className="text-white">https://sensiverse.vercel.app/</strong>) is a free, browser-based sensitivity, Android DPI, and HUD calibration tool built for Free Fire India and Free Fire MAX players. You can use all calibration features without creating an account, signing in, or submitting personal details such as your name, password, phone number, or physical address.
          </p>
          <p>
            SensiVerse does not maintain a user account database or collect first-party personal profiles on a backend server. All phone lookup matching, sensitivity formulas, and preset history run directly inside your web browser.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00FF66]" />
            <span>2. Information Stored Locally on Your Device (localStorage)</span>
          </h2>
          <p>
            To make saving and restoring configurations convenient without requiring an account, SensiVerse writes non-personal configuration data solely to your browser&apos;s <code className="text-[#00FF66] font-mono-code">localStorage</code>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>
              <strong className="text-white font-mono-code">sensiverse_saved_presets_v1</strong>: Stores sensitivity presets you manually save or automatically generate in <em>My Previous Sensi</em> (device brand/model, game engine, grip style, playstyle, 0–200 slider values, fire button percentage, and timestamps), along with presets you choose to import or export as JSON files on your own device.
            </li>
            <li>
              <strong className="text-white font-mono-code">sensiverse_gen_history_v1</strong>: Stores step counters and calibration signatures per selected game and phone model (capped at 250 recent device keys) so clicking <em>Try New Sensi</em> avoids repeating identical numbers back-to-back.
            </li>
          </ul>
          <p>
            No personal identity data is written to <code className="text-[#00FF66] font-mono-code">localStorage</code>. You can delete individual saved presets inside <em>My Previous Sensi</em> or erase all stored data at any time through your browser&apos;s site storage settings.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            3. Shareable URL Parameters, Clipboard &amp; Sound Effects
          </h2>
          <p>
            When you use the <em>Share</em> or <em>Copy All Settings</em> actions, SensiVerse generates a shareable URL containing only non-personal calibration parameters (<code className="text-zinc-200 font-mono-code">?game=</code>, <code className="text-zinc-200 font-mono-code">?phone=</code>, <code className="text-zinc-200 font-mono-code">?style=</code>, <code className="text-zinc-200 font-mono-code">?weapon=</code>, <code className="text-zinc-200 font-mono-code">?fps=</code>) and interacts with your browser clipboard or native share sheet only when triggered by your click. Optional UI sound effects use the browser Web Audio API in memory for the current session only and are never recorded or transmitted.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            4. Analytics, Hosting Infrastructure &amp; External Font Delivery
          </h2>
          <p>
            Based on the current SensiVerse application codebase, <strong className="text-white">no first-party behavioral analytics SDK or Google Analytics (<code className="font-mono-code">gtag.js</code>) tracking script is integrated</strong>.
          </p>
          <p>
            When you load pages or static assets from our hosting provider (Vercel) or load display fonts from Google Fonts (<code className="text-zinc-200 font-mono-code">fonts.googleapis.com</code> and <code className="text-zinc-200 font-mono-code">fonts.gstatic.com</code>), standard network request metadata (such as IP address, browser user-agent, timestamp, and requested path) is processed by those infrastructure providers solely to deliver the webpage and typography securely and reliably.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            5. Advertising &amp; Google AdSense Cookies
          </h2>
          <p>
            SensiVerse includes the Google AdSense site verification script in the page header and renders dedicated advertising placement containers (<code className="text-zinc-200 font-mono-code">AdSenseUnit</code>) prepared for Google AdSense to keep the tool 100% free for players without subscriptions or paywalls. Currently, those on-page containers display static sponsor placement placeholders until live Google AdSense ad units are enabled by the site administrator.
          </p>
          <p>
            When Google AdSense and its certified third-party ad vendors serve advertisements on SensiVerse:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>
              <strong className="text-white">Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to SensiVerse or other websites across the internet.
            </li>
            <li>
              <strong className="text-white">Personalized &amp; Non-Personalized Advertising:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve personalized ads based on your visit to SensiVerse and/or other sites. Where required by law or user choice, Google may serve non-personalized ads using contextual page signals and coarse geographic region rather than personalized interest profiles (though technical cookies may still be used for frequency capping, aggregated reporting, and fraud prevention).
            </li>
            <li>
              <strong className="text-white">Managing Ad Personalization:</strong> You may opt out of personalized advertising anytime by visiting{' '}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                Google Ads Settings <ExternalLink className="w-3 h-3" />
              </a>
              , review{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                How Google uses data from partner sites <ExternalLink className="w-3 h-3" />
              </a>
              , or opt out of participating third-party ad vendors via{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                AboutAds <ExternalLink className="w-3 h-3" />
              </a>{' '}
              or{' '}
              <a
                href="https://www.youronlinechoices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                YourOnlineChoices <ExternalLink className="w-3 h-3" />
              </a>.
            </li>
          </ul>
          <p>
            For complete details on storage technologies and cookie controls, please read our{' '}
            <a
              href="/cookie-policy"
              onClick={(e) => handleLinkClick(e, '/cookie-policy')}
              className="text-[#00FF66] hover:underline"
            >
              Cookie Policy
            </a>.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            6. Your Privacy Rights &amp; Regional Protections
          </h2>
          <p>
            Depending on your jurisdiction (including India&apos;s Digital Personal Data Protection frameworks, the EEA/UK GDPR, and US state privacy laws such as the CCPA/CPRA), you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>Know what categories of browser storage or advertising cookies are active when you visit SensiVerse.</li>
            <li>Inspect, export, or delete locally saved presets in <em>My Previous Sensi</em> or clear your browser&apos;s <code className="font-mono-code">localStorage</code> and cookies at any time.</li>
            <li>Opt out of personalized advertising via Google Ads Settings, industry opt-out portals, or regional consent controls when live ads are active.</li>
          </ul>
          <p>
            Because SensiVerse does not maintain user accounts or collect personal profiles on its own servers, there is no account data held centrally by SensiVerse.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            7. Children&apos;s Privacy &amp; Policy Updates
          </h2>
          <p>
            SensiVerse does not knowingly collect personal information from children under the age of 13 (or the applicable age of digital consent in your country). If we update this Privacy Policy—for example when activating live Google AdSense tags or adding a verified support email—we will update the &ldquo;Last Updated&rdquo; date above. For inquiries, visit our{' '}
            <a
              href="/contact-us"
              onClick={(e) => handleLinkClick(e, '/contact-us')}
              className="text-[#00FF66] hover:underline"
            >
              Contact Us
            </a>{' '}
            page.
          </p>
        </section>
      </div>
    </article>
  );

  const renderTermsAndConditions = () => (
    <article className="space-y-6">
      {renderBadgeAndHeader(
        <Scale className="w-6 h-6" />,
        'Legal Documentation • Terms',
        'TERMS & CONDITIONS',
        'Rules, fair-play disclaimers, non-affiliation notices, and usage guidelines governing access to SensiVerse.'
      )}

      <div className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            1. Acceptance of Terms &amp; Free Access
          </h2>
          <p>
            By accessing or using SensiVerse (<strong className="text-white">https://sensiverse.vercel.app/</strong>), you agree to be bound by these Terms &amp; Conditions. SensiVerse is provided strictly as a free online utility—there are no paid plans, subscriptions, virtual currencies, or locked premium tiers.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            2. Non-Affiliation Disclaimer
          </h2>
          <p>
            SensiVerse is an independent gaming utility and educational resource. SensiVerse is <strong className="text-white">not affiliated with, endorsed by, sponsored by, or officially connected to Garena</strong>, Free Fire, Free Fire MAX, or any smartphone manufacturer (including Apple, Samsung, Xiaomi, POCO, Redmi, iQOO, vivo, OPPO, OnePlus, realme, Motorola, ASUS, or others). All product names and trademarks belong to their respective owners.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            3. Fair-Play Policy &amp; Realistic Calibration Results
          </h2>
          <p>
            All sensitivity values (0–200 scale), fire button sizing recommendations (10%–100% slider), and Android Smallest Width (DPI) guidelines generated by SensiVerse are mathematical starting points derived from published smartphone hardware specifications (screen diagonal, refresh rate, touch polling profiles, and player grip mechanics).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>SensiVerse does <strong className="text-white">not</strong> guarantee automatic headshots, zero recoil, or specific competitive rankings.</li>
            <li>SensiVerse does <strong className="text-white">not</strong> distribute cheats, hacks, APK modifiers, macros, sensitivity injectors, or scripts, and never alters game files.</li>
            <li>All sensitivity values are intended to be entered manually inside the official native settings menu of Free Fire India or Free Fire MAX.</li>
            <li>Adjusting Android Developer Options (such as Minimum/Smallest Width DPI) modifies system UI scaling at the user&apos;s discretion; SensiVerse recommends staying within conservative ranges and reverting to your phone&apos;s stock width if system UI scaling appears uncomfortable.</li>
          </ul>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            4. Intellectual Property &amp; Acceptable Use
          </h2>
          <p>
            The SensiVerse name, interface design, custom calibration formulas, device dataset compilation, and original editorial guides are protected by applicable intellectual property laws. You may freely use the tool for personal gameplay, export your personal saved presets JSON, and share calibration URLs with teammates. You agree not to scrape, mirror, reverse-engineer for automated abuse, or disrupt the availability of the website.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            5. Third-Party Advertisements &amp; External Links
          </h2>
          <p>
            SensiVerse includes designated advertising placement containers (<code className="font-mono-code text-zinc-200">AdSenseUnit</code>) and links to external policy resources (such as Google privacy documentation). Third-party advertisements and external websites are governed by the terms and privacy policies of their respective operators, and SensiVerse is not responsible for third-party content or external product offers.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            6. Disclaimer of Warranties &amp; Limitation of Liability
          </h2>
          <p>
            SensiVerse is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis without warranties of any kind, whether express or implied. To the fullest extent permitted by law, SensiVerse shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website, local browser storage loss, or device configuration changes. We reserve the right to update these Terms &amp; Conditions at any time. Please also review our{' '}
            <a
              href="/privacy-policy"
              onClick={(e) => handleLinkClick(e, '/privacy-policy')}
              className="text-[#00FF66] hover:underline"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/cookie-policy"
              onClick={(e) => handleLinkClick(e, '/cookie-policy')}
              className="text-[#00FF66] hover:underline"
            >
              Cookie Policy
            </a>.
          </p>
        </section>
      </div>
    </article>
  );

  const renderAboutUs = () => (
    <article className="space-y-6">
      {renderBadgeAndHeader(
        <Info className="w-6 h-6" />,
        'About SensiVerse',
        'ABOUT US',
        'Hardware-matched Free Fire India and Free Fire MAX sensitivity, Android DPI, and fire button HUD calibration—built with fair-play transparency.'
      )}

      <div className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            Why SensiVerse Exists
          </h2>
          <p>
            Copying random sensitivity numbers from another player&apos;s phone rarely works in Free Fire India or Free Fire MAX. A compact 6.1-inch 60Hz smartphone and a 6.78-inch 144Hz gaming phone respond completely differently to identical thumb swipe speeds. SensiVerse was created to give mobile players a mathematical, device-aware starting baseline instead of clickbait claims.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2">
            <div className="flex items-center gap-2 text-[#00FF66] font-cyber text-sm font-bold">
              <Smartphone className="w-4 h-4" />
              <span>1,089 Phone Profiles</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Covers mainstream Android devices across India and global markets alongside Apple iPhone models, factoring in screen diagonal, refresh rate (60Hz–165Hz), touch polling behavior, and custom device entry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2">
            <div className="flex items-center gap-2 text-[#00FF66] font-cyber text-sm font-bold">
              <Crosshair className="w-4 h-4" />
              <span>0–200 Scale &amp; HUD Math</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calibrates General, Red Dot, 2X Scope, 4X Scope, Sniper Scope, Free Look, Android Smallest Width (DPI), 2/3/4-finger claw layouts, 6 weapon classes, and 10%–100% fire button runway geometry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2">
            <div className="flex items-center gap-2 text-[#00FF66] font-cyber text-sm font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Fair-Play &amp; Free</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No login required, no paid plans or subscriptions, no APK injections, and local-only preset storage in <em>My Previous Sensi</em> with optional Brazilian and Indonesian benchmark presets.
            </p>
          </div>
        </div>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            Independent Utility Notice
          </h2>
          <p>
            SensiVerse operates independently and is not affiliated with Garena or any device manufacturer. All recommendations are designed for manual entry inside official in-game settings and practical validation inside the Training Ground. Have feedback or a phone model suggestion? Visit our{' '}
            <a
              href="/contact-us"
              onClick={(e) => handleLinkClick(e, '/contact-us')}
              className="text-[#00FF66] hover:underline"
            >
              Contact Us
            </a>{' '}
            page or return to the{' '}
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="text-[#00FF66] hover:underline"
            >
              Sensitivity Generator
            </a>.
          </p>
        </section>
      </div>
    </article>
  );

  const renderContactUs = () => (
    <article className="space-y-6">
      {renderBadgeAndHeader(
        <Mail className="w-6 h-6" />,
        'Support & Inquiries',
        'CONTACT US',
        'How to reach the SensiVerse site team for phone database updates, sensitivity feedback, privacy requests, or advertising inquiries.'
      )}

      <div className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-cyber font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Contact Email Setup Required</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
            A public support email address has not yet been configured in the application source code. To avoid publishing an unverified or placeholder email, the site owner must add their verified contact email address here prior to final AdSense review.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-3">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            What You Can Contact Us About
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-zinc-950/90 border border-zinc-800 space-y-1">
              <strong className="text-[#00FF66] font-cyber block">Device Database Corrections</strong>
              <p className="text-zinc-400">
                Report a missing smartphone model, updated refresh rate specs, or display size details across our 1,089-device catalog.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-950/90 border border-zinc-800 space-y-1">
              <strong className="text-[#00FF66] font-cyber block">Calibration &amp; UI Bug Reports</strong>
              <p className="text-zinc-400">
                Share browser compatibility issues, layout bugs, or preset import/export questions for Free Fire India and Free Fire MAX.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-950/90 border border-zinc-800 space-y-1">
              <strong className="text-[#00FF66] font-cyber block">Privacy &amp; Cookie Inquiries</strong>
              <p className="text-zinc-400">
                Questions regarding localStorage usage, Google AdSense cookie disclosures, or regional privacy rights.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-950/90 border border-zinc-800 space-y-1">
              <strong className="text-[#00FF66] font-cyber block">Advertising &amp; Sponsorships</strong>
              <p className="text-zinc-400">
                Direct inquiries related to esports hardware sponsor placements shown inside SensiVerse ad slots.
              </p>
            </div>
          </div>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            Helpful Self-Service Resources
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            For common sensitivity, Over-Drag, DPI, and fire button questions, browse the{' '}
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/', '#faq')}
              className="text-[#00FF66] hover:underline"
            >
              Frequently Asked Questions
            </a>{' '}
            or read our{' '}
            <a
              href="/privacy-policy"
              onClick={(e) => handleLinkClick(e, '/privacy-policy')}
              className="text-[#00FF66] hover:underline"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/terms-and-conditions"
              onClick={(e) => handleLinkClick(e, '/terms-and-conditions')}
              className="text-[#00FF66] hover:underline"
            >
              Terms &amp; Conditions
            </a>.
          </p>
        </section>
      </div>
    </article>
  );

  const renderCookiePolicy = () => (
    <article className="space-y-6">
      {renderBadgeAndHeader(
        <Cookie className="w-6 h-6" />,
        'Legal Documentation • Cookies',
        'COOKIE POLICY',
        'Clear breakdown of browser localStorage keys currently used by SensiVerse and how Google AdSense advertising cookies operate.'
      )}

      <div className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            1. What Are Cookies &amp; Browser Storage?
          </h2>
          <p>
            Cookies are small text files stored by your web browser when you visit websites. Modern web applications also use browser <code className="font-mono-code text-[#00FF66]">localStorage</code> to save application state directly on your device without sending it to a remote server on every page request.
          </p>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            2. Technologies Currently Used in SensiVerse
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-300">
            <li>
              <strong className="text-white">Essential Functional Storage (<code className="font-mono-code text-[#00FF66]">localStorage</code>):</strong> SensiVerse uses two client-side storage keys—<code className="font-mono-code text-zinc-200">sensiverse_saved_presets_v1</code> (for saving and restoring presets in <em>My Previous Sensi</em>) and <code className="font-mono-code text-zinc-200">sensiverse_gen_history_v1</code> (for avoiding duplicate sensitivity outputs across repeated generations on a device). Sound toggle state stays strictly in temporary memory for your open tab.
            </li>
            <li>
              <strong className="text-white">First-Party Tracking &amp; Analytics Cookies:</strong> None. SensiVerse currently sets no first-party login cookies, tracking cookies, or Google Analytics cookies.
            </li>
            <li>
              <strong className="text-white">Google Fonts CDN:</strong> Page stylesheets load typography from <code className="font-mono-code text-zinc-200">fonts.googleapis.com</code> and <code className="font-mono-code text-zinc-200">fonts.gstatic.com</code>; Google Fonts serves CSS and font files without setting advertising cookies.
            </li>
          </ul>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            3. Google AdSense &amp; Third-Party Advertising Cookies
          </h2>
          <p>
            SensiVerse includes the Google AdSense site verification script in the page header and renders ad container slots (<code className="font-mono-code text-zinc-200">AdSenseUnit</code>) prepared for Google AdSense. Right now, those visual ad slots display static sponsor placeholders until live ad placements are activated.
          </p>
          <p>
            When Google AdSense serves live ads on SensiVerse, third-party vendors—including Google—may set and read cookies or device identifiers in your browser (such as Google advertising cookies like <code className="font-mono-code text-zinc-200">IDE</code>, <code className="font-mono-code text-zinc-200">__gads</code>, <code className="font-mono-code text-zinc-200">__gpi</code>, or <code className="font-mono-code text-zinc-200">NID</code>) for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li><strong className="text-white">Personalized Advertising:</strong> Showing ads relevant to your interests based on visits to SensiVerse and other websites.</li>
            <li><strong className="text-white">Non-Personalized Advertising &amp; Essential Ad Functions:</strong> When non-personalized ads are served, Google does not rely on behavioral interest profiles, but cookies or local storage may still be used for frequency capping, aggregated ad reporting, and combating click fraud.</li>
          </ul>
        </section>

        <section className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800/90 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
            4. How to Manage Cookies, Opt Out, or Clear Local Data
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li>
              <strong className="text-white">Google Ad Preferences:</strong> Manage ad personalization via{' '}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                Google Ads Settings <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and learn more at{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                Google Advertising Technologies <ExternalLink className="w-3 h-3" />
              </a>.
            </li>
            <li>
              <strong className="text-white">Industry Opt-Out Tools:</strong> Opt out of interest-based cookies from participating third-party ad networks at{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                aboutads.info/choices <ExternalLink className="w-3 h-3" />
              </a>{' '}
              or{' '}
              <a
                href="https://www.youronlinechoices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF66] hover:underline inline-flex items-center gap-1"
              >
                youronlinechoices.com <ExternalLink className="w-3 h-3" />
              </a>.
            </li>
            <li>
              <strong className="text-white">Browser Settings:</strong> You can block or delete cookies and site <code className="font-mono-code text-zinc-200">localStorage</code> at any time in Chrome, Safari, Edge, or Firefox settings. Clearing <code className="font-mono-code text-zinc-200">localStorage</code> will remove locally saved presets in <em>My Previous Sensi</em> unless you export a JSON backup first.
            </li>
          </ul>
          <p className="pt-1">
            Related documents:{' '}
            <a
              href="/privacy-policy"
              onClick={(e) => handleLinkClick(e, '/privacy-policy')}
              className="text-[#00FF66] hover:underline"
            >
              Privacy Policy
            </a>{' '}
            •{' '}
            <a
              href="/terms-and-conditions"
              onClick={(e) => handleLinkClick(e, '/terms-and-conditions')}
              className="text-[#00FF66] hover:underline"
            >
              Terms &amp; Conditions
            </a>
          </p>
        </section>
      </div>
    </article>
  );

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-[#08100b]/95 border border-zinc-800 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF66]/40 pointer-events-none" />

        {route === '/privacy-policy' && renderPrivacyPolicy()}
        {route === '/terms-and-conditions' && renderTermsAndConditions()}
        {route === '/about-us' && renderAboutUs()}
        {route === '/contact-us' && renderContactUs()}
        {route === '/cookie-policy' && renderCookiePolicy()}
      </div>
    </section>
  );
};
