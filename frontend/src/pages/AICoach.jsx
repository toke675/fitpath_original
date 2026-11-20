import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { API_URL, apiRequest, localCoachReply } from "../lib/api.js";
import {
  IconChat,
  IconSparkles,
  IconLightning,
  IconArrowRight,
} from "../components/Icons.jsx";

const SUGGESTED_QUESTIONS = [
  "I only have 25 minutes today.",
  "I don't have gym equipment.",
  "I missed yesterday's workout.",
  "My hamstrings feel slightly tight.",
];

export default function AICoach() {
  const { profile, plan, today } = useApp();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hey ${profile.name?.split(" ")[0] || "there"}! I'm your dedicated FitPath AI Coach. I have your full ${plan.sport} progression plan loaded, along with your equipment and schedule. How can I assist your training today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const ctx = {
    sport: plan.sport,
    experience: profile.experienceLevel,
    equipment: profile.equipment,
    today: today?.day,
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      let reply;
      if (API_URL) {
        const res = await apiRequest("/api/ai/chat", {
          method: "POST",
          body: { message: text, planContext: ctx },
        });
        reply = res.reply;
      } else {
        await new Promise((r) => setTimeout(r, 400));
        reply = localCoachReply(text, ctx);
      }
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I ran into an error connecting to the coach service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (q) => {
    setInput(q);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-32px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-line/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accentDim p-0.5 shadow-glow flex items-center justify-center text-ink">
            <IconSparkles className="w-5 h-5 text-ink fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold text-bone">FitPath AI Coach</h1>
              <span className="badge-neon py-0.2 px-1.5 text-[9px]">ONLINE</span>
            </div>
            <p className="text-[11px] text-mist">
              {API_URL ? "Connected to backend AI service" : "Local athletic heuristic engine"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className={`flex items-start gap-3 max-w-[88%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border ${
                  isUser
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "bg-surfaceRaised border-line text-mist"
                }`}
              >
                {isUser ? "You" : "⚡"}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-accent text-ink font-medium rounded-tr-sm shadow-glow-sm"
                    : "card text-bone rounded-tl-sm border-line/80"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-mist text-xs pl-10">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span>Coach is analyzing your training plan...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="pt-2 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              className="text-[11px] px-3 py-1.5 rounded-xl bg-surfaceRaised border border-line text-mist hover:text-bone hover:border-accent/40 transition-colors shrink-0 whitespace-nowrap"
              onClick={() => handleQuickPrompt(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={send} className="flex gap-2 shrink-0">
        <input
          className="input-base flex-1 text-sm py-3"
          placeholder="Ask about drills, modify today's workout, or request advice..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary px-6 py-3 shrink-0 shadow-glow flex items-center gap-2"
        >
          <span>Send</span>
          <IconArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-[10px] text-mist/60 text-center mt-2 shrink-0">
        The AI Coach cannot provide medical advice. For sharp pain or injury, see a medical professional.
      </p>
    </div>
  );
}
