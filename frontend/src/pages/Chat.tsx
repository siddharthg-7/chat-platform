import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

export default function Chat({ user, setUser }: { user: any; setUser: (user: any) => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChatUser, setNewChatUser] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/conversations/');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = async () => {
    if (!activeConversation) return;
    try {
      const res = await axios.get(`/api/messages/?conversation_id=${activeConversation.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/conversations/start/', { username: newChatUser });
      setConversations([...conversations.filter(c => c.id !== res.data.id), res.data]);
      setActiveConversation(res.data);
      setNewChatUser('');
    } catch (err) {
      alert('Could not start chat. Make sure the user exists.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      const res = await axios.post('/api/messages/', {
        conversation: activeConversation.id,
        text: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout/');
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Welcome, {user.username}</h3>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        
        <form onSubmit={handleStartChat} className="new-chat-form">
          <input 
            type="text" 
            placeholder="New chat username..." 
            value={newChatUser}
            onChange={(e) => setNewChatUser(e.target.value)}
            required
          />
          <button type="submit">+</button>
        </form>

        <div className="conversation-list">
          {conversations.map(conv => {
            const otherUser = conv.participants.find((p: any) => p.id !== user.id);
            return (
              <div 
                key={conv.id} 
                className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="avatar">{otherUser?.username.charAt(0).toUpperCase() || '?'}</div>
                <div className="conv-info">
                  <h4>{otherUser?.username || 'Unknown'}</h4>
                  {conv.last_message && <p>{conv.last_message.text}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-area">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <h2>{activeConversation.participants.find((p: any) => p.id !== user.id)?.username}</h2>
            </div>
            
            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg.id} className={`message-wrapper ${msg.sender.id === user.id ? 'sent' : 'received'}`}>
                  <div className="message">
                    <p>{msg.text}</p>
                    <span className="timestamp">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
