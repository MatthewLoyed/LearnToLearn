"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Shield, Brain, Target, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillTree } from "@/components/ui/skill-tree";
import { LazySection } from "@/components/ui/lazy-section";
import { SkeletonLoader, SkeletonCard, SkeletonMilestone } from "@/components/ui/skeleton-loader";
import { applyTopicCustomization, resetTopicCustomization } from "@/lib/utils/formatting/font-utils";
import { getAllResourcesForTopic } from "@/lib/data/roadmaps/community-resources";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";
import { BreadcrumbTrail } from "@/components/navigation/BreadcrumbTrail";
import { SkillOverview } from "@/components/skill/SkillOverview";
import { deleteSkill, getSkillByTopic, updateSkillProgress, addSkillToLibrary } from "@/lib/services/skill-library";

import Link from "next/link";

// Types (copied from existing)
interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: Resource[];
  // NEW: Skill deconstruction properties
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
  realWorldApplications?: {
    whyItMatters: {
      careerOpportunities: string;
      personalGrowth: string;
      creativeExpression: string;
      problemSolving: string;
    };
    practicalApplications: {
      professionalUse: string;
      communityImpact: string;
      personalProjects: string;
      entrepreneurial: string;
    };
    successStories: Array<{
      title: string;
      description: string;
      outcome: string;
    }>;
  };
}

