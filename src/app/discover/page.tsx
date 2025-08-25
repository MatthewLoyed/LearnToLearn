"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Target, Zap, Code, Palette, BarChart3, Globe, Music, Camera, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";
import { BreadcrumbTrail } from "@/components/navigation/BreadcrumbTrail";

import Link from "next/link";

// Types for skill categories
interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  popularity: number;
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data for skill categories
  const skillCategories: SkillCategory[] = [
    {
      id: "programming",
      name: "Programming & Development",
      description: "Learn to code and build software applications",
      icon: <Code className="h-6 w-6" />,
      color: "blue",
      skills: [
        {
          id: "python",
          name: "Python Programming",
          description: "Master Python for web development, data science, and automation",
          difficulty: "beginner",
          estimatedTime: "8-12 weeks",
          popularity: 95
        },
        {
          id: "javascript",
          name: "JavaScript Fundamentals",
          description: "Learn JavaScript for web development and interactive applications",
          difficulty: "beginner",
          estimatedTime: "6-10 weeks",
          popularity: 90
        },
        {
          id: "react",
          name: "React Development",
          description: "Build modern web applications with React",
          difficulty: "intermediate",
          estimatedTime: "8-12 weeks",
          popularity: 85
        },
        {
          id: "nodejs",
          name: "Node.js Backend",
          description: "Create server-side applications with Node.js",
          difficulty: "intermediate",
          estimatedTime: "6-10 weeks",
          popularity: 80
        }
      ]
    },
    {
      id: "design",
      name: "Design & Creative",
      description: "Develop your creative skills and visual design abilities",
      icon: <Palette className="h-6 w-6" />,
      color: "purple",
      skills: [
        {
          id: "ui-ux",
          name: "UI/UX Design",
          description: "Create user-friendly interfaces and experiences",
          difficulty: "beginner",
          estimatedTime: "10-14 weeks",
          popularity: 88
        },
        {
          id: "graphic-design",
          name: "Graphic Design",
          description: "Learn visual design principles and tools",
          difficulty: "beginner",
          estimatedTime: "8-12 weeks",
          popularity: 82
        },
        {
          id: "web-design",
          name: "Web Design",
          description: "Design beautiful and functional websites",
          difficulty: "intermediate",
          estimatedTime: "6-10 weeks",
          popularity: 78
        }
      ]
    },
    {
      id: "business",
      name: "Business & Marketing",
      description: "Develop business acumen and marketing skills",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "green",
      skills: [
        {
          id: "digital-marketing",
          name: "Digital Marketing",
          description: "Learn modern marketing strategies and techniques",
          difficulty: "beginner",
          estimatedTime: "8-12 weeks",
          popularity: 85
        },
        {
          id: "seo",
          name: "SEO Optimization",
          description: "Master search engine optimization for better visibility",
          difficulty: "intermediate",
          estimatedTime: "6-8 weeks",
          popularity: 75
        },
        {
          id: "content-marketing",
          name: "Content Marketing",
          description: "Create compelling content that drives engagement",
          difficulty: "beginner",
          estimatedTime: "6-10 weeks",
          popularity: 72
        }
      ]
    },
    {
      id: "languages",
      name: "Languages & Communication",
      description: "Learn new languages and improve communication skills",
      icon: <Globe className="h-6 w-6" />,
      color: "orange",
      skills: [
        {
          id: "spanish",
          name: "Spanish",
          description: "Learn Spanish for travel, work, and cultural connection",
          difficulty: "beginner",
          estimatedTime: "12-16 weeks",
          popularity: 80
        },
        {
          id: "public-speaking",
          name: "Public Speaking",
          description: "Develop confidence and skills for effective presentations",
          difficulty: "beginner",
          estimatedTime: "6-8 weeks",
          popularity: 85
        }
      ]
    },
    {
      id: "creative",
      name: "Creative Arts",
      description: "Express yourself through various creative mediums",
      icon: <Music className="h-6 w-6" />,
      color: "pink",
      skills: [
        {
          id: "photography",
          name: "Photography",
          description: "Master the art of capturing beautiful moments",
          difficulty: "beginner",
          estimatedTime: "8-12 weeks",
          popularity: 78
        },
        {
          id: "music-production",
          name: "Music Production",
          description: "Create and produce your own music",
          difficulty: "intermediate",
          estimatedTime: "12-16 weeks",
          popularity: 70
        }
      ]
    }
  ];

  // Filter skills based on search and category
  const filteredCategories = skillCategories.filter(category => {
    if (selectedCategory && category.id !== selectedCategory) return false;
    
    if (searchQuery) {
      const hasMatchingSkills = category.skills.some(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return hasMatchingSkills;
    }
    
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'pink': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-6 py-4">
        <BreadcrumbTrail />
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover New Skills
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our curated collection of skills and start your next learning journey
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                className={selectedCategory === null ? "btn-gray-primary" : "btn-gray-outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {skillCategories.map((category) => (
                <Button
                  key={category.id}
                  className={selectedCategory === category.id ? "btn-gray-primary" : "btn-gray-outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + categoryIndex * 0.1 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  {category.icon}
                  <span>{category.name}</span>
                </h2>
                <p className="text-gray-600">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.skills
                  .filter(skill =>
                    !searchQuery ||
                    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    skill.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((skill, skillIndex) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + categoryIndex * 0.1 + skillIndex * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Target className="h-4 w-4" />
                              <span>{skill.popularity}%</span>
                            </div>
                          </div>
                          <CardDescription className="text-sm">
                            {skill.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Difficulty</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty)}`}>
                                {skill.difficulty}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Time to Master</span>
                              <span className="text-sm font-medium">{skill.estimatedTime}</span>
                            </div>

                            <Button className="btn-gray-primary w-full" asChild>
                              <Link href={`/skill/${skill.id}`}>
                                <Plus className="h-4 w-4 mr-2" />
                                Start Learning
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Skills Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse all categories
              </p>
              <Button className="btn-gray-outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                Clear Filters
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
