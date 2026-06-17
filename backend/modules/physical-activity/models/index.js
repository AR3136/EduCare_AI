/**
 * ============================================================
 * EduCare AI — Physical Activity Engine
 * Models Index (Barrel Export)
 * ============================================================
 * Single import point for all Physical Activity Engine models.
 *
 * Usage:
 *   import {
 *     StudentModel,
 *     ActivityModel,
 *     ActivitySessionModel,
 *     ActivitySkipModel,
 *     ActivityRewardModel,
 *     ActivityAnalyticsModel,
 *     SOURCE_MODULES,
 *     SESSION_STATUS,
 *     SKIP_REASONS,
 *     REWARD_TYPES,
 *     REWARD_TRIGGERS,
 *   } from '../models/index.js';
 * ============================================================
 */

// ── Models ────────────────────────────────────────────────────
export { default as StudentModel }           from './Student.js';
export { default as ActivityModel }          from './Activity.js';
export { default as ActivitySessionModel }   from './ActivitySession.js';
export { default as ActivitySkipModel }      from './ActivitySkip.js';
export { default as ActivityRewardModel }    from './ActivityReward.js';
export { default as ActivityAnalyticsModel } from './ActivityAnalytics.js';

// ── Enum Constants ────────────────────────────────────────────
export { SOURCE_MODULES, ACTIVITY_CATEGORIES, GRADE_LEVELS, MOOD_TAGS } from './Activity.js';
export { SESSION_STATUS }         from './ActivitySession.js';
export { SKIP_REASONS }           from './ActivitySkip.js';
export { REWARD_TYPES, REWARD_TRIGGERS } from './ActivityReward.js';
