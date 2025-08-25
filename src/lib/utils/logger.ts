// ============================================================================
// ORGANIZED LOGGING UTILITY
// ============================================================================
// 
// Provides clean, organized logging with clear categories and visual indicators
// for easier debugging and monitoring of the application.

// ============================================================================
// LOG CATEGORIES & ICONS
// ============================================================================

export enum LogCategory {
  API = 'API',
  ERROR = 'ERROR', 
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARNING = 'WARNING',
  PERFORMANCE = 'PERFORMANCE',
  CONTENT = 'CONTENT'
}

const LOG_ICONS = {
  [LogCategory.API]: '🌐',
  [LogCategory.ERROR]: '❌',
  [LogCategory.SUCCESS]: '✅',
  [LogCategory.INFO]: 'ℹ️',
  [LogCategory.DEBUG]: '🔍',
  [LogCategory.WARNING]: '⚠️',
  [LogCategory.PERFORMANCE]: '⚡',
  [LogCategory.CONTENT]: '📄'
};

const LOG_COLORS = {
  [LogCategory.API]: '#FFD700',      // Gold
  [LogCategory.ERROR]: '#FF4444',    // Red
  [LogCategory.SUCCESS]: '#00C851',  // Green
  [LogCategory.INFO]: '#33B5E5',     // Blue
  [LogCategory.DEBUG]: '#AA66CC',    // Purple
  [LogCategory.WARNING]: '#FF8800',  // Orange
  [LogCategory.PERFORMANCE]: '#FF6B6B', // Coral
  [LogCategory.CONTENT]: '#4CAF50'   // Green
};

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

/**
 * Main logging function with category and styling
 */
export function log(
  category: LogCategory,
  message: string,
  data?: any,
  service?: string
): void {
  const icon = LOG_ICONS[category];
  const color = LOG_COLORS[category];
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const serviceLabel = service ? `[${service}]` : '';
  
  // Create styled log message
  const logMessage = `%c${icon} ${category}${serviceLabel} %c${message}`;
  const styles = [
    `color: ${color}; font-weight: bold; font-size: 12px;`,
    `color: #333; font-size: 12px;`
  ];
  
  console.log(logMessage, ...styles);
  
  // Log data if provided
  if (data !== undefined) {
    console.log('%c  └─ Data:', 'color: #666; font-size: 11px;', data);
  }
}

/**
 * API-specific logging
 */
export function logAPI(service: string, action: string, data?: any): void {
  log(LogCategory.API, `${action}`, data, service);
}

/**
 * Error logging with stack trace
 */
export function logError(service: string, message: string, error?: any): void {
  log(LogCategory.ERROR, message, error, service);
  if (error?.stack) {
    console.log('%c  └─ Stack:', 'color: #FF4444; font-size: 11px;', error.stack);
  }
}

/**
 * Success logging
 */
export function logSuccess(service: string, message: string, data?: any): void {
  log(LogCategory.SUCCESS, message, data, service);
}

/**
 * Performance logging
 */
export function logPerformance(service: string, operation: string, duration: number, data?: any): void {
  const durationText = duration > 1000 ? `${(duration / 1000).toFixed(2)}s` : `${duration}ms`;
  log(LogCategory.PERFORMANCE, `${operation} (${durationText})`, data, service);
}

/**
 * Content logging for videos, articles, images
 */
export function logContent(service: string, type: 'video' | 'article' | 'image', action: string, data?: any): void {
  const icon = type === 'video' ? '📺' : type === 'article' ? '📄' : '🖼️';
  log(LogCategory.CONTENT, `${icon} ${action}`, data, service);
}

/**
 * Warning logging
 */
export function logWarning(service: string, message: string, data?: any): void {
  log(LogCategory.WARNING, message, data, service);
}

/**
 * Info logging
 */
export function logInfo(service: string, message: string, data?: any): void {
  log(LogCategory.INFO, message, data, service);
}

/**
 * Debug logging (only in development)
 */
export function logDebug(service: string, message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    log(LogCategory.DEBUG, message, data, service);
  }
}

// ============================================================================
// SPECIALIZED LOGGING FOR ROADMAP GENERATION
// ============================================================================

/**
 * Roadmap generation progress logging
 */
export function logRoadmapProgress(step: string, data?: any): void {
  log(LogCategory.INFO, `🚀 Roadmap: ${step}`, data, 'Roadmap');
}

/**
 * Content distribution logging
 */
export function logContentDistribution(
  videos: number, 
  articles: number, 
  images: number,
  realVideos: number,
  realArticles: number,
  realImages: number
): void {
  const summary = {
    videos: `${realVideos}/${videos} real`,
    articles: `${realArticles}/${articles} real`, 
    images: `${realImages}/${images} real`
  };
  
  log(LogCategory.CONTENT, '📊 Content Distribution', summary, 'Search');
}

/**
 * API cost logging
 */
export function logAPICost(service: string, cost: string, details?: any): void {
  log(LogCategory.API, `💰 Cost: ${cost}`, details, service);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a performance timer
 */
export function createTimer(service: string, operation: string) {
  const startTime = Date.now();
  
  return {
    end: (data?: any) => {
      const duration = Date.now() - startTime;
      logPerformance(service, operation, duration, data);
      return duration;
    }
  };
}

/**
 * Log a section divider
 */
export function logSection(title: string): void {
  const divider = '─'.repeat(50);
  console.log(`%c${divider} ${title} ${divider}`, 'color: #666; font-size: 11px; font-weight: bold;');
}

/**
 * Log a subsection
 */
export function logSubsection(title: string): void {
  console.log(`%c  📋 ${title}`, 'color: #666; font-size: 11px; font-weight: bold;');
}
