"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Trash2, 
  Search, 
  Clock, 
  Target,
  Plus,
  Brain,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";
import { getAllSkills, deleteSkill, SkillMetadata } from "@/lib/services/skill-library";
import Link from "next/link";

export default function SkillLibraryPage() {
  const [skills, setSkills] = useState<SkillMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSkills, setFilteredSkills] = useState<SkillMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Load skills from localStorage on mount
  useEffect(() => {
    const loadSkills = () => {
      try {
        const allSkills = getAllSkills();
        setSkills(allSkills);
        setFilteredSkills(allSkills);
        setLoading(false);
        console.log('📚 Loaded skills from library:', allSkills.length);
      } catch (error) {
        console.error('Error loading skills:', error);
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Filter skills based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSkills(skills);
    } else {
      const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSkills(filtered);
    }
  }, [searchQuery, skills]);

  // Handle skill deletion
  const handleDeleteSkill = (skillId: string, skillName: string) => {
    if (window.confirm(`Delete "${skillName}"? This will remove all progress and data.`)) {
      try {
        const success = deleteSkill(skillId);
        if (success) {
          // Update local state
          setSkills(prevSkills => prevSkills.filter(skill => skill.id !== skillId));
          console.log('🗑️ Skill deleted:', skillName);
        }
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Build URL with AI parameters
  const buildSkillUrl = (skill: SkillMetadata) => {
    const params = new URLSearchParams();
    if (skill.aiEnabled) params.append('ai', 'true');
    if (skill.maxTokensMode) params.append('maxTokens', 'true');
    return `/skill/${encodeURIComponent(skill.topic)}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <GlobalNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your skill library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Skill Library
              </h1>
              <p className="text-gray-600 mt-2">
                Continue learning your saved skills or start something new
              </p>
            </div>
            <Link href="/">
              <Button className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Skill
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search your skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No skills found' : 'No skills yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start learning your first skill to see it here'
              }
            </p>
            {!searchQuery && (
              <Link href="/">
                <Button className="btn-primary flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Start Learning
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                          {formatDate(skill.lastAccessed)}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id, skill.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete skill"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

                    {/* Current Milestone */}
                    {skill.progress.currentMilestoneId && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Target className="h-3 w-3" />
                          Current: {skill.progress.currentMilestoneId.replace('milestone-', 'Milestone ')}
                        </div>
                      </div>
                    )}

                    {/* Continue Learning Button */}
                    <Link href={buildSkillUrl(skill)} className="w-full">
                      <Button className="w-full btn-primary flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
