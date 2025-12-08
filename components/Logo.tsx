import React from 'react';

type LogoProps = {
  className?: string;
};

const Logo = ({ className = 'w-10 h-10' }: LogoProps) => {
  return (
    <div
      className={`${className} flex items-center justify-center rounded-lg bg-gradient-to-br from-[#caa35d] to-[#b66b2e] border border-white/20 shadow-[0_10px_22px_rgba(0,0,0,0.35)] font-bold text-[#0f1c16] tracking-[0.18em] uppercase`}
      aria-label="Military Helper logo"
    >
      <span className="text-sm">MH</span>
    </div>
  );
};

export default Logo;
