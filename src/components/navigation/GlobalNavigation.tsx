"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Settings, ChevronDown, User, Search, Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { use_progress } from "@/contexts/ProgressContext";
import { generateAllSkillSummaries, getTimeSinceLastActivity } from "@/lib/utils/skill-management";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function GlobalNavigation() {
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { get_active_skills, get_practice_sessions } = use_progress();

  // Get real skill data from context
  const activeSkillsData = get_active_skills();
  const practiceSessions = get_practice_sessions();
  const skillSummaries = generateAllSkillSummaries(activeSkillsData, practiceSessions);

  // Determine current page type
  const isOnDashboard = pathname === "/";
  const isOnLibrary = pathname === "/library";
  const isOnSkill = pathname?.startsWith("/skill/");
  const isOnDiscover = pathname === "/discover";

  // Get current skill if on skill page
  const getCurrentSkill = () => {
    if (isOnSkill && pathname) {
      const skillId = pathname.split("/")[2];
      return skillSummaries.find(skill => skill.id === skillId);
    }
    return null;
  };

  const currentSkill = getCurrentSkill();

  // Handle scroll-based navigation visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up or at top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsSkillMenuOpen(false);
      setIsMobileMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-transform duration-300 h-20 ${
      isNavVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
                     <Link href="/" className="flex items-center space-x-2">
             <div className="w-8 h-8 primary rounded-lg flex items-center justify-center">
               <span className="text-white font-bold text-sm">SF</span>
             </div>
                         <span className="text-2xl font-bold text-gray-900 hidden sm:block tracking-tight" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
               Skill Forge
             </span>
          </Link>

          {/* Main Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Dashboard Button */}
                         <Button
               className={isOnDashboard ? "btn-primary" : "bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200"}
               size="sm"
               asChild
             >
               <Link href="/">
                 <Home className="h-4 w-4 mr-2" />
                 Dashboard
               </Link>
             </Button>

             {/* Library Button */}
             <Button
               className={isOnLibrary ? "btn-primary" : "bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200"}
               size="sm"
               asChild
             >
               <Link href="/library">
                 <BookOpen className="h-4 w-4 mr-2" />
                 Library
               </Link>
             </Button>

            {/* Current Skill Indicator */}
            {currentSkill && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-900">
                  {currentSkill.name}
                </span>
                <span className="text-xs text-blue-600">
                  {currentSkill.progress}%
                </span>
              </div>
            )}

            {/* Skills Dropdown */}
            {skillSummaries.length > 0 && (
              <div className="relative">
                                 <Button
                   className="bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200 flex items-center space-x-1"
                   size="sm"
                   onClick={(e) => {
                     e.stopPropagation();
                     setIsSkillMenuOpen(!isSkillMenuOpen);
                   }}
                 >
                  <BookOpen className="h-4 w-4" />
                  <span>My Skills</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSkillMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {isSkillMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Active Skills</h3>
                      </div>
                      
                      {skillSummaries.map((skill) => (
                        <Link
                          key={skill.id}
                          href={`/skill/${skill.id}`}
                          className="block px-3 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsSkillMenuOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {skill.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {skill.currentMilestone}
                              </div>
                            </div>
                            <div className="ml-3 flex items-center space-x-2">
                              <div className="text-xs font-medium text-gray-500">
                                {skill.progress}%
                              </div>
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${skill.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link
                          href="/discover"
                          className="block px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={() => setIsSkillMenuOpen(false)}
                        >
                          + Add New Skill
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Discover Button */}
                         <Button
               className={isOnDiscover ? "btn-primary" : "bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200"}
               size="sm"
               asChild
             >
               <Link href="/discover">
                 <Search className="h-4 w-4 mr-2" />
                 Discover
               </Link>
             </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
                         <Button className="bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200 hidden md:flex" size="sm">
               <Bell className="h-4 w-4" />
             </Button>

             {/* Theme Toggle */}
             <ThemeToggle />

             {/* User Menu */}
             <Button className="bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200 hidden md:flex" size="sm">
               <User className="h-4 w-4" />
             </Button>

             {/* Mobile Menu Button */}
             <Button
               className="bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 rounded-lg px-6 py-3 font-medium transition-all duration-200 md:hidden"
               size="sm"
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-2"
            >
              <Link
                href="/"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isOnDashboard ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Dashboard
              </Link>

              <Link
                href="/discover"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isOnDiscover ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Discover Skills
              </Link>

                             {/* Mobile Skills List */}
               {skillSummaries.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    My Skills
                  </div>
                                     {skillSummaries.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/skill/${skill.id}`}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{skill.name}</span>
                        <span className="text-xs text-gray-500">{skill.progress}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile User Actions */}
              <div className="pt-2 border-t border-gray-200">
                <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-4 w-4 inline mr-2" />
                  Notifications
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="h-4 w-4 inline mr-2" />
                  Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
