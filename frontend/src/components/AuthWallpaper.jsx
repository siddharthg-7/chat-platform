import { MessageCircle } from 'lucide-react';

/**
 * Static, theme-aware wallpaper for the auth screens' left panel.
 * Built as inline SVG (not an <img>) so the gradient and bubble
 * colors pull from the app's CSS variables and follow light/dark mode.
 */
const AuthWallpaper = () => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--bg-panel)]">
      <svg
        viewBox="0 0 800 1200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.55 }} />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="15%" r="60%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.18 }} />
            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        <rect width="800" height="1200" fill="url(#bgGrad)" />
        <rect width="800" height="1200" fill="url(#glow)" />

        {/* Floating chat bubbles — decorative, varying size/opacity */}
        <rect x="90" y="160" width="220" height="64" rx="20" fill="#ffffff" opacity="0.10" />
        <rect x="90" y="240" width="150" height="64" rx="20" fill="#ffffff" opacity="0.14" />
        <rect x="470" y="120" width="240" height="64" rx="20" fill="#ffffff" opacity="0.08" />

        <rect x="120" y="860" width="180" height="60" rx="18" fill="#ffffff" opacity="0.10" />
        <rect x="330" y="940" width="230" height="60" rx="18" fill="#ffffff" opacity="0.14" />
        <rect x="470" y="1020" width="170" height="60" rx="18" fill="#ffffff" opacity="0.09" />

        {/* Subtle connecting dots to suggest live conversation */}
        <circle cx="700" cy="700" r="3" fill="#ffffff" opacity="0.4" />
        <circle cx="670" cy="720" r="3" fill="#ffffff" opacity="0.3" />
        <circle cx="640" cy="700" r="3" fill="#ffffff" opacity="0.2" />
      </svg>

      {/* Bottom gradient so overlaid text/edges stay legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      {/* Wordmark + tagline, centered */}
      <div className="relative flex h-full w-full flex-col items-center justify-center px-10 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <MessageCircle className="h-8 w-8 text-white" fill="white" fillOpacity={0.15} />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-white">
          Chatsapp
        </h2>
        <p className="mt-3 max-w-xs text-sm text-white/80">
          Real-Time Chat Platform
        </p>
      </div>
    </div>
  );
};

export default AuthWallpaper;