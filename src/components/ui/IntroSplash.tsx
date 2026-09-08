import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MentorHubLogo } from "./MentorHubLogo";

interface IntroSplashProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export function IntroSplash({ onComplete, forceShow = false }: IntroSplashProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if previously seen in this session to prevent interrupting repeated page navigation
    if (!forceShow && sessionStorage.getItem("mentorhub_intro_seen") === "true") {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsExiting(true);
      sessionStorage.setItem("mentorhub_intro_seen", "true");
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 450);
      return () => clearTimeout(finishTimer);
    }, 900);

    return () => clearTimeout(timer);
  }, [onComplete, forceShow]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        scale: isExiting ? 1.05 : 1,
        filter: isExiting ? "blur(8px)" : "blur(0px)",
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden select-none"
    >
      {/* Centered blue logo with simple elegant scale-in animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center text-center p-6"
      >
        <MentorHubLogo size="xl" theme="light" animate />
      </motion.div>
    </motion.div>
  );
}
