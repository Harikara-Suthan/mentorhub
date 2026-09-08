import React from "react";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  showTagline?: boolean;
  theme?: "dark" | "light" | "auto";
  className?: string;
  animate?: boolean;
  variant?: "horizontal" | "square-badge" | "icon-only";
}

/**
 * MentorHubEmblemSvg - Pixel-perfect vector reproduction of the MentorHUB M-emblem:
 * - Stylized bold purple gradient "M" with smooth rounded apexes and bottom terminals
 * - Central mentor/student figure (circular head + curved collar nestled in V notch)
 * - Three horizontal dialogue/chat indicator dots on the right arm
 */
export function MentorHubEmblemSvg({
  className = "w-full h-full",
}: {
  className?: string;
}) {
  // Generate unique gradient IDs to prevent SVG ID collisions across instances
  const rawId = React.useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const mainGradId = `mHubMainGrad_${id}`;
  const figGradId = `mHubFigGrad_${id}`;
  const gleamId = `mHubGleam_${id}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} block shrink-0 overflow-visible`}
      width="100%"
      height="100%"
    >
      <defs>
        {/* Vibrant Gradient for M shape - updated to light blue + blue */}
        <linearGradient id={mainGradId} x1="18" y1="20" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="35%" stopColor="#60A5FA" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Head and Bust Figure Gradient - updated to blue */}
        <linearGradient id={figGradId} x1="50" y1="16" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="45%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Top Edge Specular Lighting */}
        <linearGradient id={gleamId} x1="20" y1="22" x2="80" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Stylized "M" with Rounded Caps and V-Notch */}
      <path
        d="M 22 30 
           C 22 25, 25.5 22, 29.5 24 
           L 50 49 
           L 70.5 24 
           C 74.5 22, 78 25, 78 30 
           L 78 74 
           C 78 77.5, 74.5 80, 70.5 80 
           C 66.5 80, 63.5 77.5, 63.5 74 
           L 63.5 44 
           L 50 59.5 
           L 36.5 44 
           L 36.5 74 
           C 36.5 77.5, 33.5 80, 29.5 80 
           C 25.5 80, 22 77.5, 22 74 
           Z"
        fill={`url(#${mainGradId})`}
        style={{ fill: `url(#${mainGradId})` }}
      />

      {/* Subtle Specular Top Reflection Accent */}
      <path
        d="M 23 29 C 23 25.5, 26 23.5, 29.5 25 L 50 49 L 70.5 25 C 74 23.5, 77 25.5, 77 29"
        stroke={`url(#${gleamId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Avatar Head (Centered in top notch) */}
      <circle
        cx="50"
        cy="26"
        r="11.5"
        fill={`url(#${figGradId})`}
        style={{ fill: `url(#${figGradId})` }}
      />
      {/* Subtle Head Ring Highlight */}
      <circle
        cx="50"
        cy="26"
        r="11.5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* Avatar Torso / Collar (Resting comfortably in V-valley) */}
      <path
        d="M 37.5 37.5 
           C 41 33.5, 59 33.5, 62.5 37.5 
           L 50 50 
           Z"
        fill={`url(#${figGradId})`}
        style={{ fill: `url(#${figGradId})` }}
        opacity="0.95"
      />

      {/* Three Horizontal Dialogue Dots on Right Arm */}
      <circle cx="67" cy="34" r="2.2" fill="#0B0817" />
      <circle cx="71.5" cy="34" r="2.2" fill="#0B0817" />
      <circle cx="76" cy="34" r="2.2" fill="#0B0817" />
    </svg>
  );
}

/**
 * MentorHubSquareBox - Minimalist, sleek square box container for the emblem
 * Designed with luxury dark gradient, refined border, and balanced inner padding.
 */
export function MentorHubSquareBox({
  size = "md",
  className = "",
  animate = false,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animate?: boolean;
}) {
  const boxSizes = {
    xs: "w-8 h-8 rounded-lg p-1",
    sm: "w-9 h-9 rounded-xl p-1.5",
    md: "w-10 h-10 rounded-xl p-2",
    lg: "w-14 h-14 rounded-2xl p-2.5",
    xl: "w-20 h-20 rounded-2xl p-3.5",
    hero: "w-28 h-28 md:w-32 md:h-32 rounded-3xl p-5",
  };

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {animate && (
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 opacity-50 blur-md animate-pulse pointer-events-none" />
      )}
      <div
        className={`relative aspect-square flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-slate-50 border border-blue-300 shadow-xs ${boxSizes[size]}`}
      >
        {/* Subtle Inner Glow Rim */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-blue-400/10 to-transparent pointer-events-none" />
        <MentorHubEmblemSvg className="w-full h-full" />
      </div>
    </div>
  );
}

/**
 * MentorHubLogo - Primary Brand Logo Component
 * Combines the sleek square box icon with crisp brand typography.
 */
