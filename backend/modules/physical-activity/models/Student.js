/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Collection: students
 * ============================================================
 * Stores the student profile used across all Physical Activity
 * Engine operations. Linked to every activity session, skip,
 * reward, and analytics record via `studentId`.
 * ============================================================
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Sub-Schema: Preferences ────────────────────────────────
const PreferencesSchema = new Schema(
  {
    preferredActivityTypes: {
      type: [String],
      enum: ['stretching', 'cardio', 'yoga', 'dance', 'mindfulness', 'breathing', 'strength', 'coordination'],
      default: [],
    },
    disabledActivityTypes: {
      type: [String],
      enum: ['stretching', 'cardio', 'yoga', 'dance', 'mindfulness', 'breathing', 'strength', 'coordination'],
      default: [],
    },
    dailyGoalMinutes: {
      type: Number,
      default: 20,
      min: [5, 'Daily goal cannot be less than 5 minutes'],
      max: [120, 'Daily goal cannot exceed 120 minutes'],
    },
    weeklyGoalSessions: {
      type: Number,
      default: 5,
      min: [1, 'Weekly goal must be at least 1 session'],
      max: [21, 'Weekly goal cannot exceed 21 sessions'],
    },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

// ─── Sub-Schema: Streak ─────────────────────────────────────
const StreakSchema = new Schema(
  {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
  },
  { _id: false }
);

// ─── Sub-Schema: Aggregate Stats ────────────────────────────
const AggregateStatsSchema = new Schema(
  {
    totalSessionsCompleted: { type: Number, default: 0 },
    totalSessionsSkipped:   { type: Number, default: 0 },
    totalMinutesActive:     { type: Number, default: 0 },
    totalStarsEarned:       { type: Number, default: 0 },
    totalBadgesEarned:      { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Main Student Schema ─────────────────────────────────────
const StudentSchema = new Schema(
  {
    // ── Identity ────────────────────────────────────────────
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      unique: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, 'displayName is required'],
      trim: true,
      maxlength: [80, 'Display name cannot exceed 80 characters'],
    },
    avatarUrl: {
      type: String,
      default: null,
    },

    // ── Academic Profile ────────────────────────────────────
    grade: {
      type: String,
      required: [true, 'grade is required'],
      enum: {
        values: ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        message: '`{VALUE}` is not a supported grade level',
      },
      index: true,
    },
    age: {
      type: Number,
      min: [3, 'Age must be at least 3'],
      max: [18, 'Age cannot exceed 18'],
      default: null,
    },

    // ── Active Mood (synced by Mood Analysis Engine) ─────────
    currentMood: {
      type: String,
      enum: ['happy', 'sad', 'excited', 'tired', 'focused', 'anxious', 'calm', 'unknown'],
      default: 'unknown',
    },
    moodUpdatedAt: { type: Date, default: null },

    // ── Preferences & Goals ─────────────────────────────────
    preferences: { type: PreferencesSchema, default: () => ({}) },

    // ── Streak Tracking ─────────────────────────────────────
    streak: { type: StreakSchema, default: () => ({}) },

    // ── Aggregate Stats (denormalised for dashboard speed) ───
    stats: { type: AggregateStatsSchema, default: () => ({}) },

    // ── Earned Badges ────────────────────────────────────────
    badges: { type: [String], default: [] },

    // ── Status ──────────────────────────────────────────────
    isActive: { type: Boolean, default: true, index: true },
    parentId: { type: String, default: null, index: true },
    teacherId: { type: String, default: null, index: true },
  },
  {
    timestamps: true,          // createdAt, updatedAt
    collection: 'students',
  }
);

// ─── Indexes ─────────────────────────────────────────────────
// Compound: used by Teacher Dashboard to list students per grade
StudentSchema.index({ grade: 1, isActive: 1 });
// Compound: used by Parent Dashboard to list children
StudentSchema.index({ parentId: 1, isActive: 1 });
// Text search on displayName
StudentSchema.index({ displayName: 'text' });

// ─── Model ───────────────────────────────────────────────────
export const StudentModel = mongoose.model('Student', StudentSchema);
export default StudentModel;
