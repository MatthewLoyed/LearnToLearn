/**
 * Skill Library Service
 * Manages skill persistence and library functionality in localStorage
 */

export interface SkillMetadata {
  id: string;
  name: string;
  topic: string;
  dateCreated: string;
  lastAccessed: string;
  aiEnabled: boolean;
  maxTokensMode: boolean;
  progress: {
    completedMilestones: number;
    totalMilestones: number;
    currentMilestoneId: string | null;
  };
  storageKey: string; // Reference to roadmap data in localStorage
}

export interface SkillLibrary {
  skills: SkillMetadata[];
}

/**
 * Generate a unique skill ID based on topic and timestamp
 */
export function generateSkillId(topic: string, aiEnabled: boolean): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const aiSuffix = aiEnabled ? 'ai' : 'curated';
  const sanitizedTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitizedTopic}-${aiSuffix}-${timestamp}`;
}

/**
 * Get the skill library from localStorage
 */
export function getSkillLibrary(): SkillLibrary {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return { skills: [] };
  }
  
  try {
    const stored = localStorage.getItem('skill-library');
    if (stored) {
      const library = JSON.parse(stored);
      // Validate structure
      if (library && Array.isArray(library.skills)) {
        return library;
      }
    }
  } catch (error) {
    console.error('Error reading skill library from localStorage:', error);
  }
  
  // Return empty library if none exists or invalid
  return { skills: [] };
}

/**
 * Save the skill library to localStorage
 */
export function saveSkillLibrary(library: SkillLibrary): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('skill-library', JSON.stringify(library));
    console.log('💾 Skill library saved to localStorage:', library);
  } catch (error) {
    console.error('Error saving skill library to localStorage:', error);
  }
}

/**
 * Add a new skill to the library
 */
export function addSkillToLibrary(
  topic: string,
  aiEnabled: boolean,
  maxTokensMode: boolean,
  roadmapData: any
): SkillMetadata {
  const library = getSkillLibrary();
  
  // Generate unique ID and storage key
  const skillId = generateSkillId(topic, aiEnabled);
  const storageKey = `roadmap-${topic}-${aiEnabled ? 'ai' : 'curated'}`;
  
  // Create skill metadata
  const skillMetadata: SkillMetadata = {
    id: skillId,
    name: topic,
    topic: topic,
    dateCreated: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    aiEnabled,
    maxTokensMode,
    progress: {
      completedMilestones: 0,
      totalMilestones: roadmapData.milestones?.length || 0,
      currentMilestoneId: roadmapData.milestones?.[0]?.id || null
    },
    storageKey
  };
  
  // Add to library (avoid duplicates)
  const existingIndex = library.skills.findIndex(skill => skill.id === skillId);
  if (existingIndex >= 0) {
    library.skills[existingIndex] = skillMetadata;
  } else {
    library.skills.push(skillMetadata);
  }
  
  saveSkillLibrary(library);
  console.log('📚 Added skill to library:', skillMetadata);
  
  return skillMetadata;
}

/**
 * Update skill progress in the library
 */
export function updateSkillProgress(
  skillId: string,
  progress: Partial<SkillMetadata['progress']>
): void {
  const library = getSkillLibrary();
  const skillIndex = library.skills.findIndex(skill => skill.id === skillId);
  
  if (skillIndex >= 0) {
    library.skills[skillIndex] = {
      ...library.skills[skillIndex],
      lastAccessed: new Date().toISOString(),
      progress: {
        ...library.skills[skillIndex].progress,
        ...progress
      }
    };
    
    saveSkillLibrary(library);
    console.log('📈 Updated skill progress:', skillId, progress);
  }
}

/**
 * Get a skill by ID
 */
export function getSkillById(skillId: string): SkillMetadata | null {
  const library = getSkillLibrary();
  return library.skills.find(skill => skill.id === skillId) || null;
}

/**
 * Get a skill by topic and AI settings
 */
export function getSkillByTopic(
  topic: string,
  aiEnabled: boolean
): SkillMetadata | null {
  const library = getSkillLibrary();
  const skillId = generateSkillId(topic, aiEnabled);
  return library.skills.find(skill => skill.id === skillId) || null;
}

/**
 * Delete a skill from the library and remove its roadmap data
 */
export function deleteSkill(skillId: string): boolean {
  const library = getSkillLibrary();
  const skillIndex = library.skills.findIndex(skill => skill.id === skillId);
  
  if (skillIndex >= 0) {
    const skill = library.skills[skillIndex];
    
    // Remove roadmap data from localStorage
    try {
      localStorage.removeItem(skill.storageKey);
      console.log('🗑️ Removed roadmap data:', skill.storageKey);
    } catch (error) {
      console.error('Error removing roadmap data:', error);
    }
    
    // Remove from library
    library.skills.splice(skillIndex, 1);
    saveSkillLibrary(library);
    
    console.log('🗑️ Deleted skill from library:', skillId);
    return true;
  }
  
  return false;
}

/**
 * Get all skills sorted by last accessed (most recent first)
 */
export function getAllSkills(): SkillMetadata[] {
  const library = getSkillLibrary();
  return library.skills.sort((a, b) => 
    new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  );
}

/**
 * Search skills by name/topic
 */
export function searchSkills(query: string): SkillMetadata[] {
  const allSkills = getAllSkills();
  const lowerQuery = query.toLowerCase();
  
  return allSkills.filter(skill => 
    skill.name.toLowerCase().includes(lowerQuery) ||
    skill.topic.toLowerCase().includes(lowerQuery)
  );
}
