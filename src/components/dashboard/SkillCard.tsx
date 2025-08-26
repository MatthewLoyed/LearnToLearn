"use client";
import { motion } from "framer-motion";
import { ArrowRight, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface SkillCardProps {
  skill: {
    id: string;
    name: string;
    progress: number;
    currentMilestone: string;
    totalMilestones: number;
    completedMilestones: number;
    lastActive: string;
  };
  index: number;
}

export function SkillCard({ skill, index }: SkillCardProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-600";
    if (progress >= 60) return "bg-blue-600";
    if (progress >= 40) return "bg-yellow-600";
    if (progress >= 20) return "bg-orange-600";
    return "bg-red-600";
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    if (progress >= 20) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {skill.name}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {skill.lastActive}
            </div>
          </div>
          <CardDescription className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
            {skill.completedMilestones} of {skill.totalMilestones} milestones completed
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span className={`font-medium ${getProgressTextColor(skill.progress)}`}>
                {skill.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(skill.progress)}`}
                initial={{ width: 0 }}
                animate={{ width: `${skill.progress}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
          </div>
          
          {/* Current Milestone */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Current Milestone</p>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {skill.currentMilestone}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {skill.completedMilestones > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {Math.round((skill.completedMilestones / skill.totalMilestones) * 100)}% Complete
                </span>
              )}
            </div>
            <Link href={`/skill/${encodeURIComponent(skill.name)}`}>
              <Button 
                size="sm" 
                className="btn-primary group-hover:bg-gray-600 transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
