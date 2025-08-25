"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function LazySection({ 
  children, 
  fallback, 
  threshold = 0.1, 
  delay = 0,
  className = "",
  once = true 
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            if (once) {
              setHasLoaded(true);
              observer.disconnect();
            }
          }, delay);
        } else if (!once && !hasLoaded) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, delay, once, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {fallback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className = "",
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E",
  onLoad,
  onError
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [src, onLoad, onError]);

  return (
    <div className="relative overflow-hidden">
      <motion.img
        src={currentSrc}
        alt={alt}
        className={`transition-all duration-500 ${className} ${
          !isLoaded ? 'blur-sm scale-105' : 'blur-0 scale-100'
        }`}
        loading="lazy"
        animate={{
          filter: isLoaded ? 'blur(0px)' : 'blur(4px)',
          scale: isLoaded ? 1 : 1.05
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LazyVideoProps {
  videoId: string;
  title: string;
  thumbnail?: string;
  className?: string;
  onPlay?: () => void;
}

export function LazyVideo({ 
  videoId, 
  title, 
  thumbnail,
  className = "",
  onPlay 
}: LazyVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlay = () => {
    setShowPlayer(true);
    onPlay?.();
  };

  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {!showPlayer ? (
        <LazySection
          fallback={
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">
                <div className="text-4xl mb-2">▶️</div>
                <p className="text-sm">Loading video...</p>
              </div>
            </div>
          }
        >
          <div className="relative w-full h-full group cursor-pointer" onClick={handlePlay}>
            <ProgressiveImage
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoaded(true)}
            />
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <motion.div
                className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 text-gray-800 flex items-center justify-center">
                  ▶️
                </div>
              </motion.div>
            </div>
            
            {/* Video info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-medium text-sm line-clamp-2">{title}</h3>
            </div>
          </div>
        </LazySection>
      ) : (
        <motion.iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

