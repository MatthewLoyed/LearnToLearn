"use client";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";
import { MainDashboard } from "@/components/dashboard/MainDashboard";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Main Dashboard Content */}
      <MainDashboard />
    </div>
  );
}
