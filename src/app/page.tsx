"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Target, Zap, Users, TrendingUp, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to roadmap generation page with AI preference
      const params = new URLSearchParams();
      if (aiEnabled) {
        params.set('ai', 'true');
      }
      window.location.href = `/roadmap/${encodeURIComponent(searchQuery.trim())}?${params.toString()}`;
    }
  };

  const features = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Structured Learning Paths",
      description: "Get personalized roadmaps that break down complex topics into manageable steps.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Curated Resources",
      description: "Access hand-picked videos, articles, and tutorials for each learning milestone.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI-Powered Insights",
      description: "Smart recommendations and study prompts to accelerate your learning journey.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community Learning",
      description: "Connect with others on similar learning paths and share progress.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Progress Tracking",
      description: "Visualize your learning progress with charts and milestone celebrations.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="logo gradient-text">Skill Forge</div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <Button variant="outline" size="sm">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Learn anything,{" "}
            <span className="gradient-text">faster</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-balance">
            Generate personalized learning roadmaps powered by AI. Master any skill with structured paths, curated resources, and smart progress tracking.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What do you want to learn? (e.g., React, Python, Digital Marketing)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-16 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-16 px-8">
                Generate Roadmap
              </Button>
            </div>
          </form>

          {/* AI Safety Toggle */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">AI Credits Protection:</span>
              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  aiEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    aiEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${aiEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
                {aiEnabled ? 'AI Enabled' : 'AI Disabled'}
              </span>
              <Brain className={`h-5 w-5 ${aiEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {aiEnabled 
                ? '⚠️ AI will be used for unique topics (costs credits)'
                : '✅ Using free curated roadmaps only (no cost)'
              }
            </p>
          </div>

          {/* Popular Topics */}
          <div className="flex flex-wrap justify-center gap-3">
            {["React", "Python", "Digital Marketing", "Machine Learning", "UI/UX Design"].map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(topic)}
                className="rounded-full"
              >
                {topic}
              </Button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 80/20 Rule Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The <span className="gradient-text">80/20 Rule</span> of Learning
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
              80% of your results come from 20% of your effort. Focus on the high-impact activities that deliver the most value.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="feature-card bg-white/80 backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Core Fundamentals</h3>
                <p className="text-sm text-muted-foreground">
                  Master the essential 20% of concepts that form the foundation of any skill
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="feature-card bg-white/80 backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Active Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Focus on hands-on application rather than passive consumption
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="feature-card bg-white/80 backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Rapid Iteration</h3>
                <p className="text-sm text-muted-foreground">
                  Build, test, and refine quickly to accelerate your learning curve
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="feature-card bg-white/80 backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Peer Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Learn from others' experiences and get feedback on your progress
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose Skill Forge?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform creates personalized learning experiences that adapt to your goals and pace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="feature-card h-full">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to start your learning journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of learners who are already mastering new skills with Skill Forge.
          </p>
          <Button size="lg" className="text-lg px-8 py-4">
            Get Started for Free
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="logo gradient-text mb-4 md:mb-0">Skill Forge</div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="nav-link">Privacy Policy</a>
              <a href="#" className="nav-link">Terms of Service</a>
              <a href="#" className="nav-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
