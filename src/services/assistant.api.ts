import {Response, MessageResponse, SessionResponse, Empty} from 'ibm-watson/assistant/v2';

export abstract class AssistantApi {
  abstract async sendMessage(sessionId: string, text: string): Promise<Response<MessageResponse>>;
  abstract async createSession(): Promise<Response<SessionResponse>>;
  abstract async deleteSession(sessionId: string): Promise<Response<Empty>>;
}