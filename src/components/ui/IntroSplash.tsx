import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { MentorHubLogo } from "./MentorHubLogo";
import { safeSessionGetItem, safeSessionSetItem } from "../../utils/storage";

interface IntroSplashProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export function IntroSplash({ onComplete, forceShow = false }: IntroSplashProps) {
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Check if previously seen in this session
    if (!forceShow && safeSessionGetItem("mentorhub_intro_seen") === "true") {
      onCompleteRef.current();
      return;
    }

    // Short, non-blocking splash (500ms display + 250ms fade)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      safeSessionSetItem("mentorhub_intro_seen", "true");
      
      const finishTimer = setTimeout(() => {
        onCompleteRef.current();
      }, 250);

      return () => clearTimeout(finishTimer);
    }, 500);

    // Hard fallback watchdog: Guarantee splash is closed in 900ms under all conditions
    const safetyWatchdog = setTimeout(() => {
      safeSessionSetItem("mentorhub_intro_seen", "true");
      onCompleteRef.current();
    }, 900);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(safetyWatchdog);
    };
  }, [forceShow]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        scale: isExiting ? 1.02 : 1,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 overflow-hidden select-none pointer-events-none"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="flex flex-col items-center justify-center text-center p-6">
        <MentorHubLogo size="xl" theme="dark" animate />
      </div>
    </motion.div>
  );
}
