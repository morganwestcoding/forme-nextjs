'use client';

const DOT_COLORS = ['#1c1917', '#33302e', '#57534e', '#78716c', '#a8a29e', '#d6d3d1', '#FFFFFF'];

interface SplashLoaderProps {
  fadingOut?: boolean;
}

export default function SplashLoader({ fadingOut = false }: SplashLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-50 min-h-screen bg-[#09090B] flex items-center justify-center ${
        fadingOut ? 'splash-fade-out' : ''
      }`}
    >
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/fm-logo-white.png"
          alt="ForMe"
          className="splash-logo h-20 w-auto mx-auto mb-12"
        />
        <div className="splash-dots flex justify-center items-center">
          {DOT_COLORS.map((color, i) => (
            <span
              key={color}
              className="splash-dot"
              style={{ backgroundColor: color, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
