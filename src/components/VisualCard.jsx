import React from 'react';

/**
 * VisualCard: 3D glass card with mouse-tilt, layered shadow, neon hover border,
 * background illustration on lower layer, dark gradient overlay in middle,
 * and high-contrast text (>4.5:1) with text shadow on top.
 */
export default function VisualCard({
  children,
  className = '',
  accent = 'cyan', // 'cyan' | 'emerald' | 'amber' | 'red' | 'purple'
  bgElement = null,
  onClick,
  style = {},
  ...props
}) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-2px)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = '';
  };

  const borderMap = {
    cyan: 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    amber: 'border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    red: 'border-red-500/30 hover:border-red-400 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]',
    purple: 'border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    slate: 'border-slate-800 hover:border-slate-700 hover:shadow-[0_0_20px_rgba(30,41,59,0.5)]'
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out, border-color 0.25s ease, box-shadow 0.25s ease',
        ...style
      }}
      className={`relative overflow-hidden rounded-2xl border bg-slate-950/70 backdrop-blur-xl shadow-xl ${borderMap[accent] || borderMap.cyan} ${className}`}
      {...props}
    >
      {/* 1. Lower Layer: Background SVG element or subtle space grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        {bgElement || (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="card-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/30" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#card-grid)" />
          </svg>
        )}
      </div>

      {/* 2. Middle Layer: Dark gradient overlay ensuring >4.5:1 text contrast */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-900/60" />

      {/* 3. Top Layer: Content with text-shadow and high-contrast typography */}
      <div className="relative z-10 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
        {children}
      </div>
    </div>
  );
}
