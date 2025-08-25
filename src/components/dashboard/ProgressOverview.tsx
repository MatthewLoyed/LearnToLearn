"use client";
import { motion } from "framer-motion";
import { Target, TrendingUp, CheckCircle, Clock, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const overallProgress = activeSkills.length > 0 
    ? Math.round(activeSkills.reduce((sum, skill) => sum + skill.progress, 0) / activeSkills.length)
    : 0;

  const totalCompletedMilestones = activeSkills.reduce((sum, skill) => sum + skill.completedMilestones, 0);
  const totalMilestones = activeSkills.reduce((sum, skill) => sum + skill.totalMilestones, 0);
  
  const skillsInProgress = activeSkills.filter(skill => skill.progress > 0 && skill.progress < 100).length;
  const skillsCompleted = activeSkills.filter(skill => skill.progress === 100).length;
  
  const averageTimePerSkill = activeSkills.length > 0 ? Math.round(30 / activeSkills.length) : 0; // Mock calculation

  const stats = [
    {
      title: "Active Skills",
      value: activeSkills.length,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Skills in progress"
    },
    {
      title: "Overall Progress",
      value: `${overallProgress}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Average completion"
    },
    {
      title: "Milestones Completed",
      value: totalCompletedMilestones,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: `of ${totalMilestones} total`
    },
    {
      title: "Skills Completed",
      value: skillsCompleted,
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Fully mastered"
    },
    {
      title: "In Progress",
      value: skillsInProgress,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Currently learning"
    },
    {
      title: "Avg. Time/Skill",
      value: `${averageTimePerSkill}h`,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Time invested"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-12"
    >
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
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      {activeSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Learning Journey
                </h3>
                <p className="text-gray-600 mb-4">
                  You're making great progress! Keep up the momentum.
                </p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
                    <div className="text-gray-600">Overall Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalCompletedMilestones}</div>
                    <div className="text-gray-600">Milestones Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{activeSkills.length}</div>
                    <div className="text-gray-600">Active Skills</div>
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
