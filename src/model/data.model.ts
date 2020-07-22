export interface AssistantData {
  name: string,
  count: number,
}

export interface Intent {
  name: string,
  confidence: number,
  session_id: string
}