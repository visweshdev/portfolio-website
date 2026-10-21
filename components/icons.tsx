// Small original line-icons used as floating hero/collage objects.
// Kept intentionally minimal — technical marks, not illustrations.

export function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="9" width="46" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 9L19 3H29L33 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3.2" fill="currentColor" />
      <circle cx="40" cy="14" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function F1SilhouetteIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 18h6l3-5h9l2-4h13l3 5h6l4 2v2H2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="19.5" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="46" cy="19.5" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 9L26 4H34" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function CodeBracketsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 28" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L4 14L16 25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 3L40 14L28 25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TerminalCursorIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="38" height="22" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 8L13 12L7 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function NodeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="32" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="30" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 9L18 27" stroke="currentColor" strokeWidth="1.2" />
      <path d="M29 11.5L22 28" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 8.5L29 10" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function FocusReticleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12V2H12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M28 2H38V12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M38 28V38H28" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 38H2V28" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function TrackLineIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10C20 10 22 2 40 2C58 2 60 18 78 18" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 4" />
    </svg>
  );
}

export function DotIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="5" r="5" fill="currentColor" />
    </svg>
  );
}
