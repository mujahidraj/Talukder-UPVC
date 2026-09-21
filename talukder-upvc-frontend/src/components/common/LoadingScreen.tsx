import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        {/* Elegant pulsing logo */}
        <div className="w-48 md:w-64 mb-10 animate-pulse">
          <img 
            src="/LOGO/Talukder-uPVC-Fittings-LTD-3.png" 
            alt="Talukder uPVC" 
            className="w-full h-auto object-contain"
          />
        </div>
        
        {/* Minimalist loading dots */}
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-accent-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3.5 h-3.5 rounded-full bg-brand-800 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3.5 h-3.5 rounded-full bg-accent-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
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
      <div className={`rounded-full border-gray-200 border-t-accent-600 animate-spin ${sizeClasses[size]}`}></div>
    </div>
  );
};
