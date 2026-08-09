import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessageToAI } from '../services/apiClient.js';
import { ChatMessage } from '../types/index.js';
import { Bot, Send, Sparkles, User, Terminal, RefreshCw, Cpu, HelpCircle } from 'lucide-react';

interface AssistantPageProps {
  onNavigate: (path: string) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `### 👋 Hi! I am DeployLens AI Copilot

I continuously analyze your application deployments, health metrics, and logs running on **Zerops**.

Here are some suggested questions you can ask me:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Why did deployment #22 fail?',
    'Is the latest deployment safe?',
    'What caused the latency spike?',
    'Which service is currently unhealthy?',
    'How can I fix this deployment?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const replyText = await sendChatMessageToAI(text, history);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Error communicating with Gemini Copilot Engine:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-950 text-violet-400 border border-violet-800/60 shadow-lg shadow-violet-950/50">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              DeployLens AI Copilot Chat
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Powered by Gemini 3.6 Flash • Real-time telemetry context injection
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-reset',
                sender: 'ai',
                text: 'Chat history cleared. How can I assist you with your Zerops deployment?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Conversation
        </button>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 shadow-2xl font-mono text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  : 'bg-violet-950 text-violet-300 border border-violet-800'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-violet-900/60 text-violet-100 border border-violet-700/60 rounded-tr-none'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed space-y-2">{msg.text}</div>
              <div className="mt-2 text-[10px] text-zinc-500 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
            <span>Gemini AI Copilot is reasoning over current deployment context...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3.5 h-3.5" /> Quick Prompts:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono whitespace-nowrap border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shrink-0 shadow-lg"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini about deployments, logs, service health, or failure fixes..."
          className="flex-1 bg-transparent px-4 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-violet-900/40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
