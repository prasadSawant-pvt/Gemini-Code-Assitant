import React, { useState } from 'react';
import { AssistantConfig, ModelName, ToolDefinition } from '../types';
import { Settings, Sliders, Cpu, Sparkles, Wrench, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface ConfigPanelProps {
  config: AssistantConfig;
  onChange: (newConfig: AssistantConfig) => void;
}

const DEFAULT_PARAMS = `{
  "type": "OBJECT",
  "properties": {
    "location": {
      "type": "STRING",
      "description": "The city and state, e.g. San Francisco, CA"
    }
  },
  "required": ["location"]
}`;

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const [expandedTool, setExpandedTool] = useState<number | null>(null);

  const handleChange = <K extends keyof AssistantConfig>(
    key: K,
    value: AssistantConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const addTool = () => {
    const newTool: ToolDefinition = {
      name: 'newFunction',
      description: 'Description of what this function does',
      parameters: DEFAULT_PARAMS
    };
    handleChange('tools', [...config.tools, newTool]);
    setExpandedTool(config.tools.length);
  };

  const updateTool = (index: number, field: keyof ToolDefinition, value: string) => {
    const newTools = [...config.tools];
    newTools[index] = { ...newTools[index], [field]: value };
    handleChange('tools', newTools);
  };

  const removeTool = (index: number) => {
    const newTools = config.tools.filter((_, i) => i !== index);
    handleChange('tools', newTools);
    setExpandedTool(null);
  };

  return (
    <div className="bg-slate-900 h-full rounded-lg border border-slate-700 p-5 overflow-y-auto shadow-xl custom-scrollbar">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
        <Settings className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Configuration</h2>
      </div>

      <div className="space-y-8">
        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Model
          </label>
          <select
            value={config.model}
            onChange={(e) => handleChange('model', e.target.value as ModelName)}
            className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors"
          >
            <option value={ModelName.FLASH}>Gemini 3 Flash Preview (Fast)</option>
            <option value={ModelName.PRO}>Gemini 3 Pro Preview (Reasoning)</option>
          </select>
        </div>

        {/* System Instruction */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> System Instructions
          </label>
          <textarea
            value={config.systemInstruction}
            onChange={(e) => handleChange('systemInstruction', e.target.value)}
            rows={6}
            className="block p-3 w-full text-sm text-slate-200 bg-slate-800 rounded-lg border border-slate-600 focus:ring-indigo-500 focus:border-indigo-500 font-mono resize-y placeholder-slate-500"
            placeholder="You are a helpful coding assistant..."
          />
        </div>

        {/* Tools Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-400" /> Tools / Functions
            </label>
            <button
              onClick={addTool}
              className="text-xs flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          
          <div className="space-y-3">
            {config.tools.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-2 border border-dashed border-slate-700 rounded-lg">
                No tools defined. Add one to enable function calling.
              </p>
            )}
            {config.tools.map((tool, idx) => (
              <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedTool(expandedTool === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {expandedTool === idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <span className="text-sm font-mono text-indigo-300 truncate">{tool.name}</span>
                  </div>
                  <div 
                    onClick={(e) => { e.stopPropagation(); removeTool(idx); }}
                    className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </button>
                
                {expandedTool === idx && (
                  <div className="p-3 border-t border-slate-700 space-y-3 bg-slate-900/50">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Function Name</label>
                      <input
                        type="text"
                        value={tool.name}
                        onChange={(e) => updateTool(idx, 'name', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={tool.description}
                        onChange={(e) => updateTool(idx, 'description', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Parameters (JSON Schema)</label>
                      <textarea
                        value={tool.parameters}
                        onChange={(e) => updateTool(idx, 'parameters', e.target.value)}
                        rows={6}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-emerald-300 font-mono focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-300">Model Parameters</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                  <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-400">Temperature</label>
                      <span className="text-xs text-indigo-400 font-mono">{config.temperature}</span>
                  </div>
                  <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
              </div>

              <div>
                  <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-400">Top P</label>
                      <span className="text-xs text-indigo-400 font-mono">{config.topP}</span>
                  </div>
                  <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.topP}
                      onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
              </div>

              <div>
                  <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-400">Top K</label>
                      <span className="text-xs text-indigo-400 font-mono">{config.topK}</span>
                  </div>
                  <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={config.topK}
                      onChange={(e) => handleChange('topK', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
