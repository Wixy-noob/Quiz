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
import { motion, AnimatePresence } from "motion/react";

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

      {/* Main Content Viewport with animated route transitions */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-20">
        <AnimatePresence mode="wait">
          {/* 1. Dashboard & Pusat Materi (Default Landing View) */}
          {activeMode === "dashboard" && (
            <motion.div
              key="view-dashboard"
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <DashboardMateri
                onNavigateWithProfileCheck={handleNavigateWithProfileCheck}
                studentProfile={studentProfile}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
              />
            </motion.div>
          )}

          {/* 2. Quiz Biasa (Standard Quiz with Touch / Keyboard) */}
          {activeMode === "quiz_biasa" && (
            <motion.div
              key="view-quiz-biasa"
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <StandardQuiz
                onNavigate={handleNavigateWithProfileCheck}
                studentProfile={studentProfile}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
              />
            </motion.div>
          )}

          {/* 3. Photo Tourism & Search Grounding with AR Audio */}
          {activeMode === "photo_tourism" && (
            <motion.div
              key="view-photo-tourism"
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="max-w-4xl mx-auto py-2"
            >
              <PhotoTourism hoveredElementId={null} />
            </motion.div>
          )}

          {/* 4. AR Hand-Tracking Quiz */}
          {activeMode === "ar_quiz" && (
            <motion.div
              key="view-ar-quiz"
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="py-2"
            >
              <ARHandTrackingSection
                onNavigate={handleNavigateWithProfileCheck}
                studentProfile={studentProfile}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
