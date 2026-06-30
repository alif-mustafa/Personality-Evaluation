export const IconPersonality = ({ color = "currentColor", size = 36, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="11" r="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 16l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconLoveLanguages = ({ color = "currentColor", size = 36, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18 30S6 22 6 14a7 7 0 0 1 12-4.9A7 7 0 0 1 30 14c0 8-12 16-12 16z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14h12M18 8v12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconAttachment = ({ color = "currentColor", size = 36, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Anchor — represents Bowlby's secure base theory */}
    <circle cx="18" cy="9" r="3" stroke={color} strokeWidth="2"/>
    <path d="M18 12v18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16h16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16c0 6 4 10 8 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 16c0 6-4 10-8 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconGottman = ({ color = "currentColor", size = 36, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Two dialogue bubbles — represents couple communication */}
    <rect x="4" y="6" width="18" height="13" rx="4" stroke={color} strokeWidth="2"/>
    <path d="M7 19l-3 4 5-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="17" width="18" height="13" rx="4" stroke={color} strokeWidth="2"/>
    <path d="M29 30l3 4-5-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ASSESSMENT_ICONS = {
  bigfive: IconPersonality,
  lovelanguages: IconLoveLanguages,
  attachment: IconAttachment,
  gottman: IconGottman,
};
