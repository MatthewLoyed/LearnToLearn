"use client";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressOverviewProps {
  activeSkills: Array<{
    id: string;
    name: string;
    progress: number;
    currentMilestone: string;
    totalMilestones: number;
    completedMilestones: number;
    lastActive: string;
  }>;
}

export function ProgressOverview({ activeSkills }: ProgressOverviewProps) {
  // Only show if there are active skills
  if (activeSkills.length === 0) {
    return null;
  }

  const overallProgress = Math.round(activeSkills.reduce((sum, skill) => sum + skill.progress, 0) / activeSkills.length);
  const totalCompletedMilestones = activeSkills.reduce((sum, skill) => sum + skill.completedMilestones, 0);
  const totalMilestones = activeSkills.reduce((sum, skill) => sum + skill.totalMilestones, 0);
  const skillsInProgress = activeSkills.filter(skill => skill.progress > 0 && skill.progress < 100).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Progress Summary */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{overallProgress}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalCompletedMilestones}</div>
                  <div className="text-sm text-gray-600">
                    Milestones Completed
                    {totalMilestones > 0 && (
                      <span className="text-gray-500"> of {totalMilestones}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{skillsInProgress}</div>
                  <div className="text-sm text-gray-600">Skills in Progress</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-xs ml-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {overallProgress >= 80 ? (
                "🎉 Excellent progress! You're almost there."
              ) : overallProgress >= 50 ? (
                "🚀 Great momentum! Keep up the good work."
              ) : overallProgress >= 20 ? (
                "💪 You're making steady progress. Keep going!"
              ) : (
                "🌟 You've started your learning journey. Every step counts!"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
