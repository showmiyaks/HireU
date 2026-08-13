import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConversationMessage } from '../types';

export const ConversationalRecruiterPage: React.FC = () => {
  const { candidates, setActiveView } = useApp();
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        'Hello! I am your HireU AI Recruiter Copilot. Ask me anything about your current candidate pool (e.g. "Who has AWS experience?", "Why was Arjun selected over Vikram?", or "Show candidates with notice period < 30 days").',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);

  const exampleQuestions = [
    'Who has the strongest Java & Spring Boot experience?',
    'Show candidates with less than 30 days notice period.',
    'Among shortlisted candidates, who has AWS experience?',
    'Why was Arjun Mehta shortlisted over Ananya Deshmukh?',
    'How many candidates have Docker and Kubernetes skills?',
  ];

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || queryInput;
    if (!textToSend.trim() || loading) return;

    const userMsg: ConversationMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/conversational-recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          candidatesPool: candidates,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ConversationMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'assistant',
          content: data.answerText || "I evaluated the candidate pool regarding your query.",
          timestamp: new Date().toISOString(),
          matchedCandidateIds: data.matchedCandidateIds || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_err_${Date.now()}`,
            role: 'assistant',
            content: "I couldn't find enough information in the candidate pool to answer that.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error querying conversational recruiter:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Module Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shrink-0">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquareCode className="w-5 h-5 text-indigo-600" />
          Candidate Pool Query Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ask questions about candidates, compare profiles, and filter by skills or experience.
        </p>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 custom-scrollbar">
        <span className="text-xs font-semibold text-slate-400 shrink-0">Suggested:</span>
        {exampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(q)}
            className="text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Conversation Window */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          const matchedCands = (msg.matchedCandidateIds || [])
            .map((id) => candidates.find((c) => c.id === id))
            .filter(Boolean);

          return (
            <div
              key={msg.id}
              className={`flex space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 leading-relaxed shadow-2xs ${
                  isAi
                    ? 'bg-slate-50 border border-slate-200 text-slate-800'
                    : 'bg-indigo-600 text-white font-medium'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Render Candidate Result Cards if Matched */}
                {matchedCands.length > 0 && (
                  <div className="border-t border-slate-200/80 pt-3 space-y-2 mt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      Referenced Candidate Profiles ({matchedCands.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedCands.map((cand) => (
                        <div
                          key={cand!.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{cand!.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {cand!.currentRole} • {cand!.totalExperienceYears} yrs
                            </p>
                            <span
                              className={`inline-block mt-1 text-[10px] font-extrabold ${
                                cand!.matchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              Match: {cand!.matchScore}%
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveView('filtered-candidates')}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="View candidate details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[9px] ${
                    isAi ? 'text-slate-400' : 'text-indigo-200'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex space-x-3 items-center text-xs text-indigo-600 font-bold animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span>Evaluating candidate pool database...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
          placeholder="Ask AI recruiter about candidates, skills, match scores..."
          className="flex-1 px-3 py-2 text-xs text-slate-900 outline-none bg-transparent font-medium"
        />
        <button
          onClick={() => handleSendQuery()}
          disabled={loading || !queryInput.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
        >
          <span>Ask Copilot</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
