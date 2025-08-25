// Font utilities for AI-driven customization
// Applied Rules: Context First, Clean Code

/**
 * Loads a Google Font dynamically
 * @param fontName - The name of the Google Font to load
 */
export function loadGoogleFont(fontName: string): void {
  // Check if font is already loaded
  if (document.querySelector(`link[href*="${fontName}"]`)) {
    return;
  }

  // Create link element for Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  
  // Add to head
  document.head.appendChild(link);
  
  console.log(`Loaded Google Font: ${fontName}`);
}

/**
 * Applies topic-specific customization to the document
 * @param customization - The customization data from AI
 */
export function applyTopicCustomization(customization: {
  category: string;
  font: string;
  icon: string;
  accentColor: string;
  background: string;
}): void {
  // Load the Google Font
  loadGoogleFont(customization.font);
  
  // Apply CSS variables to document root
  const root = document.documentElement;
  
  // Set font family
  root.style.setProperty('--topic-font', `"${customization.font}", sans-serif`);
  
  // Set accent color (convert Tailwind class to CSS custom property)
  const accentColorValue = getTailwindColorValue(customization.accentColor);
  root.style.setProperty('--topic-accent', accentColorValue);
  
  // Set icon name for use in components
  root.style.setProperty('--topic-icon', customization.icon);
  
  // Set background pattern
  root.style.setProperty('--topic-background', customization.background);
  
  console.log('Applied topic customization:', customization);
}

/**
 * Converts Tailwind color classes to CSS color values
 * @param tailwindClass - The Tailwind color class (e.g., 'blue-600')
 * @returns CSS color value
 */
function getTailwindColorValue(tailwindClass: string): string {
  const colorMap: Record<string, string> = {
    // Blue family
    'blue-600': 'hsl(217, 91%, 60%)',
    'blue-700': 'hsl(217, 91%, 50%)',
    'blue-800': 'hsl(217, 91%, 40%)',
    'indigo-600': 'hsl(238, 83%, 67%)',
    'indigo-700': 'hsl(238, 83%, 57%)',
    
    // Purple family
    'purple-600': 'hsl(262, 83%, 58%)',
    'purple-700': 'hsl(262, 83%, 48%)',
    'violet-600': 'hsl(271, 81%, 56%)',
    'violet-700': 'hsl(271, 81%, 46%)',
    
    // Green family
    'emerald-600': 'hsl(160, 84%, 39%)',
    'emerald-700': 'hsl(160, 84%, 29%)',
    'teal-600': 'hsl(173, 80%, 36%)',
    'teal-700': 'hsl(173, 80%, 26%)',
    
    // Red family
    'red-600': 'hsl(0, 84%, 60%)',
    'red-700': 'hsl(0, 84%, 50%)',
    'rose-600': 'hsl(346, 77%, 50%)',
    'rose-700': 'hsl(346, 77%, 40%)',
    
    // Gray family
    'gray-600': 'hsl(220, 9%, 46%)',
    'gray-700': 'hsl(220, 9%, 36%)',
    'slate-600': 'hsl(215, 16%, 47%)',
    'slate-700': 'hsl(215, 16%, 37%)'
  };
  
  return colorMap[tailwindClass] || 'hsl(217, 91%, 60%)'; // Default to blue-600
}

/**
 * Resets customization to default values
 */
export function resetTopicCustomization(): void {
  const root = document.documentElement;
  
  root.style.removeProperty('--topic-font');
  root.style.removeProperty('--topic-accent');
  root.style.removeProperty('--topic-icon');
  root.style.removeProperty('--topic-background');
  
  console.log('Reset topic customization to defaults');
}

