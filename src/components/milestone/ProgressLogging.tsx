"use client";
import { motion } from "framer-motion";
import { Brain, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressLoggingProps {
  progressLog: string;
  onProgressLogChange: (log: string) => void;
}

export function ProgressLogging({ progressLog, onProgressLogChange }: ProgressLoggingProps) {
  const commonChallenges = [
    "I'm having trouble understanding the concept",
    "The practice is more difficult than expected",
    "I need more time to master this technique",
    "I'm making good progress but want to improve",
    "I've completed this successfully and feel confident"
  ];

  const handleChallengeClick = (challenge: string) => {
    if (progressLog.includes(challenge)) {
      // Remove if already present
      onProgressLogChange(progressLog.replace(challenge, '').trim());
    } else {
      // Add to existing log
      const newLog = progressLog ? `${progressLog}\n\n${challenge}` : challenge;
      onProgressLogChange(newLog);
    }
  };

  const isChallengeSelected = (challenge: string) => {
    return progressLog.includes(challenge);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-green-600" />
          <span>Log Your Progress</span>
        </CardTitle>
        <CardDescription>
          Share any challenges or insights from your practice. This helps us provide better guidance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Challenge Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
            Quick Selection
          </h4>
                           <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {commonChallenges.map((challenge, index) => (
              <motion.button
                key={index}
                onClick={() => handleChallengeClick(challenge)}
                                 className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isChallengeSelected(challenge)
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isChallengeSelected(challenge) && (
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                )}
                {challenge}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Log Entry */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
            Custom Notes
          </h4>
          <textarea
            value={progressLog}
            onChange={(e) => onProgressLogChange(e.target.value)}
            placeholder="What challenges did you face? Any insights or breakthroughs? Log your experience here..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-2">
            Your progress log helps us provide personalized recommendations and track your learning journey.
          </p>
        </div>

        {/* Progress Tips */}
        {progressLog && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Progress Tip</h4>
                <p className="text-sm text-blue-700">
                  Great job logging your progress! This information helps us provide better guidance for your next milestone.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