export default function SkillOverviewPage({ params }: { params: Promise<{ skillId: string }> }) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [maxTokensMode, setMaxTokensMode] = useState(false);
  const [currentMilestoneId, setCurrentMilestoneId] = useState<string | null>(null);
  
  const [loadingProgress, setLoadingProgress] = useState({
    currentStep: 0,
    totalSteps: 0,
    currentMessage: '',
    progress: 0
  });

  // NEW: Practice session tracking
  const [practiceSessions, setPracticeSessions] = useState<Record<string, any[]>>({});

  // Fetch roadmap data with localStorage optimization
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const resolvedParams = await params;
        const skillId = decodeURIComponent(resolvedParams.skillId);
        
        const urlParams = new URLSearchParams(window.location.search);
        const aiEnabledParam = urlParams.get('ai') === 'true';
        const maxTokensParam = urlParams.get('maxTokens') === 'true';
        setAiEnabled(aiEnabledParam);
        setMaxTokensMode(maxTokensParam);
        
        // Check localStorage first to avoid re-generating
        const storageKey = `roadmap-${skillId}-${aiEnabledParam ? 'ai' : 'curated'}`;
        console.log(`🔍 Checking localStorage for key: ${storageKey}`);
        const storedData = localStorage.getItem(storageKey);
        console.log(`📦 Stored data found: ${storedData ? 'YES' : 'NO'}`);
        
        if (storedData) {
          console.log(`🔗 Loading existing roadmap from localStorage: ${skillId} (AI: ${aiEnabledParam})`);
          
          try {
            const roadmapData = JSON.parse(storedData);
            console.log(`✅ Successfully parsed localStorage data for: ${skillId}`);
            
            // Validate that the data has the required structure
            if (!roadmapData.topic || !roadmapData.milestones || !Array.isArray(roadmapData.milestones)) {
              throw new Error('Invalid roadmap data structure');
            }
            
            console.log(`✅ Roadmap data validation passed for: ${skillId}`);
            
            // Quick loading simulation for better UX
            setLoadingProgress({
              currentStep: 1,
              totalSteps: 3,
              currentMessage: 'Loading your skill deconstruction...',
              progress: 33
            });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setRoadmap(roadmapData);
            
            // Restore dashboard state from localStorage
            if (roadmapData.dashboardState) {
              console.log(`🔄 Restoring dashboard state from localStorage`);
              setCompletedMilestones(roadmapData.dashboardState.completedMilestones || []);
              setCurrentMilestoneId(roadmapData.dashboardState.currentMilestoneId || roadmapData.milestones[0]?.id);
              setPracticeSessions(roadmapData.dashboardState.practiceSessions || {});
            } else {
              // Fallback for legacy data
              const firstIncomplete = roadmapData.milestones.find((m: LearningMilestone) => 
                !completedMilestones.includes(m.id)
              );
              setCurrentMilestoneId(firstIncomplete?.id || roadmapData.milestones[0]?.id);
            }
            
            setLoadingProgress({
              currentStep: 3,
              totalSteps: 3,
              currentMessage: 'Ready to continue learning!',
              progress: 100
            });
            
            await new Promise(resolve => setTimeout(resolve, 300));
            setLoading(false);
            
            // Ensure skill is in library (in case it wasn't saved before)
            try {
              addSkillToLibrary(skillId, aiEnabledParam, maxTokensParam, roadmapData);
              console.log('📚 Skill added to library from localStorage:', skillId);
            } catch (libraryError) {
              console.error('Error adding skill to library from localStorage:', libraryError);
            }
            
            console.log(`🎉 Successfully loaded from localStorage - NO API CALL MADE!`);
            return; // Exit early - no API calls needed!
          } catch (parseError) {
            console.error(`❌ Error parsing localStorage data:`, parseError);
            // Continue to API call if localStorage data is corrupted
          }
        }
        
        // Only generate new roadmap if not in localStorage
        console.log(`🔄 Generating new roadmap: ${skillId} (AI: ${aiEnabledParam})`);
        console.log(`🚨 API CALL WILL BE MADE - localStorage check failed!`);
        
        // Initialize progress tracking
        const totalSteps = aiEnabledParam ? 8 : 3;
        setLoadingProgress({
          currentStep: 0,
          totalSteps,
          currentMessage: 'Initializing skill deconstruction...',
          progress: 0
        });
        
        // Simulate progress for better UX
        if (!aiEnabledParam) {
          // Curated content progress simulation
          for (let i = 1; i <= 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setLoadingProgress(prev => ({
              ...prev,
              currentStep: i,
              currentMessage: i === 1 ? `Loading curated skill deconstruction for ${skillId}...` :
                           i === 2 ? 'Organizing learning milestones...' :
                           'Finalizing your learning path...',
              progress: i * 33
            }));
          }
        } else {
          // AI-enabled progress tracking
          const stepDuration = 3000; // 3 seconds per step
          const messages = [
            `Analyzing ${skillId} learning requirements...`,
            'Classifying learning intent and goals...',
            'Generating personalized learning milestones...',
            'Searching for high-quality YouTube videos...',
            'Finding relevant articles and resources...',
            'Enhancing content with real resources...',
            'Optimizing learning path structure...',
            'Finalizing your personalized roadmap...'
          ];
          
          for (let i = 1; i <= 8; i++) {
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            setLoadingProgress(prev => ({
              ...prev,
              currentStep: i,
              currentMessage: messages[i - 1],
              progress: i * 12
            }));
          }
        }
        
        const response = await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: skillId, // Use skillId as topic for now
            skillLevel: "beginner",
            timeCommitment: "flexible",
            aiEnabled: aiEnabledParam,
            maxTokensMode: maxTokensParam,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (aiEnabledParam) {
            setLoadingProgress(prev => ({
              ...prev,
              currentStep: 8,
              currentMessage: 'Skill deconstruction generated successfully!',
              progress: 100
            }));
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          if (data.customization) {
            applyTopicCustomization(data.customization);
          } else {
            resetTopicCustomization();
          }
          
          setRoadmap(data);
          
          // Store complete roadmap data in localStorage for milestone pages
          const storageKey = `roadmap-${skillId}-${aiEnabledParam ? 'ai' : 'curated'}`;
          const completeData = {
            ...data,
            generatedAt: new Date().toISOString(),
            aiEnabled: aiEnabledParam,
            maxTokensMode: maxTokensParam,
            // Include dashboard state
            dashboardState: {
              completedMilestones: [],
              currentMilestoneId: data.milestones[0]?.id || null,
              practiceSessions: {},
              lastUpdated: new Date().toISOString()
            }
          };
          localStorage.setItem(storageKey, JSON.stringify(completeData));
          console.log(`💾 Stored complete dashboard data in localStorage: ${storageKey}`);
          console.log(`📊 Data includes:`, {
            topic: completeData.topic,
            milestones: completeData.milestones?.length || 0,
            aiEnabled: completeData.aiEnabled,
            dashboardState: completeData.dashboardState,
            customization: completeData.customization ? 'Yes' : 'No',
            videos: completeData.milestones?.reduce((acc, m) => acc + (m.videos?.length || 0), 0) || 0,
            articles: completeData.milestones?.reduce((acc, m) => acc + (m.articles?.length || 0), 0) || 0
          });
          
          // Save skill to library for future access
          try {
            addSkillToLibrary(skillId, aiEnabledParam, maxTokensParam, data);
            console.log('📚 Skill automatically saved to library:', skillId);
          } catch (libraryError) {
            console.error('Error saving skill to library:', libraryError);
            // Don't fail the request if library save fails
          }
          
          // Set current milestone to first incomplete milestone
          const firstIncomplete = data.milestones.find((m: LearningMilestone) => 
            !completedMilestones.includes(m.id)
          );
          setCurrentMilestoneId(firstIncomplete?.id || data.milestones[0]?.id);
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
    return () => resetTopicCustomization();
  }, [params]);

  // Handle milestone completion
  const handleMilestoneComplete = (milestoneId: string) => {
    if (!roadmap) return;
    
    // Update local state
    const newCompletedMilestones = [...completedMilestones, milestoneId];
    setCompletedMilestones(newCompletedMilestones);
    
    // Find next milestone
    const currentIndex = roadmap.milestones.findIndex(m => m.id === milestoneId);
    const nextMilestone = roadmap.milestones[currentIndex + 1];
    const newCurrentMilestoneId = nextMilestone?.id || null;
    setCurrentMilestoneId(newCurrentMilestoneId);
    
    // Update localStorage
    try {
      const storageKey = `roadmap-${roadmap.topic}-${aiEnabled ? 'ai' : 'curated'}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const data = JSON.parse(storedData);
        const updatedData = {
          ...data,
          dashboardState: {
            ...data.dashboardState,
            completedMilestones: newCompletedMilestones,
            currentMilestoneId: newCurrentMilestoneId,
            lastUpdated: new Date().toISOString()
          }
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        console.log(`💾 Updated dashboard state in localStorage for milestone completion`);
      }
      
      // Update progress in skill library
      const skill = getSkillByTopic(roadmap.topic, aiEnabled);
      if (skill) {
        updateSkillProgress(skill.id, {
          completedMilestones: newCompletedMilestones.length,
          currentMilestoneId: newCurrentMilestoneId
        });
        console.log('📈 Updated skill progress in library:', skill.id);
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  // Handle milestone click
  const handleMilestoneClick = (milestoneId: string) => {
    // Navigate to milestone page with AI parameters preserved
    if (roadmap) {
      const params = new URLSearchParams();
      if (aiEnabled) params.append('ai', 'true');
      if (maxTokensMode) params.append('maxTokens', 'true');
      
      const url = `/skill/${encodeURIComponent(roadmap.topic)}/milestone/${milestoneId}${params.toString() ? `?${params.toString()}` : ''}`;
      window.location.href = url;
    }
  };

  // Handle skill deletion
  const handleDeleteSkill = () => {
    if (!roadmap) return;
    
    const skillName = roadmap.topic;
    if (window.confirm(`Delete "${skillName}"? This will remove all progress and data.`)) {
      try {
        // Find the skill in the library
        const skill = getSkillByTopic(skillName, aiEnabled);
        if (skill) {
          const success = deleteSkill(skill.id);
          if (success) {
            console.log('🗑️ Skill deleted:', skillName);
            // Redirect to dashboard
            window.location.href = '/';
          }
        } else {
          // If skill not found in library, just remove roadmap data
          const storageKey = `roadmap-${skillName}-${aiEnabled ? 'ai' : 'curated'}`;
          localStorage.removeItem(storageKey);
          console.log('🗑️ Removed roadmap data:', storageKey);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-6">
              <p className="text-gray-600">{loadingProgress.currentMessage}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Skill</CardTitle>
              <CardDescription>
                Unable to load the skill deconstruction. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/">Return to Dashboard</Link>
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
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <BreadcrumbTrail />
      </div>

      {/* Skill Overview Component */}
      {roadmap && (
        <SkillOverview
          roadmap={roadmap}
          completedMilestones={completedMilestones}
          currentMilestoneId={currentMilestoneId}
          onMilestoneClick={handleMilestoneClick}
          onMilestoneComplete={handleMilestoneComplete}
          onDeleteSkill={handleDeleteSkill}
        />
      )}
    </div>
  );
}
