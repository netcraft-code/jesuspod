import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoChatbubbleEllipses, IoCloseOutline, IoSend } from "react-icons/io5";
import { FiChevronRight, FiCpu } from "react-icons/fi";
import { AI_CHAT_API_URL } from "../../services/firebase";
import "./AIChat.css";

interface MatchItem {
  id: string;
  title: string;
  category: "podcast" | "radio" | "channel" | "short" | "movie" | "book";
  image?: string;
  url?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  matches?: MatchItem[];
}

const SUGGESTIONS = [
  "Show me podcasts about forgiveness",
  "Find sermons on hope",
  "Christian worship radios",
  "Worship videos & short stories",
];

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your JesusPod AI Assistant. How can I help you find content today? You can search naturally for podcasts, radio stations, channels, short videos, movies, and books.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Listen for open-ai-chat event from Header
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessageText("");
    setIsLoading(true);

    try {
      // API call to cloud function
      const response = await axios.post(AI_CHAT_API_URL, { message: textToSend });
      const { reply, matches } = response.data;

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: reply || "Here are some matching items I found:",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matches: matches || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error("AI Chat API Error:", error);
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: "Sorry, I am having trouble connecting to the AI service right now. Please try again later.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchClick = (item: MatchItem) => {
    setIsOpen(false); // Close chat on navigation
    if (item.category === "podcast") {
      navigate(`/podcastplayer/${item.id}`);
    } else if (item.category === "radio") {
      navigate(`/radio-player`, { state: { radioId: item.id } });
    } else if (item.category === "channel") {
      if (item.url && item.url.startsWith("http")) {
        window.open(item.url, "_blank");
      } else {
        navigate(`/channel-listing`);
      }
    } else if (item.category === "short") {
      navigate(`/shorts`);
    } else if (item.category === "movie") {
      navigate(`/movie/${item.id}`);
    } else if (item.category === "book") {
      navigate(`/book/${item.id}`);
    }
  };

  return (
    <div className="ai-chat-container">
      {/* Floating Toggle Button */}
      <button 
        className="ai-chat-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Search Chat"
      >
        {isOpen ? <IoCloseOutline size={28} /> : <IoChatbubbleEllipses size={26} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-icon">
                <FiCpu size={20} />
              </div>
              <div className="ai-chat-header-text">
                <h3>JesusPod AI Search</h3>
                <p>
                  <span className="ai-chat-status-dot"></span> Online
                </p>
              </div>
            </div>
            <button className="ai-chat-close-btn" onClick={() => setIsOpen(false)}>
              <IoCloseOutline size={22} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.sender}`}>
                <div className="ai-message-bubble">
                  {msg.text}

                  {/* Render matches if available */}
                  {msg.matches && msg.matches.length > 0 && (
                    <div className="ai-matches-container">
                      {msg.matches.map((match) => (
                        <div 
                          key={match.id}
                          className="ai-match-card"
                          onClick={() => handleMatchClick(match)}
                          style={{ cursor: 'pointer' }}
                        >
                          {match.image && (
                            <img 
                              src={match.image} 
                              alt={match.title} 
                              className="ai-match-thumb"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1438243142297-b996b24c0aa1?q=80&w=200&auto=format&fit=crop";
                              }}
                            />
                          )}
                          <div className="ai-match-info">
                            <span className={`ai-match-category ${match.category}`}>
                              {match.category}
                            </span>
                            <h4 className="ai-match-title">{match.title}</h4>
                          </div>
                          <div className="ai-match-action-icon">
                            <FiChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="ai-message-time">{msg.time}</span>
              </div>
            ))}

            {/* Suggestions on welcome screen */}
            {messages.length === 1 && !isLoading && (
              <div className="ai-chat-suggestions">
                <p>Try asking:</p>
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button 
                    key={idx}
                    className="ai-suggestion-chip"
                    onClick={() => handleSend(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="ai-chat-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-chat-input-area">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask anything..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(messageText)}
              disabled={isLoading}
            />
            <button 
              className="ai-chat-send-btn" 
              onClick={() => handleSend(messageText)}
              disabled={!messageText.trim() || isLoading}
            >
              <IoSend size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
