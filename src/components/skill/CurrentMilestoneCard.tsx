"use client";
import { motion } from "framer-motion";
import { Target, Clock, CheckCircle, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  levelNumber?: number;
  doThisNow?: {
    prompt: string;
    reps?: number;
    sets?: number;
    activityType: string;
  };
}

interface CurrentMilestoneCardProps {
  milestone: LearningMilestone;
  onStartMilestone: (milestoneId: string) => void;
  isActive?: boolean;
}

export function CurrentMilestoneCard({ 
  milestone, 
  onStartMilestone, 
  isActive = true 
}: CurrentMilestoneCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-100";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100";
      case "advanced":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Beginner";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return "Unknown";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <Card className={`max-w-4xl mx-auto border-2 ${
        isActive 
          ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <Target className="h-6 w-6 text-blue-600 mr-3" />
                <CardTitle className="text-2xl text-blue-900">
                  Current Milestone: {milestone.title}
                </CardTitle>
              </div>
              
              <CardDescription className="text-blue-700 text-base mb-4">
                {milestone.description}
              </CardDescription>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-blue-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-medium">{milestone.estimatedTime}</span>
                </div>
                
                <div className="flex items-center text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Milestone {milestone.levelNumber || '?'}</span>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(milestone.difficulty)}`}>
                  {getDifficultyLabel(milestone.difficulty)}
                </div>
              </div>

              {/* Do This Now Preview */}
              {milestone.doThisNow && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Play className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Practice Activity</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {milestone.doThisNow.prompt}
                  </p>
                  {(milestone.doThisNow.reps || milestone.doThisNow.sets) && (
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-600">
                      {milestone.doThisNow.reps && (
                        <span>{milestone.doThisNow.reps} reps</span>
                      )}
                      {milestone.doThisNow.sets && (
                        <span>{milestone.doThisNow.sets} sets</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-right ml-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  size="lg"
                  className={`px-8 py-3 ${
                    isActive 
                      ? 'btn-gray-primary shadow-lg hover:shadow-xl' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  onClick={() => isActive && onStartMilestone(milestone.id)}
                  disabled={!isActive}
                >
                  <Play className="h-5 w-5 mr-2" />
                  {isActive ? 'Start This Milestone' : 'Milestone Locked'}
                  {isActive && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </motion.div>
              
              {isActive && (
                <p className="text-xs text-blue-600 mt-2">
                  Click to begin your focused learning session
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
