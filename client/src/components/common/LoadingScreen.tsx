import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 -m-4 rounded-full border-[3px] border-transparent border-t-brand-600 border-r-brand-600/30 border-b-brand-600 border-l-brand-600/30 animate-[spin_2s_linear_infinite]"></div>
        
        {/* Inner rotating ring */}
        <div className="absolute inset-0 -m-2 rounded-full border-[3px] border-transparent border-t-brand-400 border-b-brand-400 opacity-60 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        
        {/* Center core pulse */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
          <div className="w-8 h-8 bg-brand-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Brand Text */}
      <div className="mt-12 text-center">
        <h2 className="text-xl font-heading font-bold text-slate-900 tracking-wider">
          TALUKDER <span className="text-brand-600">UPVC</span>
        </h2>
        <p className="text-sm text-slate-500 mt-2 animate-pulse tracking-widest uppercase">
          Loading Environment...
        </p>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className={`rounded-full border-transparent border-t-brand-600 border-r-brand-600/30 border-b-brand-600 border-l-brand-600/30 animate-[spin_1s_linear_infinite] ${sizeClasses[size]}`}></div>
    </div>
  );
};
