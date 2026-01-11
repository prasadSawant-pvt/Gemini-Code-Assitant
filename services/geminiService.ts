import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { AssistantConfig, ChatMessage } from '../types';

// Initialize the client strictly with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamResponse = async (
  messages: ChatMessage[],
  newMessage: string,
  config: AssistantConfig,
  onChunk: (text: string, isTool?: boolean) => void
): Promise<void> => {
  
  try {
    // Parse tools config
    const tools = config.tools.length > 0 ? [{
      functionDeclarations: config.tools.map(t => {
        try {
          return {
            name: t.name,
            description: t.description,
            parameters: JSON.parse(t.parameters || '{}')
          } as FunctionDeclaration;
        } catch (e) {
          console.warn("Invalid JSON for tool parameters:", t.name);
          return {
            name: t.name,
            description: t.description
          } as FunctionDeclaration;
        }
      })
    }] : undefined;

    const chat = ai.chats.create({
      model: config.model,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        tools: tools
      },
      history: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }))
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      const responseChunk = chunk as GenerateContentResponse;
      
      // Handle text content
      if (responseChunk.text) {
        onChunk(responseChunk.text, false);
      }

      // Handle function calls (just visualization for preview)
      if (responseChunk.functionCalls && responseChunk.functionCalls.length > 0) {
         const toolCallText = responseChunk.functionCalls.map(fc => 
           `⚡ Tool Call Request:\nFunction: \`${fc.name}\`\nArguments: \n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``
         ).join('\n\n');
         onChunk(toolCallText, true);
      }
    }
  } catch (error) {
    console.error("Error streaming response:", error);
    throw error;
  }
};
