import { 
  Target, 
  Code, 
  Dumbbell, 
  BookOpen, 
  Play, 
  Activity, 
  Star,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  Brain,
  Heart,
  Music,
  Palette,
  Calculator,
  Globe,
  Camera,
  Car,
  ChefHat,
  Gamepad2,
  Languages,
  Lightbulb,
  Microscope,
  PenTool,
  Plane,
  Scissors,
  Shield,
  Smartphone,
  Wrench
} from "lucide-react";

export interface IconMapping {
  [key: string]: any;
}

// Skill type icons
export const skillTypeIcons: IconMapping = {
  physical: Dumbbell,
  abstract: Brain,
  programming: Code,
  language: Languages,
  art: Palette,
  music: Music,
  cooking: ChefHat,
  gaming: Gamepad2,
  photography: Camera,
  driving: Car,
  flying: Plane,
  crafting: Scissors,
  security: Shield,
  mobile: Smartphone,
  repair: Wrench,
  science: Microscope,
  writing: PenTool,
  math: Calculator,
  geography: Globe,
  creativity: Lightbulb,
  health: Heart,
  default: Target
};

// Practice activity icons
export const practiceActivityIcons: IconMapping = {
  physical: Dumbbell,
  code_challenge: Code,
  reading: BookOpen,
  video: Play,
  quiz: Brain,
  project: Target,
  default: Activity
};

// Milestone status icons
export const milestoneStatusIcons: IconMapping = {
  completed: CheckCircle,
  in_progress: Clock,
  available: Target,
  locked: Shield,
  default: Target
};

// Achievement icons
export const achievementIcons: IconMapping = {
  first_milestone: Trophy,
  practice_streak: Zap,
  perfect_score: Star,
  time_master: Clock,
  default: Trophy
};

export const getSkillTypeIcon = (skillType: string) => {
  return skillTypeIcons[skillType] || skillTypeIcons.default;
};

export const getPracticeActivityIcon = (activityType: string) => {
  return practiceActivityIcons[activityType] || practiceActivityIcons.default;
};

export const getMilestoneStatusIcon = (status: string) => {
  return milestoneStatusIcons[status] || milestoneStatusIcons.default;
};

export const getAchievementIcon = (achievementType: string) => {
  return achievementIcons[achievementType] || achievementIcons.default;
};

// Icon color mapping
export const iconColors = {
  physical: "text-blue-500",
  abstract: "text-purple-500",
  programming: "text-green-500",
  completed: "text-green-500",
  in_progress: "text-blue-500",
  available: "text-gray-500",
  locked: "text-gray-400",
  default: "text-gray-600"
};

export const getIconColor = (type: string) => {
  return iconColors[type] || iconColors.default;
};
