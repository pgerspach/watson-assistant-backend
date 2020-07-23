import {Singleton, OnlyInstantiableByContainer} from "typescript-ioc";
import AssistantV2 = require('ibm-watson/assistant/v2');
import {Intent, Entity} from '../../../src/model';

@Singleton
@OnlyInstantiableByContainer
export class DataUtil {
  assistantIntentToDataIntent(assistantIntent: AssistantV2.RuntimeIntent, sessionId: string): Intent {
    return {
      name: assistantIntent.intent,
      confidence: assistantIntent.confidence,
      session_id: sessionId
    };
  }

  assistantEntityToDataEntity(assistantEntity: AssistantV2.RuntimeEntity, sessionId: string): Entity {
    return {
      name: assistantEntity.entity,
      confidence: assistantEntity.confidence,
      session_id: sessionId,
      value: assistantEntity.value
    };
  }
}