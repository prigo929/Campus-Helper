import React, { useId } from 'react';

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  const id = useId().replace(/:/g, '-');
  const clipId = `circleClip-${id}`;
  const shineGradId = `shineGradient-${id}`;
  const goldGradId = `goldGradient-${id}`;
  const goldDarkId = `goldDark-${id}`;
  const bgGradId = `bgGradient-${id}`;
  const shadowId = `dropShadow-${id}`;
  const bevelId = `bevel-${id}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={`${className} logo-glow`}>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(212,175,55,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(255,215,0,0.8)); }
        }
        @keyframes shine {
          0% { transform: translateX(-600px) rotate(-25deg); }
          100% { transform: translateX(600px) rotate(-25deg); }
        }
        .logo-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .logo-shine {
          animation: shine 4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
      <defs>
        <clipPath id={clipId}>
          <circle cx="256" cy="256" r="240" />
        </clipPath>

        <linearGradient id={shineGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Complex Gold Gradient for Metallic Effect */}
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBF5B7" />
          <stop offset="20%" stopColor="#BF953F" />
          <stop offset="40%" stopColor="#FCF6BA" />
          <stop offset="60%" stopColor="#B38728" />
          <stop offset="80%" stopColor="#FBF5B7" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
        
        {/* Darker Gold for Edges/Depth */}
        <linearGradient id={goldDarkId} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8a6e2f" />
          <stop offset="100%" stopColor="#463610" />
        </linearGradient>

        {/* Background Gradient (Deep Navy/Academic Blue) */}
        <radialGradient id={bgGradId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#1a2a40" />
          <stop offset="100%" stopColor="#0d1620" />
        </radialGradient>

        {/* Drop Shadow Filter */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
          <feOffset in="blur" dx="2" dy="4" result="offsetBlur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="offsetBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Inner Bevel Filter */}
        <filter id={bevelId}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" lightingColor="#fffee0" result="specOut">
            <fePointLight x="-5000" y="-10000" z="20000"/>
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
        </filter>
      </defs>

      {/* Main Background Container */}
      <circle cx="256" cy="256" r="240" fill={`url(#${bgGradId})`} stroke={`url(#${goldGradId})`} strokeWidth="8" />
      
      {/* Inner Ring */}
      <circle cx="256" cy="256" r="220" fill="none" stroke={`url(#${goldDarkId})`} strokeWidth="2" opacity="0.5" />

      {/* Logo Group */}
      <g filter={`url(#${shadowId})`}>
        
        {/* Graduation Cap (Mortarboard) Element */}
        <g transform="translate(0, -20)">
          <path d="M256 100 L360 145 L256 190 L152 145 Z" fill={`url(#${goldGradId})`} filter={`url(#${bevelId})`}/>
          <path d="M360 145 L360 165 L256 210 L152 165 L152 145 L256 190 Z" fill={`url(#${goldDarkId})`} opacity="0.8"/>
          {/* Tassel */}
          <circle cx="256" cy="145" r="5" fill="#BF953F"/>
          <path d="M256 145 Q290 160 300 200" fill="none" stroke={`url(#${goldGradId})`} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="300" cy="200" r="6" fill={`url(#${goldGradId})`}/>
        </g>

        {/* Typography Group */}
        <g transform="translate(0, 30)" filter={`url(#${bevelId})`}>
          
          {/* Letter C */}
          <path d="M200 180 
                   L200 210 
                   Q160 210 160 250 
                   Q160 290 200 290 
                   L200 320 
                   Q110 320 110 250 
                   Q110 180 200 180 Z" 
                fill={`url(#${goldGradId})`} />
          
          {/* Serif blocks for C */}
          <rect x="190" y="180" width="40" height="30" fill={`url(#${goldGradId})`} />
          <rect x="190" y="290" width="40" height="30" fill={`url(#${goldGradId})`} />

          {/* Letter H */}
          <path d="M240 180 L280 180 L280 235 L340 235 L340 180 L380 180 L380 320 L340 320 L340 265 L280 265 L280 320 L240 320 Z" 
                fill={`url(#${goldGradId})`} />
                
          {/* Decorative Underline (Open Book Spine hint) */}
          <path d="M130 350 Q256 380 382 350 L382 360 Q256 390 130 360 Z" fill={`url(#${goldGradId})`} opacity="0.9"/>
        </g>
      </g>
      
      {/* Shine/Reflection Overlay */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="200" y="-100" width="112" height="712" fill={`url(#${shineGradId})`} className="logo-shine" />
      </g>
    </svg>
  );
};

export default Logo;