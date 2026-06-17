/**
 * Decoupled Frontend Event Bus for EduCare AI
 * ============================================================
 * Allows microservice-like React modules to communicate without
 * direct import coupling. Uses both a local subscriber array
 * and browser-native CustomEvents to support standard page elements.
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
