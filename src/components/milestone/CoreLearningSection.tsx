"use client";
import { motion } from "framer-motion";
import { Play, BookOpen, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/ui/video-player";

interface Resource {
  type: "video" | "article" | "tutorial" | "practice";
  title: string;
  url: string;
  description: string;
  duration?: string;
  source?: string;
}

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: Resource[];
  levelNumber?: number;
}

interface CoreLearningSectionProps {
  milestone: LearningMilestone;
}

export function CoreLearningSection({ milestone }: CoreLearningSectionProps) {
  const videos = milestone.resources.filter(r => r.type === 'video');
  const articles = milestone.resources.filter(r => r.type === 'article');

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentSource = (resource: Resource) => {
    if (resource.source === 'YouTube') {
      return { icon: '🎥', label: 'YouTube Video' };
    } else if (resource.source && resource.source !== 'Educational Resource') {
      return { icon: '📄', label: resource.source };
    } else {
      return { icon: '📚', label: 'Educational Resource' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="h-6 w-6 text-blue-600" />
          <span>Core Learning</span>
        </CardTitle>
        <CardDescription>
          Watch the video and review the content for this milestone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Video Section */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Video className="h-5 w-5 mr-2 text-blue-600" />
                Watch & Learn
              </h3>
              <p className="text-sm text-gray-600">
                Focus on the key concepts and techniques demonstrated in these videos
              </p>
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="space-y-3"
                >
                                                          <div className="bg-gray-50 rounded-lg p-3">
                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                         <h4 className="font-medium text-gray-900 text-sm sm:text-base">{video.title}</h4>
                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded self-start">
                           {getContentSource(video).icon} {getContentSource(video).label}
                         </span>
                       </div>
                     {video.description && (
                       <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                     )}
                     <div className="flex items-center justify-between text-xs text-gray-500">
                       {video.duration && (
                         <div className="flex items-center">
                           <Play className="h-3 w-3 mr-1" />
                           {video.duration}
                         </div>
                       )}
                       {video.source && video.source !== 'YouTube' && (
                         <span className="text-gray-400">via {video.source}</span>
                       )}
                     </div>
                   </div>
                  
                  <VideoPlayer
                    videoId={video.url}
                    title={video.title}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Read & Understand
              </h3>
              <p className="text-sm text-gray-600">
                Deepen your understanding with these additional resources
              </p>
            </div>
            
            <div className="space-y-4">
              {articles.map((article, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="border-l-4 border-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                                                 <div className="flex-1">
                           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                             <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{article.title}</h4>
                             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded self-start">
                               {getContentSource(article).icon} {getContentSource(article).label}
                             </span>
                           </div>
                           <p className="text-gray-600 mb-3 text-sm">{article.description}</p>
                           {article.source && article.source !== 'Educational Resource' && (
                             <p className="text-xs text-gray-500 mb-3">Source: {article.source}</p>
                           )}
                         </div>
                                                 <Button className="btn-gray-outline mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto" asChild size="sm">
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Read
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Content Message */}
        {videos.length === 0 && articles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Available</h3>
            <p className="text-gray-600">
              This milestone doesn't have any video or article content yet.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
