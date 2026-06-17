import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AppLogo from "../assets/App Logo (2).png";

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    // Disable scrolling while splash screen is active
    document.body.style.overflow = "hidden";
    
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Display for exactly 3 seconds

    return () => {
      // Re-enable scrolling when splash screen is unmounted
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glow effect in the background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.4, 0.5, 0] }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute w-72 h-72 rounded-full bg-primary/25 blur-3xl pointer-events-none"
        />

        {/* Animated App Logo */}
        <motion.img
          src={AppLogo}
          alt="App Logo"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0, 1, 1],
            scale: [0.9, 1.05, 1.05],
          }}
          transition={{
            duration: 3,
            times: [0, 0.3, 1],
            ease: "easeOut",
          }}
          className="w-auto h-44 md:h-60 object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10"
        />
        
        {/* Cinematic progress bar/glow line underneath (Netflix vibe) */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 1],
            opacity: [0, 0.8, 0.8]
          }}
          transition={{
            duration: 2.8,
            times: [0, 0.4, 1],
            ease: "easeOut",
          }}
          className="w-36 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-6 rounded-full blur-[0.5px]"
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
