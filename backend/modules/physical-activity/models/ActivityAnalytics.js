/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Collection: activity_analytics
 * ============================================================
 * Pre-aggregated analytics snapshots. Updated by a background
 * job (or via real-time increments) after each session event.
 *
 * Granularity: ONE document per (studentId × sourceModule × date).
 * This enables O(1) reads for dashboards without running
 * expensive MongoDB aggregations on raw session data.
 *
 * For historical trends, query multiple date documents for the
 * same studentId/sourceModule and sum/average the fields.
 *
 * Cross-app analytics pattern:
 *   analytics.aggregate([
 *     { $match: { sourceModule: 'MATH_APP', date: { $gte: weekStart } } },
 *     { $group: { _id: '$gradeLevel', totalMinutes: { $sum: '$totalMinutesActive' } } }
 *   ])
 * ============================================================
 */

import mongoose from 'mongoose';
import { SOURCE_MODULES } from './Activity.js';

const { Schema } = mongoose;

// ─── Sub-Schema: Activity Category Breakdown ─────────────────
const CategoryBreakdownSchema = new Schema(
  {
    category:           { type: String, required: true },
    sessionsCompleted:  { type: Number, default: 0 },
    sessionsSkipped:    { type: Number, default: 0 },
    totalMinutes:       { type: Number, default: 0 },
    avgCompletionPct:   { type: Number, default: 0 },
    starsEarned:        { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Sub-Schema: Skip Reason Tally ──────────────────────────
const SkipReasonTallySchema = new Schema(
  {
    reason: { type: String, required: true },
    count:  { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Sub-Schema: Mood Impact ─────────────────────────────────
const MoodImpactSchema = new Schema(
  {
    // Average mood change: positive = activity improved mood
    avgMoodDelta:     { type: Number, default: null },
    // Sessions that recorded mood before + after
    moodTrackedCount: { type: Number, default: 0 },
    // Most common mood before starting
    mostCommonMoodBefore: { type: String, default: null },
    // Most common mood after completing
    mostCommonMoodAfter:  { type: String, default: null },
  },
  { _id: false }
);

// ─── Sub-Schema: Top Activity ───────────────────────────────
const TopActivitySchema = new Schema(
  {
    activityId:   { type: String, required: true },
    title:        { type: String, default: null },
    sessionCount: { type: Number, default: 0 },
    avgRating:    { type: Number, default: null },
  },
  { _id: false }
);

// ─── Main Activity Analytics Schema ──────────────────────────
const ActivityAnalyticsSchema = new Schema(
  {
    // ── Dimensions (the "group by" keys) ────────────────────
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      index: true,
    },

    // Source Module (REQUIRED — cross-app analytics primary key) ─
    sourceModule: {
      type: String,
      required: [true, 'sourceModule is required — it is the cross-app analytics dimension'],
      enum: {
        values: Object.values(SOURCE_MODULES),
        message: '`{VALUE}` is not a valid sourceModule',
      },
      index: true,
    },

    gradeLevel: {
      type: String,
      required: [true, 'gradeLevel is required'],
      enum: ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
      index: true,
    },

    // ── Time Dimension ───────────────────────────────────────
    // Date string YYYY-MM-DD for daily granularity
    date: {
      type: String,
      required: [true, 'date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'],
      index: true,
    },
    week: {
      type: String,
      default: null,  // ISO week: YYYY-Www  e.g. 2026-W24
      index: true,
    },
    month: {
      type: String,
      default: null,  // YYYY-MM
      index: true,
    },
    year: {
      type: Number,
      default: null,
    },

    // ── Session Counts ───────────────────────────────────────
    sessionsAssigned:   { type: Number, default: 0, min: 0 },
    sessionsStarted:    { type: Number, default: 0, min: 0 },
    sessionsCompleted:  { type: Number, default: 0, min: 0 },
    sessionsSkipped:    { type: Number, default: 0, min: 0 },
    sessionsExpired:    { type: Number, default: 0, min: 0 },

    // ── Completion Rate ──────────────────────────────────────
    // Computed: sessionsCompleted / sessionsAssigned (0.0–1.0)
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    skipRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    // ── Duration ─────────────────────────────────────────────
    totalMinutesActive:     { type: Number, default: 0, min: 0 },
    avgSessionMinutes:      { type: Number, default: 0, min: 0 },
    longestSessionMinutes:  { type: Number, default: 0, min: 0 },

    // ── Completion Quality ───────────────────────────────────
    avgCompletionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    perfectCompletions:      { type: Number, default: 0, min: 0 },  // 100% sessions

    // ── Rewards ──────────────────────────────────────────────
    totalStarsEarned:    { type: Number, default: 0, min: 0 },
    totalBadgesEarned:   { type: Number, default: 0, min: 0 },
    totalEnergyPoints:   { type: Number, default: 0, min: 0 },

    // ── Student Engagement ───────────────────────────────────
    avgFeedbackRating:   { type: Number, default: null, min: 1, max: 5 },
    streakOnDate:        { type: Number, default: 0, min: 0 },
    dailyGoalMet:        { type: Boolean, default: false },

    // ── Category Breakdown ───────────────────────────────────
    categoryBreakdown: {
      type: [CategoryBreakdownSchema],
      default: [],
    },

    // ── Skip Reason Tally ─────────────────────────────────────
    skipReasonTally: {
      type: [SkipReasonTallySchema],
      default: [],
    },

    // ── Mood Impact ──────────────────────────────────────────
    moodImpact: { type: MoodImpactSchema, default: null },

    // ── Top Activities ────────────────────────────────────────
    topActivities: {
      type: [TopActivitySchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'topActivities can hold at most 10 entries',
      },
    },

    // ── Computation Metadata ─────────────────────────────────
    // Tracks when this snapshot was last recomputed
    lastComputedAt: { type: Date, default: Date.now },
    computedFromSessions: { type: Number, default: 0 },  // source session count
    snapshotVersion: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    collection: 'activity_analytics',
  }
);

// ─── Compound Unique Index ────────────────────────────────────
// One document per student × sourceModule × date combination
ActivityAnalyticsSchema.index(
  { studentId: 1, sourceModule: 1, date: 1 },
  { unique: true, name: 'unique_student_module_date' }
);

// ─── Query Indexes ────────────────────────────────────────────

// Parent Dashboard: student history across modules
ActivityAnalyticsSchema.index({ studentId: 1, date: -1 });

// Teacher Dashboard: class analytics by grade + date range
ActivityAnalyticsSchema.index({ gradeLevel: 1, date: -1 });

// Cross-app analytics: module performance over time
ActivityAnalyticsSchema.index({ sourceModule: 1, date: -1 });

// Weekly aggregation queries
ActivityAnalyticsSchema.index({ studentId: 1, week: 1 });

// Monthly aggregation queries
ActivityAnalyticsSchema.index({ studentId: 1, month: 1 });

// Global cross-app trends: module + grade + week
ActivityAnalyticsSchema.index({ sourceModule: 1, gradeLevel: 1, week: 1 });

// Top performers: high completion rate, sorted
ActivityAnalyticsSchema.index({ completionRate: -1, date: -1 });

// Daily goal tracking
ActivityAnalyticsSchema.index({ studentId: 1, dailyGoalMet: 1, date: -1 });

// ─── Pre-save Hook: Auto-compute rates and date fields ───────
ActivityAnalyticsSchema.pre('save', function (next) {
  // Completion rate
  if (this.sessionsAssigned > 0) {
    this.completionRate = parseFloat(
      (this.sessionsCompleted / this.sessionsAssigned).toFixed(4)
    );
    this.skipRate = parseFloat(
      (this.sessionsSkipped / this.sessionsAssigned).toFixed(4)
    );
  }

  // Derive week (ISO) and month from date string
  if (this.date) {
    const d = new Date(this.date);
    this.year = d.getFullYear();
    this.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // ISO week number
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    this.week = `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  this.lastComputedAt = new Date();
  next();
});

// ─── Static: Upsert helper ───────────────────────────────────
// Usage: ActivityAnalyticsModel.upsertForDate(studentId, sourceModule, date, delta)
ActivityAnalyticsSchema.statics.upsertForDate = function (
  studentId,
  sourceModule,
  gradeLevel,
  date,
  delta = {}
) {
  return this.findOneAndUpdate(
    { studentId, sourceModule, date },
    {
      $setOnInsert: { studentId, sourceModule, gradeLevel, date },
      $inc: delta,
      $set: { lastComputedAt: new Date() },
    },
    { upsert: true, new: true, runValidators: true }
  );
};

// ─── Model ───────────────────────────────────────────────────
export const ActivityAnalyticsModel = mongoose.model('ActivityAnalytics', ActivityAnalyticsSchema);
export default ActivityAnalyticsModel;
