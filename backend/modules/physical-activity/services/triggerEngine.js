import { eventBus } from '../../../shared/eventBus.js';
import { assignActivityInternal } from '../controllers/activityController.js';

// INTEGRATION_TAG: ENGLISH_MODULE
// INTEGRATION_TAG: MATH_MODULE
// INTEGRATION_TAG: STEM_MODULE
// INTEGRATION_TAG: LOGIC_MODULE
// INTEGRATION_TAG: SCIENCE_MODULE
// INTEGRATION_TAG: CODING_MODULE
// INTEGRATION_TAG: ROBOTICS_MODULE

export const initializeTriggerEngine = () => {
  console.log('🏁 [TriggerEngine] Initializing Cross Application Trigger Engine...');

  // Listen to ANY session completion event intercepted by eventBus pattern matching
  eventBus.on('ANY_SESSION_COMPLETED', async (payload) => {
    const { studentId, grade, sourceModule, originatingEvent } = payload;
    console.log(`🔀 [TriggerEngine] Capture: ${originatingEvent} for student ${studentId}. Scheduling physical activity...`);

    try {
      // Map originating module correctly
      let mappedSource = sourceModule;
      if (!mappedSource) {
        if (originatingEvent.includes('ENGLISH')) mappedSource = 'ENGLISH_APP';
        else if (originatingEvent.includes('MATH')) mappedSource = 'MATH_APP';
        else if (originatingEvent.includes('STEM')) mappedSource = 'STEM_APP';
        else if (originatingEvent.includes('LOGIC')) mappedSource = 'LOGIC_APP';
        else mappedSource = 'AI_TUTOR';
      }

      // Automatically assign a physical break activity
      const result = await assignActivityInternal({
        studentId,
        grade: grade || 'Grade 2',
        sourceModule: mappedSource
      });

      console.log(`✅ [TriggerEngine] Successfully assigned break activity ${result.activityId} (Session: ${result.sessionId})`);

      // Publish outbound PHYSICAL_ACTIVITY_ASSIGNMENT event for the frontend / other apps
      eventBus.publish('PHYSICAL_ACTIVITY_ASSIGNMENT', {
        studentId,
        sessionId: result.sessionId,
        activityId: result.activityId,
        sourceModule: mappedSource,
        activityDetail: result.activityDetail
      });
    } catch (err) {
      console.error('❌ [TriggerEngine] Auto-assignment failed:', err);
    }
  });
};

export default initializeTriggerEngine;
