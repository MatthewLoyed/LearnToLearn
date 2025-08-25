"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Target, Zap, Users, TrendingUp, Shield, Brain, Plus, ArrowRight, Clock, CheckCircle, Sparkles, Zap as ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { use_progress } from "@/contexts/ProgressContext";
import { generateAllSkillSummaries, getTimeSinceLastActivity } from "@/lib/utils/skill-management";
import { SkillCard } from "@/components/dashboard/SkillCard";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { getAllSkills, SkillMetadata } from "@/lib/services/skill-library";
import Link from "next/link";

// Types for the dashboard
interface SkillCard {
  id: string;
  name: string;
  progress: number;
  currentMilestone: string;
  totalMilestones: number;
  completedMilestones: number;
  lastActive: string;
}

export function MainDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [maxTokensMode, setMaxTokensMode] = useState(false);
  const [savedSkills, setSavedSkills] = useState<SkillMetadata[]>([]);

  // Check for existing AI state in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const aiEnabledParam = urlParams.get('ai') === 'true';
    const maxTokensParam = urlParams.get('maxTokens') === 'true';
    
    if (aiEnabledParam) setAiEnabled(true);
    if (maxTokensParam) setMaxTokensMode(true);
  }, []);

  // Load saved skills from library
  useEffect(() => {
    try {
      const skills = getAllSkills();
      setSavedSkills(skills);
      console.log('📚 Loaded saved skills for dashboard:', skills.length);
    } catch (error) {
      console.error('Error loading saved skills:', error);
    }
  }, []);

  const { get_active_skills, get_practice_sessions } = use_progress();
  const activeSkillsData = get_active_skills();
  const practiceSessions = get_practice_sessions();
  const skillSummaries = generateAllSkillSummaries(activeSkillsData, practiceSessions);

  const activeSkills: SkillCard[] = skillSummaries.map(skill => ({
    id: skill.id,
    name: skill.name,
    progress: skill.progress,
    currentMilestone: skill.currentMilestone,
    totalMilestones: skill.totalMilestones,
    completedMilestones: skill.completedMilestones,
    lastActive: getTimeSinceLastActivity(skill.lastActive)
  }));

  // Build URL with AI parameters for saved skills
  const buildSkillUrl = (skill: SkillMetadata) => {
    const params = new URLSearchParams();
    if (skill.aiEnabled) params.append('ai', 'true');
    if (skill.maxTokensMode) params.append('maxTokens', 'true');
    return `/skill/${encodeURIComponent(skill.topic)}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Build URL with toggle parameters
      const params = new URLSearchParams();
      if (aiEnabled) params.append('ai', 'true');
      if (maxTokensMode) params.append('maxTokens', 'true');
      
      const url = `/skill/${encodeURIComponent(searchQuery)}${params.toString() ? `?${params.toString()}` : ''}`;
      window.location.href = url;
    }
  };



  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Skill Forge
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your personalized learning dashboard. Track progress, continue your journey, and discover new skills.
        </p>
      </motion.div>

      {/* Quick Start Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Zap className="h-6 w-6 mr-2" />
              Quick Start
            </CardTitle>
            <CardDescription className="text-blue-700">
              Start learning a new skill or continue where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-6 max-w-2xl mx-auto">
              {/* Search Input */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="What skill do you want to learn? (e.g., 'how to improve at javascript')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="btn-gray-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </div>
              
              {/* AI and Max Mode Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-blue-200">
                <Toggle
                  checked={aiEnabled}
                  onCheckedChange={setAiEnabled}
                  label="Use AI"
                  description="Enable AI-powered skill deconstruction and content generation"
                  icon={<Brain className="h-4 w-4" />}
                />
                <Toggle
                  checked={maxTokensMode}
                  onCheckedChange={setMaxTokensMode}
                  label="Max Mode"
                  description="Remove token limits for comprehensive roadmaps"
                  icon={<ZapIcon className="h-4 w-4" />}
                />
              </div>
              
              {/* Status Indicators */}
              {(aiEnabled || maxTokensMode) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {aiEnabled && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      <Sparkles className="h-3 w-3" />
                      AI Enabled
                    </div>
                  )}
                  {maxTokensMode && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      <ZapIcon className="h-3 w-3" />
                      Max Mode
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Overview */}
      <ProgressOverview activeSkills={activeSkills} />

      {/* Active Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Active Skills</h2>
          <Link href="/discover">
            <Button className="btn-gray-outline flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Skill
            </Button>
          </Link>
        </div>

        {activeSkills.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Skills</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by adding your first skill</p>
              <Link href="/discover">
                <Button className="btn-gray-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Discover Skills
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <SkillCard skill={skill} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Saved Skills Section */}
      {savedSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Saved Skills</h2>
            <Link href="/library">
              <Button className="btn-gray-outline flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSkills.slice(0, 6).map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {skill.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(skill.lastAccessed).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {skill.aiEnabled && (
                          <div className="text-purple-500" title="AI Generated">
                            <Brain className="h-4 w-4" />
                          </div>
                        )}
                        {skill.maxTokensMode && (
                          <div className="text-yellow-500" title="Max Mode">
                            <Sparkles className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{skill.progress.completedMilestones}/{skill.progress.totalMilestones} milestones</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(skill.progress.completedMilestones / skill.progress.totalMilestones) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Continue Learning Button */}
                    <Link href={buildSkillUrl(skill)} className="w-full">
                      <Button className="w-full flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {activeSkills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No recent activity. Start learning to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSkills.slice(0, 3).map((skill, index) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{skill.name}</p>
                        <p className="text-sm text-gray-600">Last active {skill.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{skill.progress}% complete</p>
                      <p className="text-xs text-gray-600">{skill.currentMilestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
