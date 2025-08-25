"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Shield, Brain, Target, Play, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/ui/video-player";
import { PracticeActivity } from "@/components/practice/PracticeActivity";
import { applyTopicCustomization, resetTopicCustomization } from "@/lib/utils/formatting/font-utils";
import { getAllResourcesForTopic } from "@/lib/data/roadmaps/community-resources";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";
import { EnhancedBreadcrumbTrail } from "@/components/navigation/BreadcrumbTrail";
import { MilestonePage as MilestonePageComponent } from "@/components/milestone/MilestonePage";

import { use_progress } from "@/contexts/ProgressContext";

import Link from "next/link";

// Types (copied from existing)
interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: Resource[];
  levelNumber?: number;
  doThisNow?: {
    prompt: string;
    reps?: number;
    sets?: number;
    activityType: string;
  };
}

interface Resource {
  type: "video" | "article" | "tutorial" | "practice";
  title: string;
  url: string;
  description: string;
  duration?: string;
  source?: string;
}

interface RoadmapData {
  topic: string;
  overview: string;
  totalEstimatedTime: string;
  milestones: LearningMilestone[];
  prerequisites: string[];
  tips: string[];
  customization?: {
    category: string;
    font: string;
    icon: string;
    accentColor: string;
    background: string;
  };
}

export default function MilestonePage({ params }: { params: Promise<{ skillId: string; milestoneId: string }> }) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<LearningMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [progressLog, setProgressLog] = useState("");
  const [milestoneCompleted, setMilestoneCompleted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  
  // Progress context integration
  const { 
    get_skill_deconstruction_progress, 
    update_milestone_progress_skill, 
    start_practice_session,
    complete_practice_session,
    mark_milestone_complete_skill
  } = use_progress();

  // Fetch roadmap and milestone data with service integration
  useEffect(() => {
    const fetchMilestoneData = async () => {
      try {
        const resolvedParams = await params;
        const skillId = decodeURIComponent(resolvedParams.skillId);
        const milestoneId = decodeURIComponent(resolvedParams.milestoneId);
        
        // Check if AI is enabled via URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const aiEnabledParam = urlParams.get('ai') === 'true';
        setAiEnabled(aiEnabledParam);
        
        console.log(`Loading milestone data from localStorage for: ${skillId} - ${milestoneId} (AI: ${aiEnabledParam})`);
        
        // Load roadmap data from localStorage instead of making API calls
        const storageKey = `roadmap-${skillId}-${aiEnabledParam ? 'ai' : 'curated'}`;
        const storedData = localStorage.getItem(storageKey);
        
        if (!storedData) {
          throw new Error('Roadmap data not found in localStorage. Please return to the skill overview page to generate the roadmap first.');
        }
        
        const roadmapData = JSON.parse(storedData);
        setRoadmap(roadmapData);
        
        // Find the current milestone
        const milestone = roadmapData.milestones.find((m: LearningMilestone) => m.id === milestoneId);
        setCurrentMilestone(milestone);
        
        // Apply customization if available
        if (roadmapData.customization) {
          applyTopicCustomization(roadmapData.customization);
        } else {
          resetTopicCustomization();
        }

        // Content is already enhanced from the initial API call - no need to enhance again
        console.log(`Milestone data loaded from localStorage: ${milestone?.title}`);
      } catch (error) {
        console.error("Error fetching milestone data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestoneData();
    return () => resetTopicCustomization();
  }, [params]);



  // Handle practice completion
  const handlePracticeComplete = (milestoneId: string, practiceData: any) => {
    setPracticeCompleted(true);
    
    // Log practice session in progress context
    if (roadmap) {
      // Start a practice session first
      const sessionId = start_practice_session(
        roadmap.topic, // skillDeconstructionId
        milestoneId,
        practiceData.activityType || 'code_challenge',
        practiceData.reps,
        practiceData.sets
      );
      
      // Complete the practice session
      complete_practice_session(
        sessionId,
        practiceData.timeSpent || 15,
        true, // completed
        practiceData.difficultyRating || 3,
        practiceData.notes || ''
      );
    }
    
    console.log("Practice completed:", practiceData);
  };

  // Handle milestone completion
  const handleMilestoneComplete = () => {
    if (currentMilestone && roadmap) {
      setMilestoneCompleted(true);
      
      // Update progress in context
      mark_milestone_complete_skill(
        roadmap.topic, // skillDeconstructionId
        currentMilestone.id,
        currentMilestone.levelNumber || 1, // levelNumber
        30, // timeSpent - could be calculated from actual time spent
        progressLog, // notes
        3 // difficultyRating - could be user-provided
      );
      
      console.log("Milestone completed:", currentMilestone.id);
    }
  };

  // Get current milestone index for navigation
  const currentIndex = roadmap?.milestones.findIndex(m => m.id === currentMilestone?.id) ?? -1;
  const nextMilestone = roadmap?.milestones[currentIndex + 1];
  const prevMilestone = roadmap?.milestones[currentIndex - 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMilestone || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Milestone Not Found</CardTitle>
              <CardDescription>
                The requested milestone could not be found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/skill/${encodeURIComponent(roadmap?.topic || '')}${aiEnabled ? '?ai=true' : ''}`}>
                  Return to Skill Overview
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Enhanced Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <EnhancedBreadcrumbTrail 
          skillName={roadmap.topic}
          milestoneName={currentMilestone.title}
        />
      </div>

      {/* AI Status Indicator */}
      {aiEnabled && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                AI-Enhanced Content: Real videos and articles are being loaded for this milestone
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Page Component */}
      <MilestonePageComponent
        roadmap={roadmap}
        currentMilestone={currentMilestone}
        practiceCompleted={practiceCompleted}
        milestoneCompleted={milestoneCompleted}
        progressLog={progressLog}
        onPracticeComplete={handlePracticeComplete}
        onMilestoneComplete={handleMilestoneComplete}
        onProgressLogChange={setProgressLog}
        aiEnabled={aiEnabled}
        maxTokensMode={false}
      />
    </div>
  );
}
