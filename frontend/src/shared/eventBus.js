/**
 * Decoupled Frontend Event Bus for EduCare AI
 * ============================================================
 * Allows microservice-like React modules to communicate without
 * direct import coupling. Uses both a local subscriber array
 * and browser-native CustomEvents to support standard page elements.
 * 
 * STANDARD EVENTS:
 * - SPARKY_SESSION_STARTED: Emitted when Sparky panel opens. Payload: { studentId, grade, context }
 * - CIRCUIT_LOADED: Emitted when a preset circuit loads. Payload: { studentId, preset }
 * - COMPONENT_ADDED: Emitted when dragging a component. Payload: { studentId, componentId }
 * - CIRCUIT_BROKEN: Emitted on short circuit/errors. Payload: { studentId, reason }
 * - HINT_REQUESTED: Emitted when asking for hints. Payload: { studentId, queryText }
 * - SPARKY_HINT_GIVEN: Emitted when Sparky replies with a hint. Payload: { studentId, hint }
 * - SPARKY_ERROR_DETECTED: Emitted when Sparky debug finds issue. Payload: { studentId, error }
 * - SPARKY_CIRCUIT_FIXED: Emitted when bug resolved. Payload: { studentId }
 * - SPARKY_LESSON_COMPLETED: Emitted when lesson circuit built. Payload: { studentId, starsEarned }
 * - SPARKY_SCORE_UPDATED: Emitted when telemetry updates. Payload: { studentId, newScore }
 */

class FrontendEventBus {
  constructor() {
    this.listeners = {};
  }

  // Subscribe to an event, returns an unsubscribe cleanup function
  subscribe(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    
    // Listen for custom window events as well
    const windowHandler = (e) => {
      callback(e.detail);
    };
    window.addEventListener(`educare_${eventName}`, windowHandler);

    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
      window.removeEventListener(`educare_${eventName}`, windowHandler);
    };
  }

  // Publish an event to all subscribers and dispatch to window
  publish(eventName, payload) {
    console.log(`📡 [Frontend EventBus] Publishing ${eventName}:`, payload);
    
    // Notify local subscribers
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`Error in event listener for ${eventName}:`, err);
        }
      });
    }

    // Dispatch a native CustomEvent so non-React/sibling elements can catch it
    const event = new CustomEvent(`educare_${eventName}`, {
      detail: payload,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  }
}

export const eventBus = new FrontendEventBus();
export default eventBus;
