import React from 'react';
import { AssistantConfig } from '../types';
import { Copy, FileCode } from 'lucide-react';

interface CodeExportProps {
  config: AssistantConfig;
}

export const CodeExport: React.FC<CodeExportProps> = ({ config }) => {
  const [copied, setCopied] = React.useState(false);

  const generateCode = () => {
    const toolsCode = config.tools.length > 0 ? `
    // Tool Definitions
    tools: [
      {
        functionDeclarations: [
${config.tools.map(t => `          {
            name: "${t.name}",
            description: "${t.description}",
            parameters: ${t.parameters.trim() || '{}'}
          }`).join(',\n')}
        ]
      }
    ],` : '';

    return `import { GoogleGenAI } from "@google/genai";

// Initialize client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function runAssistant() {
  const chat = ai.chats.create({
    model: '${config.model}',
    config: {
      systemInstruction: \`${config.systemInstruction.replace(/`/g, '\\`')}\`,
      temperature: ${config.temperature},
      topK: ${config.topK},
      topP: ${config.topP},${toolsCode}
    },
    history: []
  });

  // Example message to trigger potential tool usage
  const userMessage = "${config.tools.length > 0 ? 'Use the available tools to...' : 'Hello! How can you help me today?'}";
  
  console.log("User:", userMessage);
  let response = await chat.sendMessageStream({ message: userMessage });

  for await (const chunk of response) {
    // Handle Text
    if (chunk.text) {
      process.stdout.write(chunk.text);
    }

    // Handle Function Calls (Tools)
    // Note: The SDK organizes function calls. In a real app, 
    // you would execute the function and send the result back.
    const functionCalls = chunk.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      console.log("\\n[Function Call Request]:", JSON.stringify(functionCalls, null, 2));
      
      // Example of handling:
      // 1. Execute function
      // 2. Send result back using chat.sendMessage({ parts: [{ functionResponse: ... }] })
    }
  }
}

runAssistant().catch(console.error);
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-slate-100">Implementation Code</h3>
            </div>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-900/30 rounded hover:bg-indigo-900/50 transition-colors border border-indigo-500/30"
            >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Code'}
            </button>
        </div>
        <div className="flex-1 overflow-auto p-0 bg-[#0d1117] custom-scrollbar">
            <pre className="p-4 text-sm font-mono text-slate-300 leading-relaxed">
                <code>{generateCode()}</code>
            </pre>
        </div>
    </div>
  );
};
