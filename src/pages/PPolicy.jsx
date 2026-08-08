import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  FileText, 
  Info, 
  ExternalLink, 
  Users, 
  CheckCircle, 
  Mail, 
  Clock,
  Eye
} from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

const sections = [
  { id: "overview", label: "1. Overview", icon: ShieldCheck },
  { id: "collection", label: "2. Information We Collect", icon: FileText },
  { id: "usage", label: "3. How We Use Information", icon: Info },
  { id: "cookies", label: "4. Cookies & Tracking", icon: Eye },
  { id: "thirdparty", label: "5. Third-Party Policies", icon: ExternalLink },
  { id: "children", label: "6. Children's Privacy", icon: Users },
  { id: "consent", label: "7. Consent & Updates", icon: CheckCircle },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    document.title = "Privacy Policy — OtakuStreams";
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
              Last Updated: June 17, 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
            >
              Privacy Policy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed"
            >
              At OtakuStreams, accessible from otakustreams.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information we collect and how we use it.
            </motion.p>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 sm:gap-12 items-start">
            
            {/* Sticky Table of Contents - Desktop */}
            <aside className="hidden lg:block sticky top-24 self-start bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Policy Sections
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

            {/* Main Content */}
            <div className="space-y-10 sm:space-y-14 min-w-0">
              
              {/* Overview */}
              <section id="overview" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    1. Overview
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in OtakuStreams. This policy is not applicable to any information collected offline or via channels other than this website.
                  </p>
                  <p>
                    If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="collection" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    2. Information We Collect
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
                  </p>
                  <p>
                    If you register for an Account, we may ask for your contact information, including items such as name, email address, avatar preferences, and preferred language. We do not store or process passwords in plaintext, nor do we request payment details as OtakuStreams is 100% free.
                  </p>
                </div>
              </section>

              {/* How We Use Information */}
              <section id="usage" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    3. How We Use Information
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    We use the information we collect in various ways, including to:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1.5 text-foreground/80">
                    <li>Provide, operate, and maintain our website and streams.</li>
                    <li>Improve, personalize, and expand our platform catalog.</li>
                    <li>Understand and analyze how you interact with our website and categories.</li>
                    <li>Develop new products, services, features, and functionality.</li>
                    <li>Communicate with you for account updates or customer support.</li>
                    <li>Find and prevent fraud.</li>
                  </ul>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    4. Cookies & Web Beacons
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    Like any other website, OtakuStreams uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                  </p>
                  <p>
                    You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
                  </p>
                </div>
              </section>

              {/* Third-Party Policies */}
              <section id="thirdparty" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    5. Third-Party Privacy Policies
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    OtakuStreams's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers or video storage providers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                  </p>
                  <p>
                    Note that OtakuStreams has no access to or control over cookies used by third-party advertisers or external hosting platforms that stream video files.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section id="children" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    6. Children's Information
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
                  </p>
                  <p>
                    OtakuStreams does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
                  </p>
                </div>
              </section>

              {/* Consent & Updates */}
              <section id="consent" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    7. Consent & Updates
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                  </p>
                  <p>
                    We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
                  </p>
                  
                  <div className="max-w-md p-4 rounded-xl border border-border/50 bg-card/30 flex items-start gap-3 mt-3">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Privacy Support Agent</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Please send privacy-related questions here</p>
                      <a 
                        href="mailto:jawahar@otakustreams.com" 
                        className="text-xs sm:text-sm font-semibold text-primary hover:underline mt-2 block"
                      >
                        jawahar@otakustreams.com
                      </a>
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

export default PrivacyPolicy;
