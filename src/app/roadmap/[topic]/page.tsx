"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Play, ExternalLink, CheckCircle, Circle, Target, Zap, TrendingUp, Users, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer, VideoThumbnail } from "@/components/ui/video-player";
import { SkillTree } from "@/components/ui/skill-tree";
import Link from "next/link";

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: Resource[];
}

interface Resource {
  type: "video" | "article" | "tutorial" | "practice";
  title: string;
  url: string;
  description: string;
  duration?: string;
}

interface RoadmapData {
  topic: string;
  overview: string;
  totalEstimatedTime: string;
  milestones: LearningMilestone[];
  prerequisites: string[];
  tips: string[];
}

export default function RoadmapPage({ params }: { params: Promise<{ topic: string }> }) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false); // Track AI status for UI
  
  // Enhanced loading progress tracking
  const [loadingProgress, setLoadingProgress] = useState({
    currentStep: 0,
    totalSteps: 0,
    currentMessage: '',
    progress: 0
  });

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const resolvedParams = await params;
        const topic = decodeURIComponent(resolvedParams.topic);
        
        // CRITICAL: Check if AI is enabled via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const aiEnabledParam = urlParams.get('ai') === 'true';
        setAiEnabled(aiEnabledParam); // Update UI state
        
        // Initialize progress tracking
        const totalSteps = aiEnabledParam ? 8 : 3; // 8 steps for AI-enabled requests (30-second timeline)
        setLoadingProgress({
          currentStep: 0,
          totalSteps,
          currentMessage: 'Initializing roadmap generation...',
          progress: 0
        });
        
        // CREDIT PROTECTION: Only make API call if AI is explicitly enabled
        // This prevents accidental credit usage on page refresh/reload
        if (!aiEnabledParam) {
          console.log('AI not enabled - using curated roadmaps only (no API call)');
          
          // Simulate progress for curated content
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 1,
            currentMessage: `Loading curated roadmap for ${topic}...`,
            progress: 33
          }));
          
          await new Promise(resolve => setTimeout(resolve, 800)); // Brief delay for UX
          
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 2,
            currentMessage: 'Organizing learning milestones...',
            progress: 66
          }));
          
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 3,
            currentMessage: 'Finalizing your learning path...',
            progress: 100
          }));
          
          await new Promise(resolve => setTimeout(resolve, 400));
        } else {
          // AI-enabled progress tracking - Realistic 30-second timeline
          const totalDuration = 30000; // 30 seconds total
          const stepDuration = totalDuration / 8; // 8 steps, ~3.75 seconds each
          
          // Step 1: Initial analysis
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 1,
            currentMessage: `Analyzing ${topic} learning requirements...`,
            progress: 12
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 2: AI classification
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 2,
            currentMessage: 'Classifying learning intent and goals...',
            progress: 25
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 3: Milestone generation
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 3,
            currentMessage: 'Generating personalized learning milestones...',
            progress: 37
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 4: Video search
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 4,
            currentMessage: 'Searching for high-quality YouTube videos...',
            progress: 50
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 5: Article search
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 5,
            currentMessage: 'Finding relevant articles and resources...',
            progress: 62
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 6: Content enhancement
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 6,
            currentMessage: 'Enhancing content with real resources...',
            progress: 75
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 7: Final optimization
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 7,
            currentMessage: 'Optimizing learning path structure...',
            progress: 87
          }));
          
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Step 8: Completion
          setLoadingProgress(prev => ({
            ...prev,
            currentStep: 8,
            currentMessage: 'Finalizing your personalized roadmap...',
            progress: 95 // Keep at 95% until API actually completes
          }));
          
          // Don't wait here - let the API call happen while showing 95%
        }
        
        const response = await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            skillLevel: "beginner",
            timeCommitment: "flexible",
            aiEnabled: aiEnabledParam, // This controls whether OpenAI API is called
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Final progress update for AI-enabled requests
          if (aiEnabledParam) {
            setLoadingProgress(prev => ({
              ...prev,
              currentStep: 8,
              currentMessage: 'Roadmap generated successfully!',
              progress: 100
            }));
            
            // Brief delay to show completion
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          setRoadmap(data);
        } else {
          console.error("Failed to fetch roadmap");
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [params]);

  const toggleMilestone = (milestoneId: string) => {
    const isCurrentlyCompleted = completedMilestones.includes(milestoneId);
    
    setCompletedMilestones(prev => 
      isCurrentlyCompleted
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const handleVideoPlay = (url: string, title: string) => {
    setActiveVideo({ url, title });
  };

  const handleVideoClose = () => {
    setActiveVideo(null);
  };

  const handleSkillNodeClick = (nodeId: string) => {
    console.log("Skill node clicked:", nodeId);
    // TODO: Navigate to specific skill details or open learning resources
  };

  const handleSkillNodeComplete = (nodeId: string) => {
    console.log("Skill node completed:", nodeId);
    // Enhanced: Update skill tree node status when completed
    // This would typically update the backend/database
    // For now, we'll just log the completion
  };

  // Video data is now dynamically loaded from roadmap resources

  // Dynamic skill tree data based on roadmap
  const skillTreeNodes = roadmap ? [
    // Foundation skills (always completed)
    {
      id: "prerequisites",
      title: "Prerequisites",
      description: "Basic knowledge and setup requirements",
      status: "completed" as const,
      difficulty: "beginner" as const,
      estimatedTime: "1 week",
      dependencies: [],
      type: "foundation" as const,
      resources: { videos: 0, articles: roadmap.prerequisites.length, practice: 0 }
    },
    // Dynamic milestones from roadmap
    ...roadmap.milestones.map((milestone, index) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      status: index === 0 ? "in-progress" as const : index < 2 ? "available" as const : "locked" as const,
      difficulty: milestone.difficulty,
      estimatedTime: milestone.estimatedTime,
      dependencies: index === 0 ? [] : [roadmap.milestones[index - 1].id],
      type: index === roadmap.milestones.length - 1 ? "milestone" as const : "skill" as const,
      resources: {
        videos: milestone.resources.filter(r => r.type === 'video').length,
        articles: milestone.resources.filter(r => r.type === 'article').length,
        practice: milestone.resources.filter(r => r.type === 'practice').length
      }
    })),
    // Final mastery node
    {
      id: `${roadmap.topic.toLowerCase()}-mastery`,
      title: `${roadmap.topic} Mastery`,
      description: `Achieve mastery in ${roadmap.topic}`,
      status: "locked" as const,
      difficulty: "advanced" as const,
      estimatedTime: "12 weeks",
      dependencies: roadmap.milestones.length > 0 ? [roadmap.milestones[roadmap.milestones.length - 1].id] : [],
      type: "milestone" as const,
      resources: { videos: 10, articles: 8, practice: 6 }
    }
  ] : [];

  // Enhanced visual feedback for milestone completion
  const getMilestoneStatus = (milestoneId: string) => {
    return completedMilestones.includes(milestoneId) ? 'completed' : 'pending';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {loadingProgress.currentStep} of {loadingProgress.totalSteps}</span>
                <span>{loadingProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            
            {/* Current Message */}
            <div className="space-y-2">
              <motion.p
                key={loadingProgress.currentMessage}
                className="text-lg font-medium text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {loadingProgress.currentMessage}
              </motion.p>
              
              {/* AI Status Indicator */}
              {aiEnabled && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Brain className="h-4 w-4" />
                  <span>AI-Powered Generation</span>
                </div>
              )}
              
              {/* Estimated Time */}
              <p className="text-sm text-muted-foreground">
                {aiEnabled ? 'This may take 10-30 seconds' : 'Almost ready...'}
              </p>
            </div>
            
            {/* Loading Dots */}
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load roadmap</h1>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = (completedMilestones.length / roadmap.milestones.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          
          {/* AI Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">AI:</span>
            <span className={`text-sm font-medium ${aiEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
              {aiEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Brain className={`h-4 w-4 ${aiEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
             <div className="flex items-center space-x-2">
               <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                   style={{ width: `${progressPercentage}%` }}
                 ></div>
               </div>
               <p className="text-lg font-semibold text-green-700">
                 {Math.round(progressPercentage)}%
               </p>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
                     {/* Roadmap Overview */}
           <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Learning Roadmap: <span className="gradient-text">{roadmap.topic}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              {roadmap.overview}
            </p>
            <div className="flex items-center justify-center space-x-6 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{roadmap.totalEstimatedTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>{roadmap.milestones.length} Milestones</span>
              </div>
            </div>
          </div>

           {/* Section 1: Prerequisites */}
          {roadmap.prerequisites.length > 0 && (
             <section className="mb-16">
               <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold mb-2">📋 Prerequisites</h2>
                 <p className="text-muted-foreground">What you need to know before starting this roadmap</p>
               </div>
               <Card>
                 <CardContent className="pt-6">
                   <ul className="space-y-3">
                  {roadmap.prerequisites.map((prereq, index) => (
                       <li key={index} className="flex items-center space-x-3">
                         <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                         </div>
                         <span className="text-lg">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
             </section>
           )}

                       {/* Section 2: Skill Tree */}
            <section className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">🌳 Skill Tree</h2>
                <p className="text-muted-foreground">Visualize your learning journey and track progress</p>
              </div>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    Your <span className="gradient-text">Learning Path</span>
                  </CardTitle>
                  <CardDescription className="text-center">
                    Click on nodes to explore skills and track your progress through the learning journey
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="h-96 relative">
                                         <SkillTree
                       nodes={skillTreeNodes}
                       onNodeClick={handleSkillNodeClick}
                       onNodeComplete={handleSkillNodeComplete}
                       className="w-full h-full"
                       showControls={true}
                     />
                  </div>
                  
                                     {/* Enhanced Progress Tracking */}
                   <div className="mt-6 pt-6 border-t border-green-200">
                     <div className="mb-4">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-medium text-gray-700">Skill Tree Progress</span>
                         <span className="text-sm text-gray-500">
                           {skillTreeNodes.filter(n => n.status === "completed").length} / {skillTreeNodes.length}
                         </span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <motion.div
                           className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                           initial={{ width: 0 }}
                           animate={{ 
                             width: `${(skillTreeNodes.filter(n => n.status === "completed").length / skillTreeNodes.length) * 100}%` 
                           }}
                           transition={{ duration: 1, ease: "easeOut" }}
                         />
                       </div>
                     </div>
                     
                     {/* Legend */}
                     <div className="flex flex-wrap justify-center gap-6 text-sm">
                       <div className="flex items-center space-x-2">
                         <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded-full"></div>
                         <span className="text-gray-600">Completed</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded-full relative">
                           <motion.div
                             className="absolute inset-0 rounded-full border-2 border-blue-400"
                             animate={{
                               scale: [1, 1.1, 1],
                               opacity: [0.3, 0.7, 0.3]
                             }}
                             transition={{
                               duration: 3,
                               repeat: Infinity,
                               ease: "easeInOut"
                             }}
                           />
                         </div>
                         <span className="text-gray-600">In Progress</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                         <span className="text-gray-600">Available</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded-full"></div>
                         <span className="text-gray-600">Locked</span>
                       </div>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </section>

           {/* Section 3: Learning Tips */}
           {roadmap.tips.length > 0 && (
             <section className="mb-16">
               <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold mb-2">💡 Pro Tips</h2>
                 <p className="text-muted-foreground">Expert advice to accelerate your learning journey</p>
               </div>
               <Card>
                 <CardContent className="pt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roadmap.tips.map((tip, index) => (
                       <div key={index} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                           <span className="text-white font-bold text-sm">{index + 1}</span>
                         </div>
                         <p className="text-base">{tip}</p>
                       </div>
                     ))}
                   </div>
              </CardContent>
            </Card>
             </section>
           )}

           {/* Section 4: Learning Milestones */}
           <section className="mb-16">
             <div className="text-center mb-8">
               <h2 className="text-3xl font-bold mb-2">🚀 Learning Milestones</h2>
               <p className="text-muted-foreground">Your step-by-step path to mastery</p>
             </div>
             <div className="space-y-6">
            {roadmap.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                                 <Card className={`relative transition-all duration-500 ${
                   completedMilestones.includes(milestone.id) 
                     ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                     : 'hover:shadow-md'
                 }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <button
                            onClick={() => toggleMilestone(milestone.id)}
                             className={`flex-shrink-0 relative group transition-all duration-300 ${
                               completedMilestones.includes(milestone.id) 
                                 ? 'scale-110' 
                                 : 'hover:scale-105'
                             }`}
                          >
                            {completedMilestones.includes(milestone.id) ? (
                               <div className="relative">
                                 <CheckCircle className="h-6 w-6 text-green-600 drop-shadow-sm" />
                                 <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
                               </div>
                            ) : (
                               <div className="relative">
                                 <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-all duration-300" />
                                 <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                               </div>
                            )}
                          </button>
                                                     <CardTitle className={`text-xl transition-all duration-300 ${
                             completedMilestones.includes(milestone.id) 
                               ? 'text-green-800 line-through decoration-green-600 decoration-2' 
                               : ''
                           }`}>
                             {milestone.title}
                           </CardTitle>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(milestone.difficulty)}`}>
                            {milestone.difficulty}
                          </span>
                        </div>
                                                 <CardDescription className={`text-base ml-9 transition-all duration-300 ${
                           completedMilestones.includes(milestone.id) 
                             ? 'text-green-700 opacity-80' 
                             : ''
                         }`}>
                          {milestone.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                         <Clock className={`h-4 w-4 transition-colors duration-300 ${
                           completedMilestones.includes(milestone.id) ? 'text-green-600' : ''
                         }`} />
                         <span className={`text-sm transition-colors duration-300 ${
                           completedMilestones.includes(milestone.id) ? 'text-green-600 font-medium' : ''
                         }`}>
                           {milestone.estimatedTime}
                         </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="ml-9">
                       <h4 className={`font-semibold mb-4 text-lg transition-all duration-300 ${
                         completedMilestones.includes(milestone.id) 
                           ? 'text-green-800' 
                           : ''
                       }`}>
                         📚 Learning Resources
                         {completedMilestones.includes(milestone.id) && (
                           <span className="ml-2 text-sm text-green-600 font-normal">
                             ✓ Completed
                           </span>
                         )}
                       </h4>
                       
                                                                       {/* Videos Section */}
                        {milestone.resources.filter(r => r.type === 'video').length > 0 && (
                          <div className="mb-6">
                            <h5 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
                              <Play className="h-4 w-4 mr-2" />
                              Videos ({milestone.resources.filter(r => r.type === 'video').length})
                            </h5>
                            
                            {/* Video Thumbnails Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {milestone.resources.filter(r => r.type === 'video').map((video, videoIndex) => (
                                <div key={videoIndex}>
                                  {activeVideo && activeVideo.url === video.url ? (
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
                       {milestone.resources.filter(r => r.type === 'article').length > 0 && (
                         <div className="mb-6">
                           <h5 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
                             <BookOpen className="h-4 w-4 mr-2" />
                             Articles ({milestone.resources.filter(r => r.type === 'article').length})
                           </h5>
                           <div className="space-y-3">
                             {milestone.resources.filter(r => r.type === 'article').map((resource, resourceIndex) => (
                               <div key={resourceIndex} className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                 <div className="flex-shrink-0 mt-1">
                                   <BookOpen className="h-5 w-5 text-blue-500" />
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
                                     <span>Read Article</span>
                                     <ExternalLink className="h-3 w-3" />
                                   </a>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Practice Section */}
                       {milestone.resources.filter(r => r.type === 'practice').length > 0 && (
                         <div className="mb-6">
                           <h5 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
                             <CheckCircle className="h-4 w-4 mr-2" />
                             Practice Exercises ({milestone.resources.filter(r => r.type === 'practice').length})
                           </h5>
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

                       {/* Other Resources */}
                       {milestone.resources.filter(r => !['video', 'article', 'practice'].includes(r.type)).length > 0 && (
                         <div>
                           <h5 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
                             <ExternalLink className="h-4 w-4 mr-2" />
                             Additional Resources ({milestone.resources.filter(r => !['video', 'article', 'practice'].includes(r.type)).length})
                           </h5>
                           <div className="space-y-3">
                             {milestone.resources.filter(r => !['video', 'article', 'practice'].includes(r.type)).map((resource, resourceIndex) => (
                               <div key={resourceIndex} className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                 <div className="flex-shrink-0 mt-1">
                                   <ExternalLink className="h-5 w-5 text-purple-500" />
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
                                <span>Open Resource</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                         </div>
                       )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
         </section>
        </motion.div>
      </main>
    </div>
  );
}


