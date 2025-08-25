"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'title' | 'card' | 'video' | 'image' | 'button';
  lines?: number;
  width?: string;
}

export function SkeletonLoader({ 
  className = "", 
  variant = 'text', 
  lines = 1,
  width = "100%" 
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse";
  
  const variants = {
    text: `h-4 ${baseClasses}`,
    title: `h-6 ${baseClasses}`,
    card: `h-48 ${baseClasses}`,
    video: `aspect-video ${baseClasses}`,
    image: `aspect-square ${baseClasses}`,
    button: `h-10 ${baseClasses}`
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={variants[variant]}
            style={{ 
              width: index === lines - 1 ? '60%' : width 
            }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${variants[variant]} ${className}`}
      style={{ width }}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showContent?: boolean;
  contentLines?: number;
}

export function SkeletonCard({ 
  className = "",
  showImage = true,
  showTitle = true,
  showContent = true,
  contentLines = 3
}: SkeletonCardProps) {
  return (
    <div className={`p-6 border rounded-lg space-y-4 ${className}`}>
      {showImage && (
        <SkeletonLoader variant="image" className="w-full" />
      )}
      {showTitle && (
        <SkeletonLoader variant="title" width="70%" />
      )}
      {showContent && (
        <SkeletonLoader variant="text" lines={contentLines} />
      )}
    </div>
  );
}

interface SkeletonMilestoneProps {
  className?: string;
}

export function SkeletonMilestone({ className = "" }: SkeletonMilestoneProps) {
  return (
    <div className={`border rounded-lg p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-3">
            <SkeletonLoader variant="button" width="24px" className="!h-6 !rounded-full" />
            <SkeletonLoader variant="title" width="60%" />
            <SkeletonLoader variant="text" width="80px" className="!h-6 !rounded-full" />
          </div>
          <SkeletonLoader variant="text" lines={2} />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonLoader variant="text" width="60px" className="!h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="ml-9 space-y-4">
        <SkeletonLoader variant="title" width="40%" />
        
        {/* Video section */}
        <div className="space-y-3">
          <SkeletonLoader variant="text" width="30%" />
          <SkeletonLoader variant="video" />
        </div>

        {/* Articles section */}
        <div className="space-y-3">
          <SkeletonLoader variant="text" width="30%" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded">
                <SkeletonLoader variant="text" width="20px" className="!h-4" />
                <div className="flex-1 space-y-1">
                  <SkeletonLoader variant="text" width="70%" />
                  <SkeletonLoader variant="text" width="90%" className="!h-3" />
                </div>
                <SkeletonLoader variant="text" width="60px" className="!h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

