import { useState, useRef, useEffect } from "react";
import { chatWithAI } from "../services/chatService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  PlusCircle,
  Paperclip,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! I'm your MediScan AI health assistant. I've analyzed your medical data and I'm ready to answer any questions about your results or general health concerns. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithAI(input);
      const aiMessage = {
        role: "ai",
        content: response.message,
        timestamp: new Date(response.timestamp),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "ai",
        content:
          "I apologize, but I encountered a neural synchronization error. Could you please rephrase your query?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 h-[calc(100vh-80px)] py-6 flex flex-col">
      <div className="glass-card flex-1 flex flex-col overflow-hidden border-white/5 relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-outfit font-bold text-white flex items-center">
                Health Assistant{" "}
                <Sparkles className="ml-2 text-cyan-400" size={16} />
              </h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                Neural Link Active
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                Secure
              </span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex max-w-[85%] sm:max-w-[70%] space-x-3",
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-auto mb-1",
                    message.role === "user"
                      ? "bg-white/10"
                      : "bg-cyan-400/10 border border-cyan-400/20"
                  )}
                >
                  {message.role === "user" ? (
                    <UserIcon size={16} className="text-slate-400" />
                  ) : (
                    <Bot size={16} className="text-cyan-400" />
                  )}
                </div>

                <div
                  className={cn(
                    "relative p-4 rounded-2xl",
                    message.role === "user"
                      ? "bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-medium shadow-lg shadow-cyan-500/10 rounded-tr-none"
                      : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-none"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span
                    className={cn(
                      "text-[10px] mt-2 block opacity-50 font-bold uppercase tracking-tighter",
                      message.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center space-x-3">
                <Bot size={16} className="text-cyan-400 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/5 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <PlusCircle size={24} />
              </button>
            </div>
            <div className="relative flex-1 group">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your health..."
                className="pr-12 bg-white/5 border-white/10 focus:bg-white/10"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-400 hover:bg-cyan-300 text-slate-900 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-cyan-400"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          <p className="text-[10px] text-center text-slate-600 mt-4 uppercase font-bold tracking-[0.2em]">
            Neural insights powered by MediScan Core v2.0
          </p>
        </div>
      </div>
    </div>
  );
};
