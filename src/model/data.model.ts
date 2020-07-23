export interface AssistantData {
  name: string,
  count: number,
}

export interface Intent {
  name: string,
  confidence: number,
  session_id: string
}

export interface Entity {
  name: string,
  confidence: number,
  value: string,
  session_id: string
}