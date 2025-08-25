"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  description,
  icon,
  className,
}: ToggleProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <div className="flex items-center space-x-2">
        {icon && <span className="text-gray-600">{icon}</span>}
        <div>
          {label && (
            <label className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => onCheckedChange(!checked)}>
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
