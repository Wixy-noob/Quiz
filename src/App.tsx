/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ActiveAppMode, StudentProfile } from "./types";
import { HeaderNav } from "./components/HeaderNav";
import { DashboardMateri } from "./components/DashboardMateri";
import { StandardQuiz } from "./components/StandardQuiz";
import { PhotoTourism } from "./components/PhotoTourism";
import { ARHandTrackingSection } from "./components/ARHandTrackingSection";
import { StudentProfileModal } from "./components/StudentProfileModal";

export default function App() {
  const [activeMode, setActiveMode] = useState<ActiveAppMode>("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<ActiveAppMode | null>(null);

  // Student Profile state persisted in localStorage
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem("madjuka_student_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveStudentProfile = (profile: StudentProfile) => {
    setStudentProfile(profile);
    try {
      localStorage.setItem("madjuka_student_profile", JSON.stringify(profile));
    } catch (e) {
      console.warn("Unable to save student profile in localStorage", e);
    }
    setIsProfileModalOpen(false);
    if (pendingMode) {
      setActiveMode(pendingMode);
      setPendingMode(null);
    }
  };

  // Intercept navigation to quizzes if profile is missing
  const handleNavigateWithProfileCheck = (mode: ActiveAppMode) => {
    if ((mode === "quiz_biasa" || mode === "ar_quiz") && !studentProfile) {
      setPendingMode(mode);
      setIsProfileModalOpen(true);
    } else {
      setActiveMode(mode);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-slate-950 overflow-x-hidden overflow-y-auto">
      {/* Top Header Navigation */}
      <HeaderNav
        activeMode={activeMode}
        onSelectMode={handleNavigateWithProfileCheck}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-20">
        {/* 1. Dashboard & Pusat Materi (Default Landing View) */}
        {activeMode === "dashboard" && (
          <DashboardMateri
            onNavigateWithProfileCheck={handleNavigateWithProfileCheck}
            studentProfile={studentProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* 2. Quiz Biasa (Standard Quiz with Touch / Keyboard) */}
        {activeMode === "quiz_biasa" && (
          <StandardQuiz
            onNavigate={handleNavigateWithProfileCheck}
            studentProfile={studentProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* 3. Photo Tourism & Search Grounding with AR Audio */}
        {activeMode === "photo_tourism" && (
          <div className="max-w-4xl mx-auto py-2">
            <PhotoTourism hoveredElementId={null} />
          </div>
        )}

        {/* 4. AR Hand-Tracking Quiz */}
        {activeMode === "ar_quiz" && (
          <div className="py-2">
            <ARHandTrackingSection
              onNavigate={handleNavigateWithProfileCheck}
              studentProfile={studentProfile}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Student Profile Registration Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        currentProfile={studentProfile}
        onSave={saveStudentProfile}
        onClose={studentProfile ? () => setIsProfileModalOpen(false) : undefined}
        targetModeName={
          pendingMode === "ar_quiz"
            ? "Quiz AR Hand-Tracking"
            : pendingMode === "quiz_biasa"
            ? "Quiz Standar"
            : "Latihan Madjuka Tensis"
        }
      />
    </div>
  );
}
