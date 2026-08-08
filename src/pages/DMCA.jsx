import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  FileText, 
  HelpCircle, 
  Mail, 
  CheckCircle, 
  Info,
  Clock,
  ExternalLink
} from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

const sections = [
  { id: "overview", label: "1. Overview", icon: ShieldAlert },
  { id: "hosting", label: "2. Hosting Disclaimer", icon: Info },
  { id: "requirements", label: "3. Takedown Requirements", icon: FileText },
  { id: "submission", label: "4. Submission Details", icon: Mail },
  { id: "counternotice", label: "5. Counter-Notification", icon: HelpCircle },
  { id: "repeat-infringer", label: "6. Repeat Infringers", icon: CheckCircle },
];

const DMCA = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    document.title = "DMCA Policy — OtakuStreams";
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
        <div className="relative overflow-hidden bg-linear-to-b from-destructive/5 via-transparent to-transparent border-b border-border/50 py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs sm:text-sm font-semibold text-destructive mb-4"
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
              DMCA Copyright Policy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed"
            >
              OtakuStreams respects intellectual property rights. This policy outlines how copyright owners can request removal of indexed search links from our catalog.
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
                          ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
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
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    1. Overview
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    OtakuStreams respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), the text of which may be found on the U.S. Copyright Office website, we will respond expeditiously to claims of copyright infringement that are reported to our designated agent.
                  </p>
                  <p>
                    If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Service by completing a DMCA Notice of Alleged Infringement and delivering it to our designated agent.
                  </p>
                </div>
              </section>

              {/* Hosting Disclaimer */}
              <section id="hosting" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    2. External Hosting Disclaimer
                  </h2>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border-l-4 border-primary text-sm leading-relaxed space-y-2 text-foreground/95">
                  <p>
                    <strong>OtakuStreams is an indexing and directory service.</strong> We do not store, host, distribute, upload, or stream any of the video files or digital media referenced in our catalog. The content is embedded or linked from external, third-party video storage servers hosted by independent providers.
                  </p>
                </div>

                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    Consequently, removing indexed links from OtakuStreams will not delete or suspend the media files from the web. To remove the files permanently, copyright owners must contact the specific third-party media host directly. 
                  </p>
                  <p>
                    Once a link is reported to us using the procedure below, we will immediately disable or remove the indexing parameters from our catalog to prevent search results from pointing to that link.
                  </p>
                </div>
              </section>

              {/* Takedown Requirements */}
              <section id="requirements" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    3. DMCA Notice Requirements
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    To file a valid copyright infringement notice with OtakuStreams, you must provide a written communication (via email) that includes the following details (as required by 17 U.S.C. § 512(c)(3)):
                  </p>
                  
                  <div className="space-y-3 pl-2 border-l border-border/60">
                    <p>
                      <strong className="text-foreground">I. Signature:</strong> A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.
                    </p>
                    <p>
                      <strong className="text-foreground">II. Infringed Work:</strong> Identification of the copyrighted work claimed to have been infringed (e.g., specific anime name, production details).
                    </p>
                    <p>
                      <strong className="text-foreground">III. Infringing URLs:</strong> Identification of the material that is claimed to be infringing and that is to be removed, including the <strong>specific URLs on OtakuStreams</strong> containing the indexed links. (General site search queries or home page links are not sufficient).
                    </p>
                    <p>
                      <strong className="text-foreground">IV. Contact Details:</strong> Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and email address.
                    </p>
                    <p>
                      <strong className="text-foreground">V. Good Faith Statement:</strong> A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                    </p>
                    <p>
                      <strong className="text-foreground">VI. Accuracy Statement:</strong> A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                    </p>
                  </div>
                </div>
              </section>

              {/* Submission Details */}
              <section id="submission" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    4. Submission Details & Turnaround
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    Please send all compiled DMCA takedown requests to our designated email address:
                  </p>
                  
                  <div className="max-w-md p-4 rounded-xl border border-border/50 bg-card/30 flex items-start gap-3 mt-3">
                    <Mail className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Designated Copyright Agent</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Please send legal notifications here</p>
                      <a 
                        href="mailto:jawahar@otakustreams.com" 
                        className="text-xs sm:text-sm font-semibold text-primary hover:underline mt-2 block"
                      >
                        jawahar@otakustreams.com
                      </a>
                    </div>
                  </div>

                  <p className="pt-2">
                    We aim to process and remove verified, compliant indexing links within <strong>24 to 72 hours</strong>. Please note that sending incomplete requests or failing to specify precise page links may delay the review and resolution process.
                  </p>
                </div>
              </section>

              {/* Counter Notification */}
              <section id="counternotice" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    5. Counter-Notification Procedure
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    If you believe that a link indexing your content was removed or disabled by mistake or misidentification, you may submit a Counter-Notification to our designated agent.
                  </p>
                  <p>
                    Your counter-notice must be written and include:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1.5 text-foreground/80">
                    <li>Your physical or electronic signature.</li>
                    <li>Identification of the material that has been removed and the location it appeared before removal.</li>
                    <li>A statement under penalty of perjury that you have a good faith belief that the material was removed as a result of mistake or misidentification.</li>
                    <li>Your name, address, telephone number, and email.</li>
                  </ul>
                </div>
              </section>

              {/* Repeat Infringers */}
              <section id="repeat-infringer" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    6. Repeat Infringer Policy
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    OtakuStreams reserves the right to terminate accounts of users who repeatedly publish unauthorized media links in comments, reviews, or profile descriptions.
                  </p>
                  <p>
                    If an account is flagged with multiple violations, we will disable and permanently terminate access to the user profile without warning or refund of account personalization parameters.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DMCA;
