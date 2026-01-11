export enum ModelName {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isTool?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: string; // JSON Schema string
}

export interface AssistantConfig {
  model: ModelName;
  systemInstruction: string;
  temperature: number;
  topK: number;
  topP: number;
  tools: ToolDefinition[];
}
