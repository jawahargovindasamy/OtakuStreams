import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Bug,
  Briefcase,
  ExternalLink
} from "lucide-react";
import { FaDiscord, FaRedditAlien, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { toast } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import { useAuth } from "@/context/auth-provider";

const contactReasons = [
  { value: "general", label: "General Inquiry", icon: MessageSquare },
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "business", label: "Business Proposal", icon: Briefcase },
  { value: "dmca", label: "DMCA / Copyright Notice", icon: AlertCircle },
  { value: "other", label: "Other Support", icon: HelpCircle },
];

const Contact = () => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const socialLinks = [
    { icon: FaDiscord, href: "#", label: "Discord", color: "bg-[#5865F2] hover:bg-[#4752C4]" },
    { icon: FaTelegramPlane, href: "#", label: "Telegram", color: "bg-[#0088cc] hover:bg-[#0077b3]" },
    { icon: FaRedditAlien, href: "#", label: "Reddit", color: "bg-[#FF4500] hover:bg-[#e03d00]" },
    { icon: FaTwitter, href: "#", label: "Twitter", color: "bg-[#1DA1F2] hover:bg-[#1a91da]" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "email" ? value.trim() : value }));
  };

  const handleReasonSelect = (value) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please write a message");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/contact", formData);
      if (response.data?.success || response.status === 201 || response.status === 200) {
        setIsSuccess(true);
        toast.success("Your message has been sent successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "general",
          message: "",
        });
      } else {
        toast.error(response.data?.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to send your message. Please verify your backend server is active."
      );
    } finally {
      setIsSubmitting(false);
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
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
            >
              Contact Support & Community
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed"
            >
              Have a question, feedback, or a partnership inquiry? Fill out the form or reach out through our official community servers.
            </motion.p>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 sm:gap-12 items-start">
            
            {/* Left Column: Direct Info & Socials */}
            <div className="space-y-6 sm:space-y-8">
              
              {/* Direct Info Card */}
              <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight border-b border-border/50 pb-2">
                  Direct Correspondence
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  For official, legal, partnership, or sponsorship inquiries, send a direct email. We aim to respond within 24–48 business hours.
                </p>

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

              {/* Social Channels Card */}
              <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight border-b border-border/50 pb-2">
                  Community Forums
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Join our communities to chat with fellow anime enthusiasts, discuss recent uploads, or request support directly from community moderators.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/20 hover:bg-card hover:border-primary/30 transition-all group duration-200"
                      >
                        <div className={`p-2 rounded-lg ${social.color} text-white transition-transform group-hover:scale-105`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {social.label}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5">
                            Join Server <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight border-b border-border/50 pb-3 mb-6">
                Send a Message
              </h2>

              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Message Sent!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. We have received your message and will get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  
                  {/* Name & Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-card/25 focus:border-primary focus:outline-hidden transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-card/25 focus:border-primary focus:outline-hidden transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Subject Category Select (Custom Layout) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Inquiry Category
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {contactReasons.map((reason) => {
                        const Icon = reason.icon;
                        const isSelected = formData.subject === reason.value;
                        return (
                          <button
                            key={reason.value}
                            type="button"
                            onClick={() => handleReasonSelect(reason.value)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-xl transition-all duration-200 ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {reason.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your message details here..."
                      className="w-full p-4 rounded-xl border border-border bg-card/25 focus:border-primary focus:outline-hidden transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all font-bold shadow-lg shadow-primary/25 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
