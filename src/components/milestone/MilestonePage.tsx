"use client";
import { motion } from "framer-motion";
import { Play, Target, Brain, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MilestoneHeader } from "@/components/milestone/MilestoneHeader";
import { CoreLearningSection } from "@/components/milestone/CoreLearningSection";
import { PracticeActivity } from "@/components/practice/PracticeActivity";
import { ProgressLogging } from "@/components/milestone/ProgressLogging";
import Link from "next/link";

// Types for milestone page
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

interface MilestonePageProps {
  roadmap: RoadmapData;
  currentMilestone: LearningMilestone;
  practiceCompleted: boolean;
  milestoneCompleted: boolean;
  progressLog: string;
  onPracticeComplete: (milestoneId: string, practiceData: any) => void;
  onMilestoneComplete: () => void;
  onProgressLogChange: (log: string) => void;
  aiEnabled?: boolean;
  maxTokensMode?: boolean;
}

export function MilestonePage({
  roadmap,
  currentMilestone,
  practiceCompleted,
  milestoneCompleted,
  progressLog,
  onPracticeComplete,
  onMilestoneComplete,
  onProgressLogChange,
  aiEnabled = false,
  maxTokensMode = false
}: MilestonePageProps) {
  // Get current milestone index for navigation
  const currentIndex = roadmap.milestones.findIndex(m => m.id === currentMilestone.id);
  const nextMilestone = roadmap.milestones[currentIndex + 1];
  const prevMilestone = roadmap.milestones[currentIndex - 1];

  // Helper function to build URLs with AI parameters
  const buildUrlWithParams = (baseUrl: string) => {
    const params = new URLSearchParams();
    if (aiEnabled) params.append('ai', 'true');
    if (maxTokensMode) params.append('maxTokens', 'true');
    return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      {/* Milestone Header */}
      <MilestoneHeader milestone={currentMilestone} />

      {/* Core Learning Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <CoreLearningSection milestone={currentMilestone} />
      </motion.div>

      {/* Do This Now Section */}
      {currentMilestone.doThisNow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <Target className="h-6 w-6 text-purple-600" />
                <span>Do This Now</span>
              </CardTitle>
              <CardDescription className="text-purple-700">
                Complete this practice to advance to the next milestone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-800 text-lg mb-4">{currentMilestone.doThisNow.prompt}</p>
              </div>
              
              <PracticeActivity
                milestoneId={currentMilestone.id}
                activityType={currentMilestone.doThisNow.activityType}
                reps={currentMilestone.doThisNow.reps}
                sets={currentMilestone.doThisNow.sets}
                onComplete={onPracticeComplete}
                isCompleted={practiceCompleted}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress Logging */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <ProgressLogging
          progressLog={progressLog}
          onProgressLogChange={onProgressLogChange}
        />
      </motion.div>

      {/* Completion Section */}
      {practiceCompleted && !milestoneCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Practice Complete!
                </h3>
                <p className="text-green-700 mb-6">
                  Great job! You've completed the practice for this milestone.
                </p>
                <Button 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onMilestoneComplete}
                >
                  Mark Milestone Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Success Message */}
      {milestoneCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Milestone Complete!
                </h3>
                <p className="text-green-700 mb-6">
                  Congratulations! You've successfully completed this milestone.
                </p>
                                 <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                   {prevMilestone && (
                     <Button className="btn-gray-outline" asChild>
                       <Link href={buildUrlWithParams(`/skill/${encodeURIComponent(roadmap.topic)}/milestone/${prevMilestone.id}`)}>
                         <ChevronLeft className="h-4 w-4 mr-2" />
                         Previous Milestone
                       </Link>
                     </Button>
                   )}
                   {nextMilestone ? (
                     <Button className="btn-gray-primary" asChild>
                       <Link href={buildUrlWithParams(`/skill/${encodeURIComponent(roadmap.topic)}/milestone/${nextMilestone.id}`)}>
                         Next Milestone
                         <ChevronRight className="h-4 w-4 ml-2" />
                       </Link>
                     </Button>
                   ) : (
                     <Button className="btn-gray-primary" asChild>
                       <Link href={buildUrlWithParams(`/skill/${encodeURIComponent(roadmap.topic)}`)}>
                         Back to Skill Overview
                       </Link>
                     </Button>
                   )}
                 </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

             {/* Navigation */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
         className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
       >
         <Button className="btn-gray-outline w-full sm:w-auto" asChild>
           <Link href={buildUrlWithParams(`/skill/${encodeURIComponent(roadmap.topic)}`)}>
             <ArrowLeft className="h-4 w-4 mr-2" />
             Back to Skill Overview
           </Link>
         </Button>
         
         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
           {prevMilestone && (
             <Button className="btn-gray-outline" asChild>
               <Link href={buildUrlWithParams(`/skill/${encodeURIComponent(roadmap.topic)}/milestone/${prevMilestone.id}`)}>
                 <ChevronLeft className="h-4 w-4 mr-2" />
                 Previous
               </Link>
             </Button>
           )}
           {nextMilestone && (
             <Button className="btn-gray-primary" asChild>
               <Link href={buildUrlWithParams(`/skill/${encodeURIComponent(roadmap.topic)}/milestone/${nextMilestone.id}`)}>
                 Next
                 <ChevronRight className="h-4 w-4 ml-2" />
               </Link>
             </Button>
           )}
         </div>
       </motion.div>
    </div>
  );
}
