"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  CheckCircle, 
  Circle,
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Activity,
  ExternalLink,
  Star
} from "lucide-react";
import { VideoPlayer, VideoThumbnail } from "../ui/video-player";
import { PracticeActivity } from "../practice/PracticeActivity";

interface MilestoneSectionProps {
  milestone: {
    id: string;
    title: string;
    description: string;
    levelNumber?: number;
    estimatedTime: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    // Skill deconstruction specific
    doThisNow?: {
      prompt: string;
      reps?: number;
      sets?: number;
      activityType: string;
    };
    // Existing roadmap resources
    resources?: Array<{
      type: "video" | "article" | "tutorial" | "practice" | "visual";
      title: string;
      url: string;
      description: string;
      duration?: string;
      source?: string;
    }>;
  };
  progress?: {
    completed: boolean;
    timeSpent?: number;
    practiceSessions?: number;
    lastActivity?: string;
  };
  onComplete: (milestoneId: string) => void;
  onPracticeComplete: (milestoneId: string, practiceData: any) => void;
  isActive?: boolean;
  onNavigate?: (direction: 'prev' | 'next') => void;
  index: number;
}

export function MilestoneSection({
  milestone,
  progress,
  onComplete,
  onPracticeComplete,
  isActive = false,
  onNavigate,
  index
}: MilestoneSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Always expanded by default
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const handlePracticeComplete = (practiceData: any) => {
    setPracticeCompleted(true);
    onPracticeComplete(milestone.id, practiceData);
  };

  const handleMilestoneComplete = () => {
    onComplete(milestone.id);
  };

  const handleVideoPlay = (url: string, title: string) => {
    setSelectedVideo(url);
  };

  const handleVideoClose = () => {
    setSelectedVideo(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-100";
      case "intermediate": return "text-yellow-600 bg-yellow-100";
      case "advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="h-4 w-4" />;
      case "article": return <BookOpen className="h-4 w-4" />;
      case "tutorial": return <BookOpen className="h-4 w-4" />;
      case "practice": return <CheckCircle className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

    return (
    <motion.div
      id={`milestone-${milestone.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`border rounded-lg p-6 mb-6 transition-all duration-300 ${
        progress?.completed 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg' 
          : isActive 
            ? 'border-purple-500 bg-purple-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Level Number */}
          {milestone.levelNumber && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              progress?.completed 
                ? 'bg-green-500' 
                : isActive 
                  ? 'bg-purple-500' 
                  : 'bg-gray-400'
            }`}>
              {milestone.levelNumber}
            </div>
          )}
          
          {/* Title and Description */}
          <div>
            <h3 className={`text-2xl font-bold text-gray-900 transition-all duration-300 ${
              progress?.completed ? 'text-green-800 line-through decoration-green-600 decoration-2' : ''
            }`}>
              {milestone.title}
            </h3>
            <p className={`text-gray-600 mt-1 transition-all duration-300 ${
              progress?.completed ? 'text-green-700 opacity-80' : ''
            }`}>
              {milestone.description}
            </p>
          </div>
        </div>
        
        {/* Simple Status */}
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(milestone.difficulty)}`}>
            {milestone.difficulty}
          </span>
          
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{milestone.estimatedTime}</span>
          </div>
          
                     {/* Completion Button */}
           <button
             onClick={() => onComplete(milestone.id)}
             className={`p-2 rounded-full transition-all duration-300 ${
               progress?.completed 
                 ? 'bg-green-100 text-green-600' 
                 : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
             }`}
           >
             {progress?.completed ? (
               <CheckCircle className="h-5 w-5" />
             ) : (
               <Circle className="h-5 w-5" />
             )}
           </button>
           
           {/* Expand/Collapse Button */}
           <button
             onClick={() => setIsExpanded(!isExpanded)}
             className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
           >
             {isExpanded ? (
               <ChevronUp className="h-4 w-4 text-gray-600" />
             ) : (
               <ChevronDown className="h-4 w-4 text-gray-600" />
             )}
           </button>
        </div>
      </div>

             {/* Content */}
       <AnimatePresence>
         {isExpanded && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             transition={{ duration: 0.3 }}
             className="space-y-8"
           >
                         {/* Videos Section */}
             {milestone.resources && milestone.resources.filter(r => r.type === 'video').length > 0 && (
               <div>
                 <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                   <Play className="h-5 w-5 text-blue-500" />
                   <span>Watch & Learn</span>
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {milestone.resources.filter(r => r.type === 'video').map((video, videoIndex) => (
                     <div key={videoIndex}>
                       {video.url === '#' ? (
                         <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                           <div className="flex items-center space-x-2 mb-2">
                             <Play className="h-4 w-4 text-red-500" />
                             <span className="text-sm font-medium text-red-700">No video found</span>
                           </div>
                           <p className="text-xs text-red-600 mb-2">{video.title}</p>
                           <p className="text-xs text-red-500">
                             Video search failed. Try refreshing or check your internet connection.
                           </p>
                         </div>
                                              ) : selectedVideo === video.url ? (
                          <VideoPlayer
                            videoId={video.url}
                            title={video.title}
                          />
                       ) : (
                         <VideoThumbnail
                           videoId={video.url}
                           title={video.title}
                           description={video.description}
                           duration={video.duration}
                           onPlay={() => handleVideoPlay(video.url, video.title)}
                         />
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

                         {/* Articles Section */}
             {milestone.resources && milestone.resources.filter(r => r.type === 'article').length > 0 && (
               <div>
                 <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                   <BookOpen className="h-5 w-5 text-green-500" />
                   <span>Read & Understand</span>
                 </h4>
                <div className="space-y-3">
                  {milestone.resources.filter(r => r.type === 'article').map((resource, resourceIndex) => (
                    <div key={resourceIndex} className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-sm mb-1">{resource.title}</h6>
                        <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                        {resource.url === '#' ? (
                          <div className="text-xs text-red-500">
                            No article found - search failed
                          </div>
                        ) : (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                          >
                            <span>Read Article</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                         {/* Practice Section */}
             {milestone.resources && milestone.resources.filter(r => r.type === 'practice').length > 0 && (
               <div>
                 <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                   <CheckCircle className="h-5 w-5 text-green-500" />
                   <span>Practice & Apply</span>
                 </h4>
                <div className="space-y-3">
                  {milestone.resources.filter(r => r.type === 'practice').map((resource, resourceIndex) => (
                    <div key={resourceIndex} className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-sm mb-1">{resource.title}</h6>
                        <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                        >
                          <span>Start Practice</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



                         {/* Do This Now Section */}
             {milestone.doThisNow && (
               <div className="border-t pt-6">
                 <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                   <Target className="h-5 w-5 text-purple-500" />
                   <span>Do This Now</span>
                 </h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-gray-800 mb-4">{milestone.doThisNow.prompt}</p>
                  
                  {/* Practice activity */}
                  <PracticeActivity
                    milestoneId={milestone.id}
                    activityType={milestone.doThisNow.activityType}
                    reps={milestone.doThisNow.reps}
                    sets={milestone.doThisNow.sets}
                    onComplete={handlePracticeComplete}
                    isCompleted={practiceCompleted}
                  />
                </div>
              </div>
            )}

            {/* Complete Milestone Button */}
            {!progress?.completed && practiceCompleted && (
              <div className="border-t pt-6">
                <button
                  onClick={handleMilestoneComplete}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Complete Milestone</span>
                </button>
              </div>
            )}
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
   );
 }
