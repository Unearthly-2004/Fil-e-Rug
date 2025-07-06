import React, { useState, useRef } from 'react';
import MosaiaService from '../lib/MosaiaService.js';

const Chatbot: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [service, setService] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleApiKey = () => {
    try {
      setService(new MosaiaService(apiKey));
      setError(null);
    } catch (err: any) {
      setError('Invalid API key');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !service) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);
    setError(null);
    try {
      const response = await service.chat([
        ...messages,
        { role: 'user', content: input }
      ]);
      if (response.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
      } else {
        setError(response.error || 'Unknown error');
      }
    } catch (err: any) {
      setError('Failed to get response');
    } finally {
      setLoading(false);
      setInput('');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <section className="py-16 min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-xl bg-gray-50 rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Mosaia Chatbot</h2>
        {!service ? (
          <div className="mb-4">
            <input
              type="password"
              placeholder="Enter Mosaia API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <button
              onClick={handleApiKey}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              Start Chatting
            </button>
            {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
          </div>
        ) : (
          <>
            <div className="h-80 overflow-y-auto bg-white border rounded p-3 mb-4" style={{ minHeight: 320 }}>
              {messages.length === 0 && <div className="text-gray-400 text-center mt-16">Start the conversation...</div>}
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
            {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
          </>
        )}
      </div>
    </section>
  );
};

export default Chatbot; 