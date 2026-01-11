import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ConfigPanel } from './components/ConfigPanel';
import { CodeExport } from './components/CodeExport';
import { AssistantConfig, ChatMessage, ModelName } from './types';
import { streamResponse } from './services/geminiService';
import { Code, MessageSquare } from 'lucide-react';

const DEFAULT_INSTRUCTION = `You are a helpful, witty, and precise AI assistant. 
You prefer to give concise answers but can elaborate when asked.
You are expert in modern web technologies.`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'code'>('chat');
  
  const [config, setConfig] = useState<AssistantConfig>({
    model: ModelName.FLASH,
    systemInstruction: DEFAULT_INSTRUCTION,
    temperature: 1.0,
    topK: 64,
    topP: 0.95,
    tools: []
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Optimistically add user message
    const userMsg: ChatMessage = { role: 'user', content, timestamp: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Create placeholder for model response
      const modelMsgId = Date.now() + 1;
      let modelContent = "";
      
      setMessages(prev => [
        ...prev, 
        { role: 'model', content: '', timestamp: modelMsgId }
      ]);

      await streamResponse(newHistory, content, config, (chunk, isTool) => {
        modelContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          // Update last message if it's the model's placeholder
          if (last.role === 'model' && last.timestamp === modelMsgId) {
             // If we detect a tool call, mark the message as such
             return [...prev.slice(0, -1), { 
               ...last, 
               content: modelContent,
               isTool: isTool || last.isTool
             }];
          }
          return prev;
        });
      });

    } catch (error) {
      console.error("Failed to generate response", error);
      setMessages(prev => [
        ...prev,
        { role: 'model', content: "**Error:** Failed to connect to Gemini. Please ensure your `API_KEY` environment variable is set correctly.", timestamp: Date.now() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-lg">G</span>
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               Gemini Architect
             </h1>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'chat' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
                <MessageSquare className="w-4 h-4" />
                Preview Chat
            </button>
            <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'code' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700