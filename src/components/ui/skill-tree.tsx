"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { CheckCircle, Circle, Lock, Play, BookOpen, Target, ZoomIn, ZoomOut, RotateCcw, Sparkles, Clock, Trophy, Activity } from "lucide-react";

interface SkillNode {
  id: string;
  title: string;
  description: string;
  status: "locked" | "available" | "in-progress" | "completed";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  dependencies: string[];
  type: "foundation" | "skill" | "project" | "milestone";
  resources?: {
    videos: number;
    articles: number;
    practice: number;
  };
  // New progress-related properties
  progress?: {
    completed: boolean;
    timeSpent?: number; // in minutes
    practiceSessions?: number;
    lastActivity?: string;
    difficultyRating?: number; // 1-5 scale
  };
  // Skill deconstruction specific properties
  levelNumber?: number;
  doThisNow?: {
    prompt: string;
    reps?: number;
    sets?: number;
    activityType: string;
  };
}

interface SkillTreeProps {
  nodes: SkillNode[];
  onNodeClick: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string) => void;
  className?: string;
  showControls?: boolean;
  // New props for progress visualization
  showProgress?: boolean;
  currentSkillDeconstructionId?: string;
}

export function SkillTree({ 
  nodes, 
  onNodeClick, 
  onNodeComplete, 
  className = "", 
  showControls = true,
  showProgress = true,
  currentSkillDeconstructionId
}: SkillTreeProps) {
  // Debug logging
  console.log('🎯 SkillTree received nodes:', nodes);
  console.log('🎯 SkillTree nodes length:', nodes?.length);
  console.log('🎯 SkillTree showProgress:', showProgress);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate node positions in a tree layout
  const calculateNodePositions = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const levels: Record<number, SkillNode[]> = {};
    
    // Group nodes by level (based on dependencies or levelNumber for skill deconstruction)
    nodes.forEach(node => {
      const level = node.levelNumber || node.dependencies.length;
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    });

    // Position nodes
    Object.keys(levels).forEach(levelStr => {
      const level = parseInt(levelStr);
      const levelNodes = levels[level];
      const spacing = 200;
      const startX = -(levelNodes.length - 1) * spacing / 2;
      
      levelNodes.forEach((node, index) => {
        positions[node.id] = {
          x: startX + index * spacing,
          y: level * 120
        };
      });
    });

    return positions;
  };

  const nodePositions = calculateNodePositions();

  // Enhanced zoom and pan controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePan = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isDragging) return;
    setPosition(prev => ({
      x: prev.x + info.delta.x,
      y: prev.y + info.delta.y
    }));
  }, [isDragging]);

  // Enhanced node unlocking animation
  const handleNodeUnlock = useCallback((nodeId: string) => {
    setRecentlyUnlocked(prev => [...prev, nodeId]);
    setTimeout(() => {
      setRecentlyUnlocked(prev => prev.filter(id => id !== nodeId));
    }, 2000);
    
    if (onNodeComplete) {
      onNodeComplete(nodeId);
    }
  }, [onNodeComplete]);

  const getNodeIcon = (node: SkillNode) => {
    switch (node.type) {
      case "foundation":
        return <Target className="h-5 w-5" />;
      case "skill":
        return <BookOpen className="h-5 w-5" />;
      case "project":
        return <Play className="h-5 w-5" />;
      case "milestone":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  const getNodeStatusIcon = (status: SkillNode["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "locked":
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  // New: Get progress indicator for skill deconstruction nodes
  const getProgressIndicator = (node: SkillNode) => {
    if (!showProgress || !node.progress) return null;

    if (node.progress.completed) {
      return (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle className="h-3 w-3 text-white" />
        </div>
      );
    }

    if (node.progress.practiceSessions && node.progress.practiceSessions > 0) {
      return (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <Activity className="h-3 w-3 text-white" />
        </div>
      );
    }

    return null;
  };

  // New: Get practice session badge
  const getPracticeSessionBadge = (node: SkillNode) => {
    if (!showProgress || !node.progress?.practiceSessions) return null;

    return (
      <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
        {node.progress.practiceSessions}
      </div>
    );
  };

  // New: Get time spent indicator
  const getTimeSpentIndicator = (node: SkillNode) => {
    if (!showProgress || !node.progress?.timeSpent) return null;

    const hours = Math.floor(node.progress.timeSpent / 60);
    const minutes = node.progress.timeSpent % 60;
    const timeText = hours > 0 ? `${hours}h${minutes}m` : `${minutes}m`;

    return (
      <div className="absolute -bottom-1 -left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm flex items-center space-x-1">
        <Clock className="h-2 w-2" />
        <span>{timeText}</span>
      </div>
    );
  };

  // New: Get current position indicator
  const getCurrentPositionIndicator = (node: SkillNode) => {
    if (node.status !== "in-progress") return null;

    return (
      <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    );
  };

  // New: Get milestone level indicator
  const getMilestoneLevelIndicator = (node: SkillNode) => {
    if (!node.levelNumber) return null;

    return (
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center shadow-sm font-bold">
        {node.levelNumber}
      </div>
    );
  };

  const getNodeStyles = (node: SkillNode) => {
    const baseStyles = "relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 cursor-pointer";
    const isRecentlyUnlocked = recentlyUnlocked.includes(node.id);
    const isCurrentPosition = node.status === "in-progress";
    
    // Enhanced styles for progress visualization with current position highlighting
    if (showProgress && node.progress?.completed) {
      return `${baseStyles} bg-green-50 border-green-400 text-green-700 shadow-lg hover:shadow-xl hover:scale-105 ${
        isRecentlyUnlocked ? 'animate-bounce ring-4 ring-green-400 ring-opacity-50' : ''
      }`;
    }
    
    if (showProgress && node.progress?.practiceSessions && node.progress.practiceSessions > 0) {
      return `${baseStyles} bg-blue-50 border-blue-400 text-blue-700 shadow-md hover:shadow-lg hover:scale-105`;
    }
    
    switch (node.status) {
      case "completed":
        return `${baseStyles} bg-green-50 border-green-300 text-green-700 shadow-lg hover:shadow-xl hover:scale-105 ${
          isRecentlyUnlocked ? 'animate-bounce ring-4 ring-green-400 ring-opacity-50' : ''
        }`;
      case "in-progress":
        return `${baseStyles} bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 text-blue-700 shadow-lg hover:shadow-xl hover:scale-105 ${
          isCurrentPosition ? 'ring-4 ring-blue-400 ring-opacity-50 animate-pulse' : ''
        }`;
      case "available":
        return `${baseStyles} bg-white border-gray-300 text-gray-700 shadow-sm hover:shadow-md hover:scale-105 hover:border-blue-400 ${
          isRecentlyUnlocked ? 'animate-pulse ring-2 ring-blue-400 ring-opacity-50' : ''
        }`;
      case "locked":
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed`;
      default:
        return baseStyles;
    }
  };

  const getConnectionStyles = (prereqNode: SkillNode, dependentNode: SkillNode) => {
    const prereqPos = nodePositions[prereqNode.id];
    const dependentPos = nodePositions[dependentNode.id];
    
    if (!prereqPos || !dependentPos) return "";
    
    const isActive = prereqNode.status === "completed" && dependentNode.status !== "locked";
    const isHighlighted = hoveredNode === prereqNode.id || hoveredNode === dependentNode.id;
    
    return `absolute top-0 left-0 w-full h-full pointer-events-none ${
      isActive ? "stroke-blue-400" : "stroke-gray-300"
    } ${isHighlighted ? "stroke-2" : "stroke-1"} transition-all duration-300`;
  };

  return (
    <div className={`relative w-full h-96 overflow-hidden ${className}`} ref={containerRef}>
      {/* Enhanced Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex space-x-2">
          <motion.button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </motion.button>
          <motion.button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </motion.button>
          <motion.button
            onClick={handleReset}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </motion.button>
        </div>
      )}

      {/* Progress Legend */}
      {showProgress && (
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Progress Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Practice Sessions</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced SVG Container with zoom and pan */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          scale,
          x: position.x,
          y: position.y,
        }}
        drag={isDragging}
        dragConstraints={containerRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onPan={handlePan}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
                className="text-gray-300"
              />
            </marker>
          </defs>
          
          {/* Draw connections - arrows point FROM prerequisites TO dependent nodes */}
          {nodes.map(dependentNode => 
            dependentNode.dependencies.map(prereqId => {
              const prereqNode = nodes.find(n => n.id === prereqId);
              if (!prereqNode) return null;
              
              const prereqPos = nodePositions[prereqNode.id];
              const dependentPos = nodePositions[dependentNode.id];
              
              if (!prereqPos || !dependentPos) return null;
              
              const isActive = prereqNode.status === "completed" && dependentNode.status !== "locked";
              
              // Convert node positions to SVG coordinates
              const svgX1 = 400 + prereqPos.x + 32; // Center at 400, add node radius
              const svgY1 = 100 + prereqPos.y + 32; // Start at 100, add node radius
              const svgX2 = 400 + dependentPos.x + 32;
              const svgY2 = 100 + dependentPos.y + 32;
              
              return (
                <line
                  key={`${prereqNode.id}-${dependentNode.id}`}
                  x1={svgX1}
                  y1={svgY1}
                  x2={svgX2}
                  y2={svgY2}
                  className={`${getConnectionStyles(prereqNode, dependentNode)}`}
                  markerEnd="url(#arrowhead)"
                  strokeDasharray={isActive ? "none" : "5,5"}
                  strokeWidth="2"
                />
              );
            })
          )}
        </svg>

        {/* Skill Nodes */}
        <div className="relative z-10">
          {nodes.map((node) => {
            const position = nodePositions[node.id];
            if (!position) return null;

            return (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `${position.y}px`,
                  transform: "translate(-50%, -50%)"
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: (node.levelNumber || node.dependencies.length) * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Node */}
                <motion.div
                  className={getNodeStyles(node)}
                  onClick={() => {
                    // Allow clicking on all nodes to show preview, even locked ones
                    setSelectedNode(selectedNode === node.id ? null : node.id);
                    onNodeClick(node.id);
                    
                    // Only auto-complete if node is available and not locked
                    if (node.status === "available" && onNodeComplete) {
                      handleNodeUnlock(node.id);
                    }
                  }}
                  onHoverStart={() => setHoveredNode(node.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Progress indicator */}
                  {getProgressIndicator(node)}
                  
                  {/* Practice session badge */}
                  {getPracticeSessionBadge(node)}
                  
                  {/* Time spent indicator */}
                  {getTimeSpentIndicator(node)}
                  
                  {/* Current position indicator */}
                  {getCurrentPositionIndicator(node)}
                  
                  {/* Milestone level indicator */}
                  {getMilestoneLevelIndicator(node)}
                  
                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1">
                    {getNodeStatusIcon(node.status)}
                  </div>
                  
                  {/* Main icon */}
                  <div className="flex items-center justify-center">
                    {getNodeIcon(node)}
                  </div>

                  {/* Enhanced: Unlock sparkle effect */}
                  {recentlyUnlocked.includes(node.id) && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                    </motion.div>
                  )}

                  {/* Progress ring for in-progress nodes */}
                  {node.status === "in-progress" && (
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="175.93"
                        strokeDashoffset="87.96"
                        className="text-blue-300"
                      />
                    </svg>
                  )}

                  {/* Slow pulse animation for in-progress nodes */}
                  {node.status === "in-progress" && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>

                {/* Node label */}
                <motion.div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-xs font-medium text-gray-700 max-w-20 truncate">
                    {node.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {node.estimatedTime}
                  </div>
                  {/* Level indicator for skill deconstruction */}
                  {node.levelNumber && (
                    <div className="text-xs text-purple-600 font-medium">
                      Level {node.levelNumber}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Enhanced Node Details Panel with Progress Information */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="absolute bottom-4 left-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;

              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-center justify-center">
                        {getNodeIcon(node)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{node.title}</h3>
                        <p className="text-xs text-gray-500 capitalize">{node.type}</p>
                        {node.levelNumber && (
                          <p className="text-xs text-purple-600 font-medium">Level {node.levelNumber}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{node.description}</p>
                  
                  {/* Progress Information */}
                  {showProgress && node.progress && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-medium text-blue-800 mb-2">Progress</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-600">
                            {node.progress.completed ? "Completed" : "In Progress"}
                          </div>
                          <div className="text-xs text-blue-500">Status</div>
                        </div>
                        {node.progress.timeSpent && (
                          <div className="text-center">
                            <div className="text-sm font-semibold text-blue-600">
                              {Math.floor(node.progress.timeSpent / 60)}h {node.progress.timeSpent % 60}m
                            </div>
                            <div className="text-xs text-blue-500">Time Spent</div>
                          </div>
                        )}
                        {node.progress.practiceSessions && (
                          <div className="text-center">
                            <div className="text-sm font-semibold text-blue-600">
                              {node.progress.practiceSessions}
                            </div>
                            <div className="text-xs text-blue-500">Practice Sessions</div>
                          </div>
                        )}
                        {node.progress.difficultyRating && (
                          <div className="text-center">
                            <div className="text-sm font-semibold text-blue-600">
                              {node.progress.difficultyRating}/5
                            </div>
                            <div className="text-xs text-blue-500">Difficulty</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Do This Now Section */}
                  {node.doThisNow && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs font-medium text-green-800 mb-2 flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        Do This Now
                      </div>
                      <p className="text-xs text-green-700 mb-2">{node.doThisNow.prompt}</p>
                      <div className="flex items-center space-x-4 text-xs text-green-600">
                        <span className="capitalize">{node.doThisNow.activityType.replace('_', ' ')}</span>
                        {node.doThisNow.reps && (
                          <span>{node.doThisNow.reps} reps</span>
                        )}
                        {node.doThisNow.sets && (
                          <span>{node.doThisNow.sets} sets</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className={`text-xs font-medium ${
                        node.status === "completed" ? "text-green-600" :
                        node.status === "in-progress" ? "text-blue-600" :
                        node.status === "available" ? "text-gray-600" :
                        "text-gray-400"
                      }`}>
                        {node.status.replace("-", " ")}
                      </div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className={`text-xs font-medium ${
                        node.difficulty === "beginner" ? "text-green-600" :
                        node.difficulty === "intermediate" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {node.difficulty}
                      </div>
                      <div className="text-xs text-gray-500">Level</div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-700">{node.estimatedTime}</div>
                      <div className="text-xs text-gray-500">Time</div>
                    </div>
                  </div>

                  {/* Compact Resources Section */}
                  {node.resources && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 font-medium mb-2">Resources</div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="text-center p-1 bg-blue-50 rounded">
                          <div className="text-blue-600 font-semibold text-sm">{node.resources.videos}</div>
                          <div className="text-xs text-blue-500">Videos</div>
                        </div>
                        <div className="text-center p-1 bg-green-50 rounded">
                          <div className="text-green-600 font-semibold text-sm">{node.resources.articles}</div>
                          <div className="text-xs text-green-500">Articles</div>
                        </div>
                        <div className="text-center p-1 bg-purple-50 rounded">
                          <div className="text-purple-600 font-semibold text-sm">{node.resources.practice}</div>
                          <div className="text-xs text-purple-500">Practice</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    {/* Go to Milestone Button - Always show for skill deconstruction nodes */}
                    {node.levelNumber && (
                      <motion.button
                        onClick={() => {
                          // This will be handled by the parent component to scroll to milestone section
                          onNodeClick(node.id);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-1.5 px-3 rounded text-xs font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Target className="h-3 w-3" />
                        <span>Go to Milestone</span>
                      </motion.button>
                    )}
                    
                    {/* Original unlock button for non-deconstruction nodes */}
                    {node.status === "available" && onNodeComplete && !node.levelNumber ? (
                      <motion.button
                        onClick={() => handleNodeUnlock(node.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-1.5 px-3 rounded text-xs font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Unlock Skill</span>
                      </motion.button>
                    ) : node.status === "locked" ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 font-medium">Prerequisites Required:</div>
                        {node.dependencies.length > 0 ? (
                          <div className="space-y-1">
                            {node.dependencies.map(depId => {
                              const depNode = nodes.find(n => n.id === depId);
                              return depNode ? (
                                <div key={depId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs">
                                  <div className={`w-2 h-2 rounded-full ${
                                    depNode.status === "completed" ? "bg-green-500" : "bg-gray-300"
                                  }`} />
                                  <span className={`${
                                    depNode.status === "completed" ? "text-green-700" : "text-gray-600"
                                  }`}>
                                    {depNode.title}
                                  </span>
                                  {depNode.status === "completed" && (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic">No prerequisites listed</div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Complete prerequisites to unlock this skill
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
