"use client";
import { motion } from "framer-motion";
import { Clock, Target, CheckCircle } from "lucide-react";

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  levelNumber?: number;
}

interface MilestoneHeaderProps {
  milestone: LearningMilestone;
}

export function MilestoneHeader({ milestone }: MilestoneHeaderProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return difficulty;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="text-center mb-6">
        {/* Milestone Level and Title */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            {milestone.levelNumber || '?'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {milestone.title}
          </h1>
        </div>
        
        {/* Description */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          {milestone.description}
        </p>
        
        {/* Meta Information */}
        <div className="flex items-center justify-center space-x-6">
          {/* Difficulty Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(milestone.difficulty)}`}>
            {getDifficultyLabel(milestone.difficulty)}
          </span>
          
          {/* Estimated Time */}
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{milestone.estimatedTime}</span>
          </div>
          
          {/* Milestone Number */}
          <div className="flex items-center space-x-1 text-blue-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Milestone {milestone.levelNumber || '?'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
