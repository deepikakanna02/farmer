import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Ad = {
  _id: string;
  cropName: string;
  quantity: number;
  pricePerKg: number;
  harvestTime: string;
  description: string;
  farmLocation?: { village?: string; district?: string; state?: string };
  isVerified?: boolean;
  verifiedBy?: string | null;
  farmerId?: { _id: string; name: string } | string;
};

function AdDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    const fetchAd = async () => {
      if (!id) { setError('Ad id is missing'); setLoading(false); return; }
      setLoading(true); setError('');
      try {
        const response = await api.get(`/api/ads/${id}`);
        setAd(response.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch ad details');
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  const onSendOffer = async () => {
    setOfferMessage(''); setOfferSuccess(false);
    if (!id || !offerPrice || Number(offerPrice) <= 0) {
      setOfferMessage('Enter a valid offer price'); return;
    }
    setSendingOffer(true);
    try {
      await api.post('/api/offers', { adId: id, offerPrice: Number(offerPrice) });
      setOfferMessage('Offer sent successfully. The farmer will be notified.');
      setOfferSuccess(true); setOfferPrice('');
    } catch (err: any) {
      setOfferMessage(err?.response?.data?.message || 'Failed to send offer');
    } finally {
      setSendingOffer(false);
    }
  };

  const onStartChat = async (farmerId: string) => {
    setChatError('');
    setStartingChat(true);
    try {
      const res = await api.post('/api/chat', { otherUserId: farmerId, adId: id });
      const chatId = res.data?.data?._id;
      if (chatId) navigate(`/chat/${chatId}`);
    } catch (err: any) {
      setChatError(err?.response?.data?.message || 'Could not start chat');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return <p className="home-state loading"><span className="spinner" /> Loading ad details...</p>;
  if (error) return <p className="home-state error">{error}</p>;
  if (!ad) return <p className="home-state">Ad not found.</p>;

  const location = [ad.farmLocation?.village, ad.farmLocation?.district, ad.farmLocation?.state]
    .filter(Boolean).join(', ');

  return (
    <div className="ad-details-page">
      {/* Left: Ad info */}
      <div className="ad-detail-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <h1 className="ad-detail-title">{ad.cropName}</h1>
          {ad.isVerified || ad.verifiedBy
            ? <span className="verified-badge">Verified</span>
            : <span className="pending-badge">Pending Verification</span>
          }
        </div>

        <div className="ad-meta-grid">
          <div className="ad-meta-item">
            <div className="ad-meta-label">Price per Kg</div>
            <div className="ad-meta-value price">Rs. {ad.pricePerKg}</div>
          </div>
          <div className="ad-meta-item">
            <div className="ad-meta-label">Quantity Available</div>
            <div className="ad-meta-value">{ad.quantity} kg</div>
          </div>
          <div className="ad-meta-item">
            <div className="ad-meta-label">Harvest Date</div>
            <div className="ad-meta-value" style={{ fontSize: 15 }}>
              {ad.harvestTime ? new Date(ad.harvestTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </div>
          </div>
          <div className="ad-meta-item">
            <div className="ad-meta-label">Status</div>
            <div className="ad-meta-value" style={{ fontSize: 15, color: ad.isVerified ? 'var(--success)' : 'var(--primary)' }}>
              {ad.isVerified ? 'Verified' : 'Pending Review'}
            </div>
          </div>
        </div>

        {location && <div className="location-tag">{location}</div>}

        {ad.description && (
          <>
            <p style={{ fontWeight: 700, marginTop: 20, marginBottom: 6, fontSize: 15 }}>About this listing</p>
            <p className="ad-description">{ad.description}</p>
          </>
        )}

        <Link to="/dashboard" className="secondary-btn" style={{ marginTop: 20, display: 'inline-flex', width: 'auto' }}>
          Back to Dashboard
        </Link>
      </div>

      {/* Right: Offer panel (buyers only) */}
      {user?.role === 'buyer' && (
        <div className="offer-box">
          <h3>Make an Offer</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Listed at <strong style={{ color: 'var(--primary)' }}>Rs. {ad.pricePerKg}/kg</strong> — propose your price below
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="offer-price">Your Offer Price (Rs. per kg)</label>
            <input
              id="offer-price"
              className="form-input"
              type="number"
              min="0"
              placeholder={`e.g. ${Math.round(ad.pricePerKg * 0.9)}`}
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </div>

          <button className="primary-btn" type="button" onClick={onSendOffer} disabled={sendingOffer || !user}>
            {sendingOffer
              ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Sending...</>
              : 'Send Offer'
            }
          </button>

          {offerMessage && (
            <p className={`offer-message${offerSuccess ? ' success' : ''}`}>{offerMessage}</p>
          )}

          {/* Start Chat with Farmer */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', textAlign: 'center' }}>or</p>
          <button
            className="secondary-btn"
            type="button"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={startingChat}
            onClick={() => {
              const fId = typeof ad.farmerId === 'string' ? ad.farmerId : ad.farmerId?._id;
              if (fId) onStartChat(fId);
            }}
          >
            {startingChat
              ? <><span className="spinner" /> Starting chat...</>
              : 'Chat with Farmer'
            }
          </button>
          {chatError && <p className="offer-message">{chatError}</p>}
        </div>
      )}

      {/* If not a buyer, show a note */}
      {user && user.role !== 'buyer' && (
        <div className="offer-box">
          <h3>Offer Panel</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Only buyers can submit offers on listings.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdDetailsPage;
