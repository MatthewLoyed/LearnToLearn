"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  
  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string) => {
    if (!url || typeof url !== 'string') {
      return '';
    }
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const extractedVideoId = getVideoId(videoId);
  const embedUrl = `https://www.youtube.com/embed/${extractedVideoId}?rel=0&modestbranding=1`;

  // Check if video ID is valid
  const isValidVideoId = extractedVideoId && extractedVideoId.length === 11;

  if (!isValidVideoId || hasError) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <h4 className="font-medium text-gray-900 mb-2">Video Not Available</h4>
              <p className="text-sm text-gray-600 mb-3">
                {!isValidVideoId 
                  ? "Invalid video ID or URL format" 
                  : "This video could not be loaded"
                }
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Search for similar videos
              </a>
            </div>
          </div>
        </div>
        
        {/* Video Info */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1 pr-2">
              {title}
            </h4>
            <span className="text-xs text-red-500 font-medium">
              ⚠️ Not Available
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          onError={() => setHasError(true)}
        />
      </div>
      
      {/* Video Info */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1 pr-2">
            {title}
          </h4>
          <a
            href={`https://www.youtube.com/watch?v=${extractedVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface VideoThumbnailProps {
  videoId: string;
  title: string;
  description?: string;
  duration?: string;
  onPlay: () => void;
}

export function VideoThumbnail({ videoId, title, description, duration, onPlay }: VideoThumbnailProps) {
  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string) => {
    if (!url || typeof url !== 'string') {
      return '';
    }
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const extractedVideoId = getVideoId(videoId);
  
  // Use a more reliable thumbnail URL that exists for most videos
  const thumbnailUrl = `https://img.youtube.com/vi/${extractedVideoId}/hqdefault.jpg`;

  return (
    <div className="group relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Try multiple fallback options
            if (target.src.includes('hqdefault.jpg')) {
              target.src = `https://img.youtube.com/vi/${extractedVideoId}/mqdefault.jpg`;
            } else if (target.src.includes('mqdefault.jpg')) {
              target.src = `https://img.youtube.com/vi/${extractedVideoId}/default.jpg`;
            } else {
              // Final fallback to a generic placeholder
              target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='14'%3EVideo Thumbnail%3C/text%3E%3C/svg%3E`;
            }
          }}
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <button
            onClick={onPlay}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-lg"
          >
            <Play className="h-8 w-8 text-white ml-1" />
          </button>
        </div>

        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
