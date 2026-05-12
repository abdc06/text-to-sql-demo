import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Send,
  Database,
  History,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Terminal,
  Table as TableIcon,
  User,
  Bot,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_BASE = 'http://localhost:8000/api/v1';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [expandedItems, setExpandedItems] = useState({}); // SQL/데이터 확장 상태 관리
  const chatEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history/`);
      setChatHistory(res.data.reverse());
    } catch (err) {
      console.error('History fetch failed');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const toggleExpand = (idx, type) => {
    const key = `${idx}-${type}`;
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    const currentQuestion = question;
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/chat/ask?question=${encodeURIComponent(currentQuestion)}`,
      );
      setChatHistory((prev) => [...prev, res.data]);
    } catch (err) {
      alert('Error calling API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] text-gray-800 font-sans">
      {/* 사이드바 */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Pure-DQ AI</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
            Recent Queries
          </div>
          {chatHistory.map((chat, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-600 truncate"
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{chat.question}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col relative">
        {/* 상단바 */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <Database className="w-6 h-6 text-indigo-600" />
            <span className="font-bold">Pure-DQ</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Local LLM Connected
            </div>
          </div>
        </header>

        {/* 대화 피드 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {chatHistory.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Database className="w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold">SQL 분석을 시작하세요</h2>
              <p>자연어로 질문하면 AI가 쿼리를 작성하고 데이터를 가져옵니다.</p>
            </div>
          )}

          {chatHistory.map((chat, idx) => (
            <div key={idx} className="max-w-4xl mx-auto space-y-6">
              {/* 유저 메시지 */}
              <div className="flex justify-end">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm max-w-[80%] flex gap-3 items-start">
                  <p className="leading-relaxed">{chat.question}</p>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* AI 메시지 */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm w-full space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">AI Analyst</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {chat.answer}
                  </p>

                  {/* 아코디언 섹션 */}
                  <div className="space-y-2 pt-2">
                    {/* SQL 쿼리 접기/펴기 */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleExpand(idx, 'sql')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                          <Terminal className="w-4 h-4 text-indigo-500" />{' '}
                          Generated SQL
                        </div>
                        {expandedItems[`${idx}-sql`] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {expandedItems[`${idx}-sql`] && (
                        <div className="p-0 border-t border-gray-100">
                          <SyntaxHighlighter
                            language="sql"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              borderRadius: 0,
                              fontSize: '13px',
                            }}
                          >
                            {chat.sql || chat.sql_query}
                          </SyntaxHighlighter>
                        </div>
                      )}
                    </div>

                    {/* 데이터 결과 접기/펴기 */}
                    {chat.data && chat.data.length > 0 && (
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleExpand(idx, 'data')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                            <TableIcon className="w-4 h-4 text-emerald-500" />{' '}
                            Result Data ({chat.data.length})
                          </div>
                          {expandedItems[`${idx}-data`] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedItems[`${idx}-data`] && (
                          <div className="p-0 border-t border-gray-100 overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                  {Object.keys(chat.data[0]).map((key) => (
                                    <th
                                      key={key}
                                      className="px-4 py-3 border-b"
                                    >
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {chat.data.slice(0, 10).map((row, i) => (
                                  <tr
                                    key={i}
                                    className="bg-white border-b hover:bg-gray-50"
                                  >
                                    {Object.values(row).map((val, j) => (
                                      <td
                                        key={j}
                                        className="px-4 py-3 truncate max-w-[200px]"
                                      >
                                        {String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {chat.data.length > 10 && (
                              <div className="p-2 text-center text-xs text-gray-400 bg-gray-50">
                                상위 10개 항목만 표시됩니다.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="max-w-4xl mx-auto flex items-center gap-3 text-gray-400 animate-pulse">
              <Bot className="w-6 h-6" />
              <span>AI가 데이터를 분석하고 있습니다...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 입력창 (플로팅 스타일) */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
            <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-xl">
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-gray-700 placeholder-gray-400"
                placeholder="질문을 입력하세요... (e.g. 앨범별 평균 가격은?)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-3">
              이 도구는 AI가 생성한 SQL을 사용하므로 결과가 정확하지 않을 수
              있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
