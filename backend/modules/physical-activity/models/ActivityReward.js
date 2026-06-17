/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Collection: activity_rewards
 * ============================================================
 * Immutable ledger of every reward event issued to a student
 * through the Physical Activity Engine.
 *
 * Design: append-only (no updates after creation). Totals are
 * denormalized onto the Student document for fast reads.
 *
 * Reward events are fired as EVENT_REWARD_GRANTED on the
 * EduCare AI shared event bus after each activity completion.
 *
 * `sourceModule` is REQUIRED so the Rewards Engine and Parent/
 * Teacher Dashboards can show per-app reward breakdowns.
 * ============================================================
 */

import mongoose from 'mongoose';
import { SOURCE_MODULES } from './Activity.js';

const { Schema } = mongoose;

// ─── Reward Type Constants ───────────────────────────────────
export const REWARD_TYPES = Object.freeze({
  STARS:          'STARS',           // General star points
  BADGE:          'BADGE',           // Achievement badge
  ENERGY_POINTS:  'ENERGY_POINTS',   // Physical activity currency
  STREAK_BONUS:   'STREAK_BONUS',    // Streak milestone bonus
  PERFECT_RUN:    'PERFECT_RUN',     // 100% completion, no skips
  FIRST_ATTEMPT:  'FIRST_ATTEMPT',   // First time completing activity
  CHALLENGE_WIN:  'CHALLENGE_WIN',   // Completed challenge mode
  MOOD_BONUS:     'MOOD_BONUS',      // Completed activity despite low mood
  MODULE_UNLOCK:  'MODULE_UNLOCK',   // Unlocked a new EduCare module/feature
});

// ─── Reward Trigger Constants ────────────────────────────────
export const REWARD_TRIGGERS = Object.freeze({
  ACTIVITY_COMPLETED:   'ACTIVITY_COMPLETED',
  STREAK_MILESTONE:     'STREAK_MILESTONE',
  DAILY_GOAL_MET:       'DAILY_GOAL_MET',
  WEEKLY_GOAL_MET:      'WEEKLY_GOAL_MET',
  PERFECT_WEEK:         'PERFECT_WEEK',
  FIRST_ACTIVITY_EVER:  'FIRST_ACTIVITY_EVER',
  TEACHER_GRANT:        'TEACHER_GRANT',
  PARENT_GRANT:         'PARENT_GRANT',
  SYSTEM_GRANT:         'SYSTEM_GRANT',
});

// ─── Activity Reward Schema ───────────────────────────────────
const ActivityRewardSchema = new Schema(
  {
    // ── Foreign Keys ────────────────────────────────────────
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      index: true,
    },
    activityId: {
      type: String,
      default: null,  // null for non-activity rewards (e.g., weekly goal bonus)
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ActivitySession',
      default: null,  // null for non-session rewards
      index: true,
    },

    // ── Source Module (REQUIRED — cross-app analytics) ───────
    sourceModule: {
      type: String,
      required: [true, 'sourceModule is required on every reward record'],
      enum: {
        values: Object.values(SOURCE_MODULES),
        message: '`{VALUE}` is not a valid sourceModule',
      },
      index: true,
    },

    // ── Grade at time of reward (denormalised) ───────────────
    gradeAtReward: {
        type: String,
        required: [true, 'gradeAtReward is required'],
        enum: ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    },

    // ── Reward Classification ────────────────────────────────
    rewardType: {
      type: String,
      required: [true, 'rewardType is required'],
      enum: {
        values: Object.values(REWARD_TYPES),
        message: '`{VALUE}` is not a valid rewardType',
      },
      index: true,
    },
    rewardTrigger: {
      type: String,
      required: [true, 'rewardTrigger is required'],
      enum: {
        values: Object.values(REWARD_TRIGGERS),
        message: '`{VALUE}` is not a valid rewardTrigger',
      },
    },

    // ── Stars ────────────────────────────────────────────────
    starsEarned: {
      type: Number,
      required: [true, 'starsEarned is required'],
      min: [0,  'Stars cannot be negative'],
      max: [100,'Stars per reward cannot exceed 100'],
      default: 0,
    },

    // ── Badge ─────────────────────────────────────────────────
    badgeId: {
      type: String,
      default: null,
    },
    badgeLabel: {
      type: String,
      default: null,
      maxlength: 80,
    },
    badgeIcon: {
      type: String,
      default: null,
      maxlength: 8,  // emoji
    },

    // ── Energy Points (physical activity currency) ───────────
    energyPoints: {
      type: Number,
      default: 0,
      min: [0, 'Energy points cannot be negative'],
    },

    // ── Reward Metadata ──────────────────────────────────────
    multiplier: {
      type: Number,
      default: 1.0,
      min: [0.5, 'Multiplier cannot be below 0.5'],
      max: [5.0, 'Multiplier cannot exceed 5.0'],
    },
    bonusReason: {
      type: String,
      default: null,
      maxlength: 200,  // e.g., "Streak × 2 multiplier applied"
    },

    // ── Notification ─────────────────────────────────────────
    // Has the student seen this reward notification yet?
    notified: { type: Boolean, default: false, index: true },
    notifiedAt: { type: Date, default: null },

    // ── Granted By ───────────────────────────────────────────
    grantedBy: {
      type: String,
      enum: ['SYSTEM', 'AI_TUTOR', 'TEACHER', 'PARENT'],
      default: 'SYSTEM',
    },

    // ── Event Bus Reference ──────────────────────────────────
    eventId: {
      type: String,
      default: null,
      index: true,   // trace reward back to the EVENT_REWARD_GRANTED event
    },

    // ── Audit ───────────────────────────────────────────────
    // Rewards are append-only; no hard delete
    isVoided: { type: Boolean, default: false },
    voidedAt:  { type: Date, default: null },
    voidedBy:  { type: String, default: null },
    voidReason:{ type: String, default: null, maxlength: 200 },
  },
  {
    timestamps: true,
    collection: 'activity_rewards',
  }
);

// ─── Indexes ─────────────────────────────────────────────────

// Student reward feed (most recent first)
ActivityRewardSchema.index({ studentId: 1, createdAt: -1 });

// Unread notifications
ActivityRewardSchema.index({ studentId: 1, notified: 1 });

// Cross-app analytics: rewards by sourceModule and type
ActivityRewardSchema.index({ sourceModule: 1, rewardType: 1, createdAt: -1 });

// Teacher Dashboard: reward trends by grade
ActivityRewardSchema.index({ gradeAtReward: 1, rewardType: 1, createdAt: -1 });

// Badge collection lookup
ActivityRewardSchema.index({ studentId: 1, badgeId: 1 }, { sparse: true });

// Activity-level: reward history per activity
ActivityRewardSchema.index({ activityId: 1, rewardType: 1 });

// Voided rewards audit
ActivityRewardSchema.index({ isVoided: 1 }, { sparse: true });

// ─── Virtual: Total Value (stars + energyPoints) ─────────────
ActivityRewardSchema.virtual('totalValue').get(function () {
  return this.starsEarned + this.energyPoints;
});

// ─── Model ───────────────────────────────────────────────────
export const ActivityRewardModel = mongoose.model('ActivityReward', ActivityRewardSchema);
export default ActivityRewardModel;
