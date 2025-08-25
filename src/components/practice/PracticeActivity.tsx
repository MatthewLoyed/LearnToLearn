"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Activity, 
  Code,
  Dumbbell,
  BookOpen,
  ExternalLink
} from "lucide-react";

interface PracticeActivityProps {
  milestoneId: string;
  activityType: string;
  reps?: number;
  sets?: number;
  onComplete: (milestoneId: string, practiceData: any) => void;
  isCompleted?: boolean;
}

interface PracticeFormData {
  completed: boolean;
  timeSpent: number;
  // For physical skills
  repsCompleted?: number;
  setsCompleted?: number;
  // For code challenges
  codeSolution?: string;
  challengeCompleted?: boolean;
}

export function PracticeActivity({
  milestoneId,
  activityType,
  reps = 10,
  sets = 3,
  onComplete,
  isCompleted = false
}: PracticeActivityProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PracticeFormData>({
    defaultValues: {
      completed: false,
      timeSpent: 0,
      repsCompleted: 0,
      setsCompleted: 0,
      codeSolution: "",
      challengeCompleted: false
    }
  });

  const isPhysicalSkill = activityType === "physical";
  const isCodeChallenge = activityType === "code_challenge";

  const startPractice = () => {
    setIsActive(true);
    setStartTime(new Date());
    setCurrentRep(0);
    setCurrentSet(0);
  };

  const completeRep = () => {
    if (currentRep < reps) {
      setCurrentRep(currentRep + 1);
      setValue("repsCompleted", currentRep + 1);
    }
  };

  const completeSet = () => {
    if (currentSet < sets && currentRep >= reps) {
      setCurrentSet(currentSet + 1);
      setValue("setsCompleted", currentSet + 1);
      setCurrentRep(0);
    }
  };

  const finishPractice = () => {
    setIsActive(false);
    setEndTime(new Date());
    if (startTime) {
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60);
      setValue("timeSpent", timeSpent);
    }
  };

  const onSubmit = (data: PracticeFormData) => {
    const practiceData = {
      ...data,
      milestoneId,
      activityType,
      startTime: startTime?.toISOString(),
      endTime: endTime?.toISOString(),
      completed: true
    };
    onComplete(milestoneId, practiceData);
  };

  const getActivityIcon = () => {
    if (isPhysicalSkill) return <Dumbbell className="h-5 w-5" />;
    if (isCodeChallenge) return <Code className="h-5 w-5" />;
    return <Target className="h-5 w-5" />;
  };

  const getActivityTitle = () => {
    if (isPhysicalSkill) return "Physical Practice";
    if (isCodeChallenge) return "Code Challenge";
    return "Practice Activity";
  };

  if (isCompleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Practice Completed!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Header */}
      <div className="flex items-center space-x-2">
        {getActivityIcon()}
        <h5 className="font-medium text-gray-900">{getActivityTitle()}</h5>
      </div>

      {/* Physical Skill Practice */}
      {isPhysicalSkill && (
        <div className="space-y-4">
          {/* Practice Progress */}
          {isActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center space-y-2">
                <div className="text-sm text-blue-600">Current Progress</div>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{currentRep}</div>
                    <div className="text-xs text-blue-600">Reps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{currentSet}</div>
                    <div className="text-xs text-blue-600">Sets</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  Target: {reps} reps × {sets} sets
                </div>
              </div>
            </div>
          )}

          {/* Practice Controls */}
          {!isActive ? (
            <button
              onClick={startPractice}
              className="w-full btn-gray-primary flex items-center justify-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Start Practice</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={completeRep}
                disabled={currentRep >= reps}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Complete Rep ({currentRep}/{reps})
              </button>
              {currentRep >= reps && currentSet < sets && (
                <button
                  onClick={completeSet}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Complete Set ({currentSet + 1}/{sets})
                </button>
              )}
              {currentSet >= sets && (
                <button
                  onClick={finishPractice}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Finish Practice
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Code Challenge Practice */}
      {isCodeChallenge && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">Code Challenge</h6>
            <p className="text-sm text-gray-600 mb-3">
              Complete the coding challenge below. You can use any programming language.
            </p>
            <textarea
              {...register("codeSolution")}
              placeholder="Write your code solution here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("challengeCompleted")}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">I completed this challenge</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Practice Completion Form */}
      {(!isActive || endTime) && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete Practice</span>
          </button>
        </form>
      )}
    </div>
  );
}
