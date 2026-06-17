/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Collection: activity_sessions
 * ============================================================
 * Records the FULL LIFECYCLE of one student ↔ activity
 * interaction: assigned → started → completed (or skipped).
 *
 * `sourceModule` is REQUIRED on every session so cross-app
 * analytics can attribute engagement back to the originating
 * EduCare AI application (ENGLISH_APP, MATH_APP, etc.).
 *
 * Status Machine:
 *   assigned → started → completed
 *                     ↘ skipped  (see activity_skips for detail)
 * ============================================================
 */

import mongoose from 'mongoose';
import { SOURCE_MODULES } from './Activity.js';

const { Schema } = mongoose;

// ─── Status Constants ────────────────────────────────────────
export const SESSION_STATUS = Object.freeze({
  ASSIGNED:  'assigned',
  STARTED:   'started',
  COMPLETED: 'completed',
  SKIPPED:   'skipped',
  EXPIRED:   'expired',   // assigned but time window passed
});

// ─── Sub-Schema: Mood Snapshot ──────────────────────────────
const MoodSnapshotSchema = new Schema(
  {
    mood:       { type: String, default: 'unknown' },
    confidence: { type: Number, default: null, min: 0, max: 1 },  // 0.0–1.0
    capturedAt: { type: Date,   default: null },
  },
  { _id: false }
);

// ─── Sub-Schema: Device / Context Metadata ──────────────────
const SessionMetaSchema = new Schema(
  {
    deviceType:  { type: String, enum: ['desktop', 'tablet', 'mobile', 'unknown'], default: 'unknown' },
    ipHash:      { type: String, default: null },  // hashed for privacy
    userAgent:   { type: String, default: null, maxlength: 300 },
    appVersion:  { type: String, default: null },
  },
  { _id: false }
);

// ─── Main Activity Session Schema ────────────────────────────
const ActivitySessionSchema = new Schema(
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

    // ── Source Module (REQUIRED — cross-app analytics) ───────
    sourceModule: {
      type: String,
      required: [true, 'sourceModule is required on every activity session'],
      enum: {
        values: Object.values(SOURCE_MODULES),
        message: '`{VALUE}` is not a valid sourceModule',
      },
      index: true,
    },

    // ── Grade at time of session (denormalized for analytics) ─
    gradeAtSession: {
      type: String,
      required: [true, 'gradeAtSession is required'],
      enum: ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    },

    // ── Lifecycle Timestamps ─────────────────────────────────
    assignedAt: {
      type: Date,
      required: [true, 'assignedAt is required'],
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
      validate: {
        validator: function (val) {
          if (!val || !this.startedAt) return true;
          return val >= this.startedAt;
        },
        message: 'completedAt cannot be earlier than startedAt',
      },
    },
    skippedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,  // null = no expiry; set by scheduler
    },

    // ── Duration ─────────────────────────────────────────────
    // Actual elapsed time in seconds (may differ from planned duration)
    actualDurationSeconds: {
      type: Number,
      default: null,
      min: [0, 'Duration cannot be negative'],
    },
    // Planned duration at assignment time (from Activity catalog)
    plannedDurationSeconds: {
      type: Number,
      default: null,
      min: [0, 'Planned duration cannot be negative'],
    },

    // ── Status ───────────────────────────────────────────────
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(SESSION_STATUS),
        message: '`{VALUE}` is not a valid session status',
      },
      default: SESSION_STATUS.ASSIGNED,
      index: true,
    },

    // ── Completion Quality ───────────────────────────────────
    completionPercentage: {
      type: Number,
      default: null,
      min: [0,   'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
    },
    stepsCompleted: {
      type: Number,
      default: null,
      min: 0,
    },
    totalSteps: {
      type: Number,
      default: null,
      min: 0,
    },

    // ── Student Feedback ─────────────────────────────────────
    feedback: {
      rating: {
        type: Number,
        default: null,
        min: [1, 'Rating must be 1–5'],
        max: [5, 'Rating must be 1–5'],
      },
      emoji:   { type: String, default: null },
      comment: { type: String, default: null, maxlength: [500, 'Comment too long'] },
    },

    // ── Mood Context ─────────────────────────────────────────
    moodBefore: { type: MoodSnapshotSchema, default: null },
    moodAfter:  { type: MoodSnapshotSchema, default: null },

    // ── Rewards Earned in this Session ──────────────────────
    starsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Stars cannot be negative'],
    },
    badgeEarned: {
      type: String,
      default: null,  // badgeId or null
    },

    // ── Assignment Context ───────────────────────────────────
    assignedBy: {
      type: String,
      enum: ['AI_TUTOR', 'TEACHER', 'PARENT', 'SELF', 'SYSTEM'],
      default: 'SYSTEM',
    },
    assignmentContext: {
      type: String,
      default: null,
      maxlength: 300,  // e.g., "After completing Math Lesson 3"
    },

    // ── Session Metadata ─────────────────────────────────────
    sessionMeta: { type: SessionMetaSchema, default: () => ({}) },

    // ── Audit ───────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'activity_sessions',
  }
);

// ─── Indexes ─────────────────────────────────────────────────

// Primary lookup: student's session history
ActivitySessionSchema.index({ studentId: 1, status: 1, assignedAt: -1 });

// Cross-app analytics: sourceModule breakdown by status + time
ActivitySessionSchema.index({ sourceModule: 1, status: 1, assignedAt: -1 });

// Activity performance: how often each activity is completed / skipped
ActivitySessionSchema.index({ activityId: 1, status: 1 });

// Teacher Dashboard: sessions by grade over time
ActivitySessionSchema.index({ gradeAtSession: 1, assignedAt: -1 });

// Parent Dashboard: child's recent activity
ActivitySessionSchema.index({ studentId: 1, assignedAt: -1 });

// Compound analytics: sourceModule + grade + status
ActivitySessionSchema.index({ sourceModule: 1, gradeAtSession: 1, status: 1 });

// Expiry cleanup job
ActivitySessionSchema.index({ expiresAt: 1 }, { sparse: true });

// Soft delete filter
ActivitySessionSchema.index({ isDeleted: 1, studentId: 1 });

// ─── Virtual: Completion Time (minutes) ─────────────────────
ActivitySessionSchema.virtual('actualDurationMinutes').get(function () {
  if (!this.actualDurationSeconds) return null;
  return parseFloat((this.actualDurationSeconds / 60).toFixed(2));
});

// ─── Virtual: Was On Time ────────────────────────────────────
ActivitySessionSchema.virtual('wasOnTime').get(function () {
  if (!this.completedAt || !this.expiresAt) return null;
  return this.completedAt <= this.expiresAt;
});

// ─── Pre-save Hook: Auto-compute actualDurationSeconds ───────
ActivitySessionSchema.pre('save', function (next) {
  if (this.startedAt && this.completedAt && !this.actualDurationSeconds) {
    this.actualDurationSeconds = Math.round(
      (this.completedAt - this.startedAt) / 1000
    );
  }
  next();
});

// ─── Model ───────────────────────────────────────────────────
export const ActivitySessionModel = mongoose.model('ActivitySession', ActivitySessionSchema);
export default ActivitySessionModel;