export function MentorHubLogo({
  size = "md",
  showText = true,
  showTagline = true,
  theme = "light",
  className = "",
  animate = false,
  variant = "horizontal",
}: LogoProps) {
  const sizeMap = {
    xs: { text: "text-sm", hub: "text-sm", tag: "text-[6.5px] tracking-[0.14em]", gap: "gap-2" },
    sm: { text: "text-base", hub: "text-base", tag: "text-[7.5px] tracking-[0.16em]", gap: "gap-2.5" },
    md: { text: "text-lg", hub: "text-lg", tag: "text-[8px] tracking-[0.16em]", gap: "gap-2.5" },
    lg: { text: "text-2xl", hub: "text-2xl", tag: "text-[10px] tracking-[0.18em]", gap: "gap-3" },
    xl: { text: "text-3xl", hub: "text-3xl", tag: "text-xs tracking-[0.2em]", gap: "gap-3.5" },
    hero: { text: "text-4xl md:text-5xl", hub: "text-4xl md:text-5xl", tag: "text-xs md:text-sm tracking-[0.2em]", gap: "gap-4 md:gap-5" },
  };

  const s = sizeMap[size];
  const isDark = theme === "dark";

  if (variant === "icon-only") {
    return <MentorHubSquareBox size={size} animate={animate} className={className} />;
  }

  if (variant === "square-badge") {
    return (
      <MentorHubSquareCard
        size={size === "hero" ? "lg" : size === "xl" ? "md" : "sm"}
        animate={animate}
        className={className}
      />
    );
  }

  return (
    <div className={`inline-flex items-center ${s.gap} select-none ${className}`}>
      {/* Sleek Square Box Icon */}
      <MentorHubSquareBox size={size} animate={animate} />

      {showText && (
        <div className="flex flex-col justify-center shrink-0">
          {/* Main Wordmark: "MentorHUB" */}
          <div className="flex items-center leading-none tracking-tight shrink-0 whitespace-nowrap">
            <span
              className={`font-display font-black ${s.text} ${
                isDark ? "text-white" : "text-[#0B0817]"
              }`}
            >
              Mentor
            </span>
            <span
              className={`font-display font-black ${s.hub} text-transparent bg-clip-text ${
                isDark
                  ? "bg-gradient-to-r from-[#93C5FD] via-[#60A5FA] to-white"
                  : "bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#1D4ED8]"
              }`}
            >
              HUB
            </span>
          </div>

          {/* Official Subtitle: "GUIDE • CONNECT • GROW" */}
          {showTagline && (
            <p
              className={`font-mono font-medium uppercase whitespace-nowrap leading-none mt-1 ${s.tag} ${
                isDark ? "text-blue-300/80" : "text-[#0B0817]/75"
              }`}
            >
              GUIDE <span className="text-blue-500 font-bold">•</span> CONNECT <span className="text-blue-500 font-bold">•</span> GROW
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * MentorHubSquareCard - Full Square Box Brand Identity Card
 * Exact match to the user's uploaded official brand identity board:
 * Deep black square container, centered emblem, MentorHUB wordmark, and tagline.
 */
export function MentorHubSquareCard({
  size = "md",
  className = "",
  animate = true,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}) {
  const cardConfig = {
    sm: {
      box: "w-48 h-48 rounded-2xl p-4",
      iconSize: "md" as const,
      title: "text-xl",
      tagline: "text-[8px] tracking-[0.2em] mt-1.5",
    },
    md: {
      box: "w-64 h-64 rounded-3xl p-6",
      iconSize: "lg" as const,
      title: "text-2xl sm:text-3xl",
      tagline: "text-[9px] tracking-[0.22em] mt-2",
    },
    lg: {
      box: "w-72 h-72 sm:w-80 sm:h-80 rounded-3xl p-8",
      iconSize: "hero" as const,
      title: "text-3xl sm:text-4xl",
      tagline: "text-[10px] sm:text-xs tracking-[0.24em] mt-2.5",
    },
  };

  const cfg = cardConfig[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {animate && (
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 opacity-40 blur-xl animate-pulse pointer-events-none" />
      )}
      <div
        className={`relative aspect-square flex flex-col items-center justify-center text-center bg-[#071330] border border-blue-500/30 shadow-2xl shadow-blue-950/60 ${cfg.box}`}
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute inset-0 rounded-[inherit] bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />

        {/* Center M Emblem */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3">
          <MentorHubEmblemSvg className="w-full h-full drop-shadow-lg" />
        </div>

        {/* Wordmark */}
        <div className="flex items-baseline justify-center leading-none tracking-tight">
          <span className={`font-display font-black ${cfg.title} text-white`}>
            Mentor
          </span>
          <span className={`font-display font-black ${cfg.title} text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-blue-200`}>
            HUB
          </span>
        </div>

        {/* Tagline */}
        <p className={`font-mono font-bold uppercase text-blue-200/80 ${cfg.tagline}`}>
          GUIDE <span className="text-blue-400 font-black">.</span> CONNECT <span className="text-blue-400 font-black">.</span> GROW <span className="text-blue-400 font-black">.</span>
        </p>
      </div>
    </div>
  );
}

/**
 * MentorHubFullBrandBadge - For Splash Screen and Hero sections
 */
export function MentorHubFullBrandBadge({
  className = "",
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <MentorHubSquareCard size="md" animate={animate} className={className} />
  );
}
