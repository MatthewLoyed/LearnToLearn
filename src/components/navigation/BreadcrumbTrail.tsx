"use client";

import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbTrailProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbTrail({ items, className = "" }: BreadcrumbTrailProps) {
  const pathname = usePathname();

  // Helper function to preserve AI parameters in URLs
  const preserveAIParams = (url: string) => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return url;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const aiEnabled = urlParams.get('ai') === 'true';
    const maxTokens = urlParams.get('maxTokens') === 'true';
    
    if (aiEnabled || maxTokens) {
      const params = new URLSearchParams();
      if (aiEnabled) params.append('ai', 'true');
      if (maxTokens) params.append('maxTokens', 'true');
      return `${url}?${params.toString()}`;
    }
    return url;
  };

  // Auto-generate breadcrumbs based on pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [];

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/" }
    ];

    if (segments.length === 0) {
      return [{ label: "Dashboard", href: "/", isActive: true }];
    }

    // Handle different route patterns
    if (segments[0] === "skill" && segments[1]) {
      // Decode the skill name
      const skillName = decodeURIComponent(segments[1]);
      breadcrumbs.push({
        label: skillName,
        href: `/skill/${segments[1]}`
      });

      if (segments[2] === "milestone" && segments[3]) {
        // We're on a milestone page
        breadcrumbs.push({
          label: "Milestone", // Will be updated with actual milestone name
          href: `/skill/${segments[1]}/milestone/${segments[3]}`,
          isActive: true
        });
      } else {
        // We're on skill overview
        breadcrumbs[breadcrumbs.length - 1].isActive = true;
      }
    } else if (segments[0] === "discover") {
      breadcrumbs.push({
        label: "Discover Skills",
        href: "/discover",
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs if only one item
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <motion.li
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            
            {item.isActive ? (
              <span className="text-gray-900 font-medium">
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={preserveAIParams(item.href)}
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {item.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
}

// Enhanced breadcrumb with custom milestone name
interface EnhancedBreadcrumbProps {
  skillName?: string;
  milestoneName?: string;
  className?: string;
}

export function EnhancedBreadcrumbTrail({ 
  skillName, 
  milestoneName, 
  className = "" 
}: EnhancedBreadcrumbProps) {
  const pathname = usePathname();

  // Helper function to preserve AI parameters in URLs
  const preserveAIParams = (url: string) => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return url;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const aiEnabled = urlParams.get('ai') === 'true';
    const maxTokens = urlParams.get('maxTokens') === 'true';
    
    if (aiEnabled || maxTokens) {
      const params = new URLSearchParams();
      if (aiEnabled) params.append('ai', 'true');
      if (maxTokens) params.append('maxTokens', 'true');
      return `${url}?${params.toString()}`;
    }
    return url;
  };

  const generateEnhancedBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/" }
    ];

    if (skillName) {
      breadcrumbs.push({
        label: skillName,
        href: `/skill/${encodeURIComponent(skillName)}`
      });

      if (milestoneName) {
        const segments = pathname?.split('/') || [];
        breadcrumbs.push({
          label: milestoneName,
          href: pathname || "",
          isActive: true
        });
      } else {
        breadcrumbs[breadcrumbs.length - 1].isActive = true;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbItems = generateEnhancedBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <motion.li
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            
            {item.isActive ? (
              <span className="text-gray-900 font-medium">
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={preserveAIParams(item.href)}
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {item.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
}
