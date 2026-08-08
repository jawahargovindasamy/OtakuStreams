import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Copyright, 
  UserCheck, 
  Mail, 
  BookOpen, 
  ChevronRight,
  Clock,
  EyeOff
} from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

const sections = [
  { id: "acceptance", label: "1. Acceptance of Terms", icon: ShieldCheck },
  { id: "eligibility", label: "2. Eligibility & Accounts", icon: UserCheck },
  { id: "services", label: "3. Scope of Service", icon: BookOpen },
  { id: "disclaimer", label: "4. Third-Party Streams Disclaimer", icon: EyeOff },
  { id: "copyright", label: "5. Intellectual Property & DMCA", icon: Copyright },
  { id: "conduct", label: "6. User Code of Conduct", icon: Scale },
  { id: "liability", label: "7. Limitation of Liability", icon: AlertTriangle },
  { id: "contact", label: "8. Contact & Support", icon: Mail },
];

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    document.title = "Terms of Service — OtakuStreams";
  }, []);

  // Track scroll position to update active section in Table of Contents
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 50;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />

      <main className="flex-1 w-full relative">
        {/* Animated Hero Header */}
        <div className="relative overflow-hidden bg-linear-to-b from-primary/5 via-transparent to-transparent border-b border-border/50 py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-semibold text-primary mb-4"
            >
              <Clock className="w-3.5 h-3.5" />
              Last Updated: June 9, 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
            >
              Terms of Service
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed"
            >
              Please read these terms carefully before using OtakuStreams. They govern your access and use of our website, features, indexing services, and account portals.
            </motion.p>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 sm:gap-12 items-start">
            
            {/* Sticky Table of Contents - Desktop */}
            <aside className="hidden lg:block sticky top-24 self-start bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-1.5">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 text-left border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{section.label.substring(3)}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main ToS Content */}
            <div className="space-y-10 sm:space-y-14 min-w-0">
              
              {/* Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    1. Acceptance of Terms
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    By accessing or using the OtakuStreams website and streaming index (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to all of these Terms, do not access, browse, or use the Service.
                  </p>
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Changes will be posted here and will become effective immediately upon publishing. It is your responsibility to review these Terms periodically for updates.
                  </p>
                </div>
              </section>

              {/* Eligibility & Accounts */}
              <section id="eligibility" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    2. Eligibility & Account Security
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    You must be at least 13 years of age to create an account on OtakuStreams. If you are under the age of 18, you may only use the Service under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
                  </p>
                  <p>
                    If you register an account, you are solely responsible for:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1.5 text-foreground/80">
                    <li>Maintaining the confidentiality of your username, password, and session tokens.</li>
                    <li>Restricting access to your account and devices.</li>
                    <li>All activities that occur under your credentials.</li>
                  </ul>
                  <p>
                    You agree to notify us immediately of any unauthorized use of your account or security breach. We will not be liable for losses caused by any unauthorized use of your account.
                  </p>
                </div>
              </section>

              {/* Scope of Service */}
              <section id="services" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    3. Scope of Service & External Metadata
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    OtakuStreams provides users with anime information discovery, schedule tracking, review capabilities, customized watchlists, and streaming indicators.
                  </p>
                  <p>
                    Our platform relies on free public API resources to fetch anime descriptions, cover art, character rosters, and broadcast schedule data. We do not guarantee the perpetual availability, accuracy, or timing of this metadata.
                  </p>
                </div>
              </section>

              {/* Critical Streaming Disclaimer */}
              <section id="disclaimer" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-destructive">
                    4. Third-Party Streams Disclaimer
                  </h2>
                </div>
                
                {/* Warning Callout Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-destructive/5 border-l-4 border-destructive text-sm leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold text-destructive">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>IMPORTANT EXCLUSION OF LIABILITY</span>
                  </div>
                  <p className="text-foreground/95">
                    <strong>OtakuStreams is not a media hosting service.</strong> We do not store, host, distribute, upload, or stream any of the video files, files, or digital media accessible through the player interface.
                  </p>
                </div>

                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    Our service operates as an indexer and search catalog linking or embedding third-party players that are hosted entirely on independent platforms. 
                  </p>
                  <p>
                    Because we have no control over these third-party websites, players, or networks, you acknowledge and agree that:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1.5">
                    <li>We do not endorse, inspect, or warrant the content, media streams, advertisements, cookies, scripts, or privacy policies of external sites.</li>
                    <li>Any interaction, redirect, pop-up, or media playback you engage with is done entirely at your own risk.</li>
                    <li>We shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such external content or servers.</li>
                  </ul>
                </div>
              </section>

              {/* Intellectual Property & DMCA */}
              <section id="copyright" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Copyright className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    5. Intellectual Property & DMCA Policy
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    The OtakuStreams application branding, custom layouts, logos, stylesheets, database models, codebase, and UI elements are the intellectual property of OtakuStreams and its maintainers, protected by copyright and other intellectual property laws.
                  </p>
                  <p>
                    We respect the intellectual property rights of others. Since all videos are stored on external sites, copyright owners who wish to remove their media should contact the third-party providers who host the content directly.
                  </p>
                  <p>
                    However, if you wish to report indexed links pointing to copyrighted content on our portal, you can submit a formal DMCA request. Your notice must contain the specific URLs on OtakuStreams that you wish to have removed, along with proof of authorization to act on behalf of the copyright holder.
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => scrollToSection("contact")}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-semibold"
                    >
                      How to submit a DMCA request <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* User Code of Conduct */}
              <section id="conduct" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    6. User Code of Conduct
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    When using OtakuStreams and interacting with community hubs (chat boxes, reviews, comments, and community profiles), you agree <strong>NOT</strong> to:
                  </p>
                  <ul className="list-decimal list-inside pl-2 space-y-2">
                    <li>
                      <span className="font-semibold text-foreground">Scrape or Disrupt:</span> Use automated scripts, scrapers, bots, or crawlers to mine data or overload the website servers or APIs.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Harass or Abuse:</span> Engage in cyberbullying, hate speech, threats, harassment, or publish obscene material.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Distribute Spam:</span> Post unauthorized advertisements, affiliate links, malware, or coordinate phishing campaigns.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Circumvent Protections:</span> Bypass any geo-blocking restrictions, rate limit controls, or user authentication mechanisms.
                    </li>
                  </ul>
                  <p>
                    Violation of these rules may result in immediate suspension, IP banning, or permanent deletion of your OtakuStreams account.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section id="liability" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    7. Limitation of Liability & Warranties
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. OTAKUSTREAMS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p>
                    IN NO EVENT SHALL OTAKUSTREAMS OR ITS CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1.5">
                    <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.</li>
                    <li>ANY ACTIONS, ADVERTISEMENTS, CONTENT, OR STREAMING INTERRUPTIONS BY THIRD PARTIES.</li>
                    <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</li>
                  </ul>
                </div>
              </section>

              {/* Contact & Support */}
              <section id="contact" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    8. Contact & Support
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    If you have any questions regarding these Terms of Service, legal disclaimers, or need to submit a DMCA copyright concern, please contact us directly:
                  </p>

                  <div className="grid grid-cols-1 gap-4 pt-2 max-w-md">
                    {/* Contact Email Box */}
                    <div className="p-4 rounded-xl border border-border/50 bg-card/30 flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Email Inquiries</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">For legal, DMCA, and partnership requests</p>
                        <a 
                          href="mailto:jawahar@otakustreams.com" 
                          className="text-xs sm:text-sm font-semibold text-primary hover:underline mt-2 block"
                        >
                          jawahar@otakustreams.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
