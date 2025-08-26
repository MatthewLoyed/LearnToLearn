"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { CheckCircle, Circle, Lock, Play, BookOpen, Target, ZoomIn, ZoomOut, RotateCcw, Sparkles, Clock, Trophy, Activity } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
  progress?: {
    completed: boolean;
    timeSpent?: number;
    practiceSessions?: number;
    lastActivity?: string;
    difficultyRating?: number;
  };
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
  showProgress?: boolean;
  currentSkillDeconstructionId?: string;
}

interface NodePosition {
  x: number;
  y: number;
}

// ============================================================================
// SKILL TREE CONTROLS COMPONENT
// ============================================================================

interface SkillTreeControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showProgress: boolean;
}

function SkillTreeControls({ onZoomIn, onZoomOut, onReset, showProgress }: SkillTreeControlsProps) {
  return (
    <>
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <motion.button
          onClick={onZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </motion.button>
        <motion.button
          onClick={onZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 text-gray-600" />
        </motion.button>
        <motion.button
          onClick={onReset}
          className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4 text-gray-600" />
        </motion.button>
      </div>

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
    </>
  );
}

// ============================================================================
// SKILL TREE CONNECTIONS COMPONENT
// ============================================================================

interface SkillTreeConnectionsProps {
  nodes: SkillNode[];
  nodePositions: Record<string, NodePosition>;
  hoveredNode: string | null;
}

function SkillTreeConnections({ nodes, nodePositions, hoveredNode }: SkillTreeConnectionsProps) {
  const getConnectionStyles = (prereqNode: SkillNode, dependentNode: SkillNode) => {
    const isActive = prereqNode.status === "completed" && dependentNode.status !== "locked";
    const isHighlighted = hoveredNode === prereqNode.id || hoveredNode === dependentNode.id;
    
    return `absolute top-0 left-0 w-full h-full pointer-events-none ${
      isActive ? "stroke-blue-400" : "stroke-gray-300"
    } ${isHighlighted ? "stroke-2" : "stroke-1"} transition-all duration-300`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
      
      {nodes.map(dependentNode => 
        dependentNode.dependencies.map(prereqId => {
          const prereqNode = nodes.find(n => n.id === prereqId);
          if (!prereqNode) return null;
          
          const prereqPos = nodePositions[prereqNode.id];
          const dependentPos = nodePositions[dependentNode.id];
          
          if (!prereqPos || !dependentPos) return null;
          
          const isActive = prereqNode.status === "completed" && dependentNode.status !== "locked";
          
          const svgX1 = 400 + prereqPos.x + 32;
          const svgY1 = 80 + prereqPos.y + 32;
          const svgX2 = 400 + dependentPos.x + 32;
          const svgY2 = 80 + dependentPos.y + 32;
          
          return (
            <line
              key={`${prereqNode.id}-${dependentNode.id}`}
              x1={svgX1}
              y1={svgY1}
              x2={svgX2}
              y2={svgY2}
              className={getConnectionStyles(prereqNode, dependentNode)}
              markerEnd="url(#arrowhead)"
              strokeDasharray={isActive ? "none" : "5,5"}
              strokeWidth="2"
            />
          );
        })
      )}
    </svg>
  );
}

// ============================================================================
// SKILL NODE COMPONENT
// ============================================================================

interface SkillNodeComponentProps {
  node: SkillNode;
  position: NodePosition;
  isRecentlyUnlocked: boolean;
  showProgress: boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  onNodeUnlock: (nodeId: string) => void;
}

function SkillNodeComponent({ 
  node, 
  position, 
  isRecentlyUnlocked, 
  showProgress, 
  onNodeClick, 
  onNodeHover, 
  onNodeUnlock 
}: SkillNodeComponentProps) {
  const getNodeIcon = (node: SkillNode) => {
    switch (node.type) {
      case "foundation": return <Target className="h-5 w-5" />;
      case "skill": return <BookOpen className="h-5 w-5" />;
      case "project": return <Play className="h-5 w-5" />;
      case "milestone": return <CheckCircle className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
    }
  };

  const getNodeStatusIcon = (status: SkillNode["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress": return <Play className="h-4 w-4 text-blue-500" />;
      case "locked": return <Lock className="h-4 w-4 text-gray-400" />;
      default: return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

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

  const getNodeStyles = (node: SkillNode) => {
    const baseStyles = "relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 cursor-pointer";
    const isCurrentPosition = node.status === "in-progress";
    
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

  const handleClick = () => {
    onNodeClick(node.id);
    
    if (node.status === "available") {
      onNodeUnlock(node.id);
    }
  };

  return (
    <motion.div
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
      <motion.div
        className={getNodeStyles(node)}
        onClick={handleClick}
        onHoverStart={() => onNodeHover(node.id)}
        onHoverEnd={() => onNodeHover(null)}
        whileTap={{ scale: 0.95 }}
      >
        {getProgressIndicator(node)}
        
        <div className="absolute -top-1 -right-1">
          {getNodeStatusIcon(node.status)}
        </div>
        
        <div className="flex items-center justify-center">
          {getNodeIcon(node)}
        </div>

        {isRecentlyUnlocked && (
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
        {node.levelNumber && (
          <div className="text-xs text-purple-600 font-medium">
            Level {node.levelNumber}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// SKILL TREE DETAILS COMPONENT
// ============================================================================

interface SkillTreeDetailsProps {
  selectedNode: SkillNode | null;
  nodes: SkillNode[];
  showProgress: boolean;
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  onNodeUnlock: (nodeId: string) => void;
}

function SkillTreeDetails({ 
  selectedNode, 
  nodes, 
  showProgress, 
  onClose, 
  onNodeClick, 
  onNodeUnlock 
}: SkillTreeDetailsProps) {
  if (!selectedNode) return null;

  const getNodeIcon = (node: SkillNode) => {
    switch (node.type) {
      case "foundation": return <Target className="h-5 w-5" />;
      case "skill": return <BookOpen className="h-5 w-5" />;
      case "project": return <Play className="h-5 w-5" />;
      case "milestone": return <CheckCircle className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      className="absolute bottom-4 left-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-h-80 overflow-y-auto"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-center justify-center">
            {getNodeIcon(selectedNode)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{selectedNode.title}</h3>
            <p className="text-xs text-gray-500 capitalize">{selectedNode.type}</p>
            {selectedNode.levelNumber && (
              <p className="text-xs text-purple-600 font-medium">Level {selectedNode.levelNumber}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
        >
          ×
        </button>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{selectedNode.description}</p>
      
      {showProgress && selectedNode.progress && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-2">Progress</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600">
                {selectedNode.progress.completed ? "Completed" : "In Progress"}
              </div>
              <div className="text-xs text-blue-500">Status</div>
            </div>
            {selectedNode.progress.timeSpent && (
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">
                  {Math.floor(selectedNode.progress.timeSpent / 60)}h {selectedNode.progress.timeSpent % 60}m
                </div>
                <div className="text-xs text-blue-500">Time Spent</div>
              </div>
            )}
            {selectedNode.progress.practiceSessions && (
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">
                  {selectedNode.progress.practiceSessions}
                </div>
                <div className="text-xs text-blue-500">Practice Sessions</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-200 space-y-2">
        {selectedNode.levelNumber && (
          <motion.button
            onClick={() => onNodeClick(selectedNode.id)}
            className="w-full btn-primary py-1.5 px-3 text-xs font-medium flex items-center justify-center space-x-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="h-3 w-3" />
            <span>Go to Milestone</span>
          </motion.button>
        )}
        
        {selectedNode.status === "available" && !selectedNode.levelNumber && (
          <motion.button
            onClick={() => onNodeUnlock(selectedNode.id)}
            className="w-full btn-primary py-1.5 px-3 text-xs font-medium flex items-center justify-center space-x-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="h-3 w-3" />
            <span>Unlock Skill</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN SKILL TREE COMPONENT (CONTAINER OBJECT)
// ============================================================================

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

  // ============================================================================
  // SKILL TREE STATE (ENCAPSULATED)
  // ============================================================================
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // SKILL TREE CALCULATIONS (ENCAPSULATED)
  // ============================================================================
  const calculateNodePositions = () => {
    const positions: Record<string, NodePosition> = {};
    const levels: Record<number, SkillNode[]> = {};
    
    nodes.forEach(node => {
      const level = node.levelNumber || node.dependencies.length;
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    });

    const maxNodesInLevel = Math.max(...Object.values(levels).map(levelNodes => levelNodes.length));
    const spacing = Math.max(150, Math.min(250, 800 / maxNodesInLevel));
    
    Object.keys(levels).forEach(levelStr => {
      const level = parseInt(levelStr);
      const levelNodes = levels[level];
      const startX = -(levelNodes.length - 1) * spacing / 2;
      
      levelNodes.forEach((node, index) => {
        positions[node.id] = {
          x: startX + index * spacing,
          y: level * 140
        };
      });
    });

    return positions;
  };

  const calculateDynamicHeight = () => {
    const levels = Math.max(...nodes.map(node => node.levelNumber || node.dependencies.length)) + 1;
    const baseHeight = 400;
    const heightPerLevel = 160;
    const dynamicHeight = Math.max(baseHeight, levels * heightPerLevel);
    return Math.min(dynamicHeight, 800);
  };

  const nodePositions = calculateNodePositions();
  const dynamicHeight = calculateDynamicHeight();

  // ============================================================================
  // SKILL TREE CONTROLS (ENCAPSULATED)
  // ============================================================================
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

  // ============================================================================
  // SKILL TREE NODE INTERACTIONS (ENCAPSULATED)
  // ============================================================================
  const handleNodeUnlock = useCallback((nodeId: string) => {
    setRecentlyUnlocked(prev => [...prev, nodeId]);
    setTimeout(() => {
      setRecentlyUnlocked(prev => prev.filter(id => id !== nodeId));
    }, 2000);
    
    if (onNodeComplete) {
      onNodeComplete(nodeId);
    }
  }, [onNodeComplete]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    onNodeClick(nodeId);
  }, [selectedNode, onNodeClick]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  const handleDetailsClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ============================================================================
  // SKILL TREE RENDER (MAIN OBJECT)
  // ============================================================================
  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`} 
      style={{ height: `${dynamicHeight}px` }}
      ref={containerRef}
    >
      {/* Controls Component */}
      {showControls && (
        <SkillTreeControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          showProgress={showProgress}
        />
      )}

      {/* Main Tree Container */}
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
        {/* Connections Component */}
        <SkillTreeConnections
          nodes={nodes}
          nodePositions={nodePositions}
          hoveredNode={hoveredNode}
        />

        {/* Nodes Container */}
        <div className="relative z-10">
          {nodes.map((node) => {
            const position = nodePositions[node.id];
            if (!position) return null;

            return (
              <SkillNodeComponent
                key={node.id}
                node={node}
                position={position}
                isRecentlyUnlocked={recentlyUnlocked.includes(node.id)}
                showProgress={showProgress}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onNodeUnlock={handleNodeUnlock}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Details Component */}
      <AnimatePresence>
        {selectedNode && (
          <SkillTreeDetails
            selectedNode={nodes.find(n => n.id === selectedNode) || null}
            nodes={nodes}
            showProgress={showProgress}
            onClose={handleDetailsClose}
            onNodeClick={handleNodeClick}
            onNodeUnlock={handleNodeUnlock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
