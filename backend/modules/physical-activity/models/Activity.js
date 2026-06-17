/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Collection: activities
 * ============================================================
 * The activity CATALOG. Each document defines one activity
 * type (e.g., "Bear Crawl", "Sun Salutation Lite"). Actual
 * student interactions are stored in activity_sessions.
 *
 * `sourceModule` on this schema indicates which EduCare AI
 * application the activity was originally designed for, so
 * cross-app analytics can group by origin.
 * ============================================================
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Enum Constants (exported for reuse in other models) ─────
export const SOURCE_MODULES = Object.freeze({
  ENGLISH_APP: 'ENGLISH_APP',
  MATH_APP:    'MATH_APP',
  STEM_APP:    'STEM_APP',
  LOGIC_APP:   'LOGIC_APP',
  AI_TUTOR:    'AI_TUTOR',
});

export const ACTIVITY_CATEGORIES = Object.freeze([
  'stretching',
  'cardio',
  'yoga',
  'dance',
  'mindfulness',
  'breathing',
  'strength',
  'coordination',
]);

export const GRADE_LEVELS = Object.freeze([
  'KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
]);

export const MOOD_TAGS = Object.freeze([
  'calm', 'energize', 'focus', 'fun', 'relax', 'motivate', 'social',
]);

// ─── Sub-Schema: Instruction Step ───────────────────────────
const InstructionStepSchema = new Schema(
  {
    stepNumber:   { type: Number, required: true },
    description:  { type: String, required: true, trim: true, maxlength: 500 },
    durationSeconds: { type: Number, default: 0, min: 0 },
    mediaUrl:     { type: String, default: null },   // image / gif for this step
    voiceCueText: { type: String, default: null },   // text-to-speech prompt
  },
  { _id: false }
);

// ─── Sub-Schema: Accessibility ──────────────────────────────
const AccessibilitySchema = new Schema(
  {
    requiresEquipment:  { type: Boolean, default: false },
    equipmentList:      { type: [String], default: [] },
    requiresOpenSpace:  { type: Boolean, default: false },
    suitableForChairs:  { type: Boolean, default: false }, // seated activities
    lowImpact:          { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── Main Activity Schema ─────────────────────────────────────
const ActivitySchema = new Schema(
  {
    // ── Identity ────────────────────────────────────────────
    activityId: {
      type: String,
      required: [true, 'activityId is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [600, 'Description cannot exceed 600 characters'],
      default: '',
    },
    emoji: {
      type: String,
      default: '🏃',
      maxlength: [8, 'Emoji field too long'],
    },

    // ── Source Module (REQUIRED — cross-app analytics key) ──
    sourceModule: {
      type: String,
      required: [true, 'sourceModule is required for cross-application analytics'],
      enum: {
        values: Object.values(SOURCE_MODULES),
        message: '`{VALUE}` is not a valid sourceModule. Use: ENGLISH_APP | MATH_APP | STEM_APP | LOGIC_APP | AI_TUTOR',
      },
      index: true,
    },

    // ── Classification ──────────────────────────────────────
    category: {
      type: String,
      required: [true, 'category is required'],
      enum: {
        values: ACTIVITY_CATEGORIES,
        message: '`{VALUE}` is not a valid activity category',
      },
      index: true,
    },
    moodTags: {
      type: [String],
      enum: {
        values: MOOD_TAGS,
        message: '`{VALUE}` is not a valid mood tag',
      },
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 mood tags allowed per activity',
      },
    },

    // ── Grade Targeting ─────────────────────────────────────
    gradeLevels: {
      type: [String],
      required: [true, 'gradeLevels is required'],
      enum: {
        values: GRADE_LEVELS,
        message: '`{VALUE}` is not a supported grade level',
      },
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one grade level must be specified',
      },
    },

    // ── Duration ─────────────────────────────────────────────
    durationSeconds: {
      type: Number,
      required: [true, 'durationSeconds is required'],
      min: [30,   'Activity must be at least 30 seconds'],
      max: [3600, 'Activity cannot exceed 60 minutes'],
    },

    // ── Instructions ────────────────────────────────────────
    instructions: {
      type: [InstructionStepSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 30,
        message: 'Maximum 30 instruction steps allowed',
      },
    },

    // ── Media ───────────────────────────────────────────────
    thumbnailUrl:    { type: String, default: null },
    previewVideoUrl: { type: String, default: null },
    bannerColor:     { type: String, default: '#6366f1', match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'] },

    // ── Rewards Configuration ────────────────────────────────
    starsOnCompletion: {
      type: Number,
      default: 3,
      min: [0,  'Stars cannot be negative'],
      max: [20, 'Stars on completion cannot exceed 20'],
    },
    badgeId: {
      type: String,
      default: null,  // optional badge awarded on first completion
    },

    // ── Difficulty ──────────────────────────────────────────
    difficultyLevel: {
      type: Number,
      default: 1,
      min: [1, 'Difficulty level must be 1–5'],
      max: [5, 'Difficulty level must be 1–5'],
    },

    // ── Accessibility ────────────────────────────────────────
    accessibility: { type: AccessibilitySchema, default: () => ({}) },

    // ── Status ──────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'activities',
  }
);

// ─── Indexes ─────────────────────────────────────────────────
// Activity discovery: filter by grade + category + source
ActivitySchema.index({ gradeLevels: 1, category: 1, sourceModule: 1 });
// Mood-based recommendation engine
ActivitySchema.index({ moodTags: 1, isActive: 1 });
// Cross-app analytics: group by sourceModule + category
ActivitySchema.index({ sourceModule: 1, category: 1 });
// Full-text search on title + description + tags
ActivitySchema.index({ title: 'text', description: 'text', tags: 'text' });

// ─── Model ───────────────────────────────────────────────────
export const ActivityModel = mongoose.model('Activity', ActivitySchema);
export default ActivityModel;
