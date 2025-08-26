"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Brain, ArrowLeft, BookOpen, Clock, CheckCircle, Target, Trash2, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillTree } from "@/components/ui/skill-tree";

import { CurrentMilestoneCard } from "@/components/skill/CurrentMilestoneCard";
import { ProgressSummary } from "@/components/skill/ProgressSummary";
import Link from "next/link";

// Types for skill overview
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

interface SkillOverviewProps {
  roadmap: RoadmapData;
  completedMilestones: string[];
  currentMilestoneId: string | null;
  onMilestoneClick: (milestoneId: string) => void;
  onMilestoneComplete?: (milestoneId: string) => void;
  onDeleteSkill?: (milestoneId: string) => void;
}

export function SkillOverview({ 
  roadmap, 
  completedMilestones, 
  currentMilestoneId, 
  onMilestoneClick,
  onMilestoneComplete,
  onDeleteSkill
}: SkillOverviewProps) {
  const [showBrowser, setShowBrowser] = useState(false);
  
  // Calculate progress
  const progressPercentage = (completedMilestones.length / roadmap.milestones.length) * 100;
  
  // Get current milestone
  const currentMilestone = roadmap.milestones.find(m => m.id === currentMilestoneId);

  // Generate skill tree nodes
  const currentMilestoneIndex = roadmap.milestones.findIndex(m => m.id === currentMilestoneId);
  const safeCurrentIndex = currentMilestoneIndex >= 0 ? currentMilestoneIndex : 0;

  const handleLookupInBrowser = () => {
    setShowBrowser(true);
    // Auto-open educational search when section is shown
    const eduSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(roadmap.topic + " course tutorial education learn")}`;
    window.open(eduSearchUrl, '_blank', 'noopener,noreferrer');
  };
  
  const skillTreeNodes = roadmap.milestones.map((milestone, index) => ({
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    status: completedMilestones.includes(milestone.id) ? "completed" as const : 
            milestone.id === currentMilestoneId ? "in-progress" as const : 
            index <= safeCurrentIndex + 1 ? "available" as const : "locked" as const,
    difficulty: milestone.difficulty,
    estimatedTime: milestone.estimatedTime,
    dependencies: index === 0 ? [] : [roadmap.milestones[index - 1].id],
    type: index === roadmap.milestones.length - 1 ? "milestone" as const : "skill" as const,
    resources: {
      videos: milestone.resources.filter(r => r.type === 'video').length,
      articles: milestone.resources.filter(r => r.type === 'article').length,
      practice: milestone.resources.filter(r => r.type === 'practice').length
    },
    levelNumber: milestone.levelNumber,
    doThisNow: milestone.doThisNow
  }));

  // Debug: Log skill tree nodes
  console.log('🎯 SkillOverview - Skill Tree Nodes:', skillTreeNodes);
  console.log('🎯 SkillOverview - Roadmap milestones:', roadmap.milestones);
  console.log('🎯 SkillOverview - Current milestone ID:', currentMilestoneId);
  console.log('🎯 SkillOverview - Current milestone index:', safeCurrentIndex);
  console.log('🎯 SkillOverview - Completed milestones:', completedMilestones);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skill Overview Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-center mb-6 relative">
          <div className="absolute top-0 right-0">
            {onDeleteSkill && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteSkill(roadmap.topic)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                title="Delete this skill"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Skill
              </Button>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {roadmap.topic}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {roadmap.overview}
          </p>
        </div>

        {/* Progress Summary */}
        <ProgressSummary
          completedMilestones={completedMilestones.length}
          totalMilestones={roadmap.milestones.length}
          progressPercentage={progressPercentage}
          currentLevel={currentMilestone?.levelNumber}
          totalLevels={roadmap.milestones.length}
        />
      </motion.div>

      {/* Current Milestone Card */}
      {currentMilestone && (
        <CurrentMilestoneCard
          milestone={currentMilestone}
          onStartMilestone={onMilestoneClick}
          isActive={true}
        />
      )}

      {/* Skill Tree Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Your Learning Path</span>
            </CardTitle>
            <CardDescription>
              Visualize your progress through the skill deconstruction. Click on any milestone to start learning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skillTreeNodes.length > 0 ? (
              <SkillTree 
                nodes={skillTreeNodes}
                onNodeClick={onMilestoneClick}
                onNodeComplete={onMilestoneComplete}
                showProgress={true}
                currentSkillDeconstructionId={roadmap.topic}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No milestones available for skill tree visualization.</p>
                <p className="text-sm mt-2">This might be a temporary issue. Please try refreshing the page.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* YouTube Browser Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-green-900">
                  <Play className="h-6 w-6" />
                  <span>YouTube Search</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  Search YouTube directly for "{roadmap.topic}" content
                </CardDescription>
              </div>
              <Button
                onClick={handleLookupInBrowser}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                🌐 Look Up in Browser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showBrowser ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2">🎓 Educational YouTube Search</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    YouTube search for educational content, courses, and learning materials about "{roadmap.topic}"
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    Search query: "{roadmap.topic} course tutorial education learn"
                  </div>
                  <Button
                    onClick={() => {
                      const eduSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(roadmap.topic + " course tutorial education learn")}`;
                      window.open(eduSearchUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    🎓 Search Again
                  </Button>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <p className="text-xs text-green-600">
                    YouTube search opened in new tab
                  </p>
                  <Button
                    onClick={() => setShowBrowser(false)}
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300 hover:bg-green-100"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-green-600">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Ready to search YouTube</p>
                <p className="text-sm">Click "Look Up in Browser" to search YouTube for "{roadmap.topic}" content</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center space-x-4"
      >
        <Button className="btn-primary" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Button className="btn-primary" asChild>
          <Link href="/discover">
            <BookOpen className="h-4 w-4 mr-2" />
            Discover More Skills
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
