/**
 * global.eventBus — Shared Ecosystem Event Bus
 * ============================================================
 * An in-process Event Bus singleton that allows modular parts
 * of the EduCare AI ecosystem to communicate asynchronously.
 *
 * Implemented using Node's native EventEmitter.
 *
 * Registered Event Types:
 *   - Incoming Events:
 *     - ENGLISH_SESSION_COMPLETED
 *     - MATH_SESSION_COMPLETED
 *     - STEM_SESSION_COMPLETED
 *     - LOGIC_SESSION_COMPLETED
 *     - MOOD_UPDATED
 *   - Outgoing Events:
 *     - ACTIVITY_ASSIGNED
 *     - ACTIVITY_STARTED
 *     - ACTIVITY_COMPLETED
 *     - ACTIVITY_SKIPPED
 *     - ENGAGEMENT_UPDATED
 *     - PARENT_ALERT_GENERATED
 *     - REWARD_GRANTED
 *     - BADGE_UNLOCKED
 * ============================================================
 */

import { EventEmitter } from 'events';

class EduCareEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase listener limit for microservice-like stubs
    this.setMaxListeners(100);
    this.setupDebugLog();
  }

  setupDebugLog() {
    this.on('newListener', (eventName) => {
      console.log(`[EventBus] New listener registered for event: ${eventName}`);
    });
  }

  // Helper to safely emit and log events
  publish(eventName, payload) {
    console.log(`📡 [EventBus] Publishing ${eventName} with payload:`, JSON.stringify(payload, null, 2));
    this.emit(eventName, {
      ...payload,
      _timestamp: new Date().toISOString()
    });

    // Reusable middleware trigger for Cross Application Trigger Engine
    if (eventName && eventName.endsWith('_SESSION_COMPLETED')) {
      console.log(`🔀 [EventBus] Intercepted wildcard session completion: ${eventName}. Emitting ANY_SESSION_COMPLETED.`);
      this.emit('ANY_SESSION_COMPLETED', {
        originatingEvent: eventName,
        ...payload,
        _timestamp: new Date().toISOString()
      });
    }
  }
}

// Ensure global singleton instance
if (!global.eduCareEventBus) {
  global.eduCareEventBus = new EduCareEventBus();
  
  // Register modular stubs for future components to show readiness
  const stubLogger = (moduleName, eventName) => (data) => {
    console.log(`🔮 [EventBus] [STUB] ${moduleName} received event: ${eventName}`);
  };

  // Robotics Module Stubs
  global.eduCareEventBus.on('ACTIVITY_COMPLETED', stubLogger('Robotics Module', 'ACTIVITY_COMPLETED'));
  global.eduCareEventBus.on('EVENT_ACTIVITY_COMPLETED', stubLogger('Robotics Module', 'EVENT_ACTIVITY_COMPLETED'));
  
  // Coding Module Stubs
  global.eduCareEventBus.on('STEM_SESSION_COMPLETED', stubLogger('Coding Module', 'STEM_SESSION_COMPLETED'));
  
  // Science Module Stubs
  global.eduCareEventBus.on('ACTIVITY_COMPLETED', stubLogger('Science Module', 'ACTIVITY_COMPLETED'));
  global.eduCareEventBus.on('EVENT_ACTIVITY_COMPLETED', stubLogger('Science Module', 'EVENT_ACTIVITY_COMPLETED'));
  
  // AR/VR Module Stubs
  global.eduCareEventBus.on('MOOD_UPDATED', stubLogger('AR/VR Module', 'MOOD_UPDATED'));
  global.eduCareEventBus.on('EVENT_MOOD_UPDATED', stubLogger('AR/VR Module', 'EVENT_MOOD_UPDATED'));
  
  // AI Tutor Agent Stubs
  const events = [
    'ENGLISH_SESSION_COMPLETED',
    'MATH_SESSION_COMPLETED',
    'STEM_SESSION_COMPLETED',
    'LOGIC_SESSION_COMPLETED',
    'MOOD_UPDATED',
    'ACTIVITY_ASSIGNED',
    'ACTIVITY_STARTED',
    'ACTIVITY_COMPLETED',
    'ACTIVITY_SKIPPED',
    'ENGAGEMENT_UPDATED',
    'PARENT_ALERT_GENERATED',
    'REWARD_GRANTED',
    'BADGE_UNLOCKED',
    'EVENT_LESSON_COMPLETED',
    'EVENT_ACTIVITY_ASSIGNED',
    'EVENT_ACTIVITY_STARTED',
    'EVENT_ACTIVITY_COMPLETED',
    'EVENT_ACTIVITY_SKIPPED',
    'EVENT_REWARD_GRANTED',
    'EVENT_MOOD_UPDATED'
  ];
  events.forEach(event => {
    global.eduCareEventBus.on(event, stubLogger('AI Tutor Agent', event));
  });
}

export const eventBus = global.eduCareEventBus;
export default eventBus;
