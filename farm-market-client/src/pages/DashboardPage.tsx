import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type Ad = {
  _id: string;
  cropName: string;
  quantity: number;
  pricePerKg: number;
  isVerified?: boolean;
  farmLocation?: { village?: string; district?: string; state?: string };
  farmerId?: string | { _id: string; name?: string };
};

type ChatConvo = {
  _id: string;
  participants?: { _id: string; name: string; role: string }[];
  adId?: { _id: string; cropName: string } | null;
  messages: { text: string; timestamp: string }[];
  updatedAt: string;
};

function DashboardPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [chats, setChats] = useState<ChatConvo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyingId, setVerifyingId] = useState('');
  const [activeTab, setActiveTab] = useState<'ads' | 'chats'>('ads');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [adsRes, chatsRes] = await Promise.allSettled([
          api.get('/api/ads'),
          api.get('/api/chat'),
        ]);
        if (adsRes.status === 'fulfilled') setAds(adsRes.value.data?.data || []);
        if (chatsRes.status === 'fulfilled') setChats(chatsRes.value.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const onVerify = async (adId: string) => {
    setVerifyingId(adId);
    setError('');
    try {
      await api.put(`/api/ads/${adId}/verify`);
      setAds((prev) => prev.map((ad) => (ad._id === adId ? { ...ad, isVerified: true } : ad)));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to verify ad');
    } finally {
      setVerifyingId('');
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const roleDesc: Record<string, string> = {
    farmer: 'Manage your crop listings and track buyer interest.',
    buyer: 'Browse verified produce and connect with farmers.',
    representative: 'Review and verify pending farm advertisements.',
  };

  const emptyDesc: Record<string, string> = {
    farmer: "You haven't posted any ads yet.",
    buyer: 'No verified produce is available right now.',
    representative: 'No ads are pending verification.',
  };

  const getOtherParticipant = (chat: ChatConvo) => {
    if (!chat.participants) return 'Unknown';
    const other = chat.participants.find((p) => p._id !== user._id);
    return other ? `${other.name} (${other.role})` : 'Unknown';
  };

  const lastMessage = (chat: ChatConvo) =>
    chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages yet';

  return (
    <div className="page-section dashboard-shell">
      <div className="dashboard-header">
        <h2>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</h2>
        <p>{roleDesc[user.role]}</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn${activeTab === 'ads' ? ' active' : ''}`}
          type="button"
          onClick={() => setActiveTab('ads')}
        >
          Listings
        </button>
        <button
          className={`tab-btn${activeTab === 'chats' ? ' active' : ''}`}
          type="button"
          onClick={() => setActiveTab('chats')}
        >
          Messages {chats.length > 0 && <span style={{ marginLeft: 6, background: 'var(--primary)', color: '#fff', borderRadius: 50, fontSize: 11, padding: '1px 7px' }}>{chats.length}</span>}
        </button>
      </div>

      {error && <p className="home-state error" style={{ marginBottom: 20 }}>{error}</p>}
      {loading && <p className="home-state loading"><span className="spinner" /> Loading...</p>}

      {/* ---- ADS TAB ---- */}
      {!loading && activeTab === 'ads' && (
        <>
          {ads.length === 0 ? (
            <div className="home-state">
              <div className="empty-state">
                <p className="empty-state-title">Nothing here yet</p>
                <p className="empty-state-desc">{emptyDesc[user.role]}</p>
                {user.role === 'farmer' && (
                  <Link to="/create-ad" className="primary-btn" style={{ marginTop: 20, display: 'inline-flex', width: 'auto', padding: '11px 24px' }}>
                    Post Your First Ad
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="ads-grid">
              {ads.map((ad) => (
                <div key={ad._id} className="ad-card">
                  <div className="ad-card-header">
                    <h3>{ad.cropName}</h3>
                    {ad.isVerified
                      ? <span className="verified-badge">Verified</span>
                      : <span className="pending-badge">Pending</span>
                    }
                  </div>
                  <p>Quantity: <strong>{ad.quantity} kg</strong></p>
                  <p className="ad-price">Rs. {ad.pricePerKg} / kg</p>
                  {ad.farmLocation && (
                    <p style={{ fontSize: 13 }}>{[ad.farmLocation.village, ad.farmLocation.district, ad.farmLocation.state].filter(Boolean).join(', ')}</p>
                  )}
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <Link to={`/ads/${ad._id}`} className="secondary-btn" style={{ fontSize: 13.5, padding: '8px 16px', flex: 1, justifyContent: 'center' }}>
                      View Details
                    </Link>
                    {user.role === 'representative' && !ad.isVerified && (
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={() => onVerify(ad._id)}
                        disabled={verifyingId === ad._id}
                        style={{ flex: 1, fontSize: 13.5, padding: '8px 16px' }}
                      >
                        {verifyingId === ad._id
                          ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Verifying...</>
                          : 'Verify'
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---- CHATS TAB ---- */}
      {!loading && activeTab === 'chats' && (
        <>
          {chats.length === 0 ? (
            <div className="home-state">
              <div className="empty-state">
                <p className="empty-state-title">No conversations yet</p>
                <p className="empty-state-desc">
                  {user.role === 'buyer'
                    ? 'Browse an ad and click "Chat with Farmer" to start a conversation.'
                    : 'Conversations will appear here once someone messages you.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="offers-list">
              {chats.map((chat) => (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="offer-card" style={{ cursor: 'pointer' }}>
                    <div className="offer-card-info">
                      <h4>{getOtherParticipant(chat)}</h4>
                      {chat.adId && (
                        <p style={{ fontSize: 12.5, color: 'var(--primary)', marginBottom: 4 }}>
                          Re: {chat.adId.cropName}
                        </p>
                      )}
                      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', fontStyle: chat.messages.length === 0 ? 'italic' : 'normal' }}>
                        {lastMessage(chat)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(chat.updatedAt).toLocaleDateString('en-IN')}
                      </span>
                      <span className="secondary-btn" style={{ fontSize: 12.5, padding: '6px 14px' }}>Open</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;
