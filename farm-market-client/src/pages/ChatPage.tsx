import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Message = {
  senderId?: string | { _id?: string; name?: string; role?: string };
  text: string;
  timestamp?: string;
};

type Chat = {
  _id: string;
  participants?: { _id?: string; name?: string; role?: string }[];
  messages: Message[];
};

function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!conversationId) { setError('Conversation id is missing'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const response = await api.get(`/api/chat/${conversationId}`);
      const payload = response.data?.data;
      setChat(payload);
      setMessages(payload?.messages || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChat(); }, [conversationId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getSenderId = (senderId: Message['senderId']): string => {
    if (!senderId) return '';
    if (typeof senderId === 'string') return senderId;
    return senderId._id || '';
  };

  const getSenderName = (senderId: Message['senderId']): string => {
    if (!senderId) return 'Unknown';
    if (typeof senderId === 'string') return 'User';
    return senderId.name || 'User';
  };

  const isMine = (senderId: Message['senderId']): boolean =>
    !!user && getSenderId(senderId) === user._id;

  const onSend = async () => {
    if (!conversationId || !text.trim()) return;
    setSending(true); setError('');
    try {
      await api.post('/api/chat/message', { conversationId, text: text.trim() });
      setText('');
      await fetchChat();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  if (loading) return <p className="home-state loading"><span className="spinner" /> Loading chat...</p>;
  if (error && !chat) return <p className="home-state error">{error}</p>;

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <h2>Conversation</h2>
        {error && <p className="home-state error" style={{ marginTop: 8 }}>{error}</p>}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="home-state" style={{ margin: 'auto', textAlign: 'center', padding: '48px 24px' }}>
            <p className="empty-state-title">No messages yet</p>
            <p className="empty-state-desc">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const mine = isMine(message.senderId);
            return (
              <div key={`${message.timestamp || 'msg'}-${index}`} className={`chat-bubble-wrap ${mine ? 'mine' : ''}`}>
                {!mine && <span className="chat-sender">{getSenderName(message.senderId)}</span>}
                <div className={`chat-bubble ${mine ? 'mine' : ''}`}>{message.text}</div>
                {message.timestamp && (
                  <span className="chat-time">
                    {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="form-input"
          type="text"
          placeholder="Type a message and press Enter to send"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={sending}
        />
        <button
          className="primary-btn"
          type="button"
          onClick={onSend}
          disabled={sending || !text.trim()}
          style={{ width: 'auto' }}
        >
          {sending
            ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Sending</>
            : 'Send'
          }
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
