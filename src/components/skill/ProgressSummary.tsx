"use client";
import { motion } from "framer-motion";
import { TrendingUp, Clock, CheckCircle, Target, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressSummaryProps {
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
  estimatedTimeRemaining?: string;
  timeSpent?: string;
  currentLevel?: number;
  totalLevels?: number;
  lastActivity?: string;
  streakDays?: number;
}

export function ProgressSummary({
  completedMilestones,
  totalMilestones,
  progressPercentage,
  estimatedTimeRemaining,
  timeSpent,
  currentLevel,
  totalLevels,
  lastActivity,
  streakDays
}: ProgressSummaryProps) {
  const stats = [
    {
      title: "Milestones Completed",
      value: `${completedMilestones}/${totalMilestones}`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Progress through learning path"
    },
    {
      title: "Overall Progress",
      value: `${Math.round(progressPercentage)}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Skill mastery level"
    },
    {
      title: "Current Level",
      value: currentLevel ? `${currentLevel}/${totalLevels || '?'}` : "N/A",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Current skill level"
    },
    {
      title: "Time Invested",
      value: timeSpent || "0h",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Total learning time"
    },
    {
      title: "Time Remaining",
      value: estimatedTimeRemaining || "Unknown",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Estimated completion time"
    },
    {
      title: "Learning Streak",
      value: streakDays ? `${streakDays} days` : "0 days",
      icon: Award,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Consecutive learning days"
    }
  ];

  const getProgressMessage = () => {
    if (progressPercentage >= 90) {
      return "Excellent progress! You're almost there!";
    } else if (progressPercentage >= 70) {
      return "Great work! You're making excellent progress.";
    } else if (progressPercentage >= 50) {
      return "Good progress! You're halfway there.";
    } else if (progressPercentage >= 25) {
      return "Keep going! You're building a solid foundation.";
    } else {
      return "You're just getting started! Every milestone counts.";
    }
  };

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "text-green-600";
    if (progressPercentage >= 70) return "text-blue-600";
    if (progressPercentage >= 50) return "text-yellow-600";
    if (progressPercentage >= 25) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-8"
    >
      {/* Main Progress Card */}
      <Card className="max-w-2xl mx-auto mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Your Progress
              </h3>
              <p className="text-gray-600">
                {completedMilestones} of {totalMilestones} milestones completed
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getProgressColor()}`}>
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <motion.div 
              className={`h-3 rounded-full transition-all duration-500 ${
                progressPercentage >= 90 ? 'bg-green-600' :
                progressPercentage >= 70 ? 'bg-blue-600' :
                progressPercentage >= 50 ? 'bg-yellow-600' :
                progressPercentage >= 25 ? 'bg-orange-600' : 'bg-red-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          
          {/* Progress Message */}
          <p className={`text-sm font-medium ${getProgressColor()}`}>
            {getProgressMessage()}
          </p>
        </CardContent>
      </Card>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className={`${stat.bgColor} border-0 hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <stat.icon className={`h-5 w-5 mr-2 ${stat.color}`} />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Last Activity */}
      {lastActivity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Last Activity
                </h3>
                <p className="text-gray-600 mb-4">
                  {lastActivity}
                </p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{completedMilestones}</div>
                    <div className="text-gray-600">Milestones Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalMilestones - completedMilestones}</div>
                    <div className="text-gray-600">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                    <div className="text-gray-600">Complete</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
