/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Collection: activity_skips
 * ============================================================
 * Dedicated collection for skip events. Stored separately from
 * activity_sessions so skip analytics can be queried in
 * isolation (e.g., "which activities are most skipped?",
 * "skip rate by sourceModule?", "skip reasons breakdown").
 *
 * Every skip document links back to its parent session via
 * `sessionId` and carries `sourceModule` for cross-app tracing.
 * ============================================================
 */

import mongoose from 'mongoose';
import { SOURCE_MODULES } from './Activity.js';

const { Schema } = mongoose;

// ─── Skip Reason Constants ───────────────────────────────────
export const SKIP_REASONS = Object.freeze({
  NOT_INTERESTED:     'NOT_INTERESTED',
  TOO_TIRED:          'TOO_TIRED',
  NO_SPACE_AVAILABLE: 'NO_SPACE_AVAILABLE',
  ALREADY_ACTIVE:     'ALREADY_ACTIVE',
  TECHNICAL_ISSUE:    'TECHNICAL_ISSUE',
  OTHER:              'OTHER',
});

// ─── Activity Skip Schema ─────────────────────────────────────
const ActivitySkipSchema = new Schema(
  {
    // ── Foreign Keys ────────────────────────────────────────
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      index: true,
    },
    activityId: {
      type: String,
      required: [true, 'activityId is required'],
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ActivitySession',
      required: [true, 'sessionId is required — every skip must link to a session'],
      index: true,
    },

    // ── Source Module (REQUIRED — cross-app analytics) ───────
    sourceModule: {
      type: String,
      required: [true, 'sourceModule is required on every skip record'],
      enum: {
        values: Object.values(SOURCE_MODULES),
        message: '`{VALUE}` is not a valid sourceModule',
      },
      index: true,
    },

    // ── Grade at time of skip (denormalised for analytics) ───
    gradeAtSkip: {
      type: String,
      required: [true, 'gradeAtSkip is required'],
      enum: ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    },

    // ── Skip Timing ──────────────────────────────────────────
    skippedAt: {
      type: Date,
      required: [true, 'skippedAt is required'],
      default: Date.now,
      index: true,
    },

    // ── How far through the activity the student was ─────────
    // 0 = skipped before starting, >0 = skipped mid-activity
    secondsBeforeSkip: {
      type: Number,
      default: 0,
      min: [0, 'secondsBeforeSkip cannot be negative'],
    },
    stepsCompletedBeforeSkip: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Skip Reason ──────────────────────────────────────────
    skipReason: {
      type: String,
      required: [true, 'skipReason is required'],
      enum: {
        values: Object.values(SKIP_REASONS),
        message: '`{VALUE}` is not a valid skip reason',
      },
      index: true,
    },
    skipReasonDetail: {
      type: String,
      default: null,
      maxlength: [500, 'Skip reason detail cannot exceed 500 characters'],
      trim: true,
    },

    // ── Who initiated the skip ───────────────────────────────
    skippedBy: {
      type: String,
      required: true,
      enum: {
        values: ['STUDENT', 'TEACHER', 'PARENT', 'AI_TUTOR', 'SYSTEM'],
        message: '`{VALUE}` is not a valid skippedBy value',
      },
      default: 'STUDENT',
    },

    // ── Mood at time of skip ─────────────────────────────────
    moodAtSkip: {
      type: String,
      enum: ['happy', 'sad', 'excited', 'tired', 'focused', 'anxious', 'calm', 'unknown'],
      default: 'unknown',
    },

    // ── Follow-up ────────────────────────────────────────────
    // Was an alternative activity suggested after the skip?
    alternativeSuggested:  { type: Boolean, default: false },
    alternativeActivityId: { type: String, default: null },

    // ── Audit ───────────────────────────────────────────────
    isReviewed: { type: Boolean, default: false },  // teacher/parent reviewed flag
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'activity_skips',
  }
);

// ─── Indexes ─────────────────────────────────────────────────

// Student skip history (most recent first)
ActivitySkipSchema.index({ studentId: 1, skippedAt: -1 });

// Analytics: skip rate per activity across all students
ActivitySkipSchema.index({ activityId: 1, skippedAt: -1 });

// Cross-app: which sourceModule generates the most skips?
ActivitySkipSchema.index({ sourceModule: 1, skipReason: 1, skippedAt: -1 });

// Skip reason breakdown (global analytics)
ActivitySkipSchema.index({ skipReason: 1, gradeAtSkip: 1 });

// Teacher review queue
ActivitySkipSchema.index({ isReviewed: 1, skippedAt: -1 });

// Compound: skip pattern per student per module
ActivitySkipSchema.index({ studentId: 1, sourceModule: 1, skipReason: 1 });

// ─── Virtual: Skipped After Start ───────────────────────────
ActivitySkipSchema.virtual('skippedAfterStart').get(function () {
  return this.secondsBeforeSkip > 0;
});

// ─── Model ───────────────────────────────────────────────────
export const ActivitySkipModel = mongoose.model('ActivitySkip', ActivitySkipSchema);
export default ActivitySkipModel;
