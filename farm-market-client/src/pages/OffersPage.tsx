import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Offer = {
  _id: string;
  offerPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  adId?: { _id: string; cropName: string; pricePerKg: number };
  buyerId?: { name: string; email: string; contactNumber?: string };
};

function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState('');
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await api.get('/api/offers/my');
        setOffers(res.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onRespond = async (offerId: string, action: 'accept' | 'reject') => {
    setRespondingId(offerId);
    try {
      const res = await api.put(`/api/offers/${offerId}/respond`, { action });
      const updated: Offer = res.data?.data;
      setOffers((prev) => prev.map((o) => (o._id === offerId ? { ...o, status: updated.status } : o)));
      setFeedback((prev) => ({ ...prev, [offerId]: action === 'accept' ? 'Offer accepted!' : 'Offer rejected.' }));
    } catch (err: any) {
      setFeedback((prev) => ({ ...prev, [offerId]: err?.response?.data?.message || 'Failed to respond' }));
    } finally {
      setRespondingId('');
    }
  };

  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <h2>{user?.role === 'buyer' ? 'My Sent Offers' : 'Offers on My Ads'}</h2>
      </div>

      {loading && <p className="home-state loading"><span className="spinner" /> Loading offers...</p>}
      {error && <p className="home-state error">{error}</p>}

      {!loading && !error && offers.length === 0 && (
        <div className="home-state">
          <div className="empty-state">
            <p className="empty-state-title">No offers yet</p>
            <p className="empty-state-desc">
              {user?.role === 'buyer'
                ? 'You have not sent any offers yet. Browse ads and make an offer.'
                : 'You have not received any offers yet. Make sure your ads are verified.'}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="offers-list">
          {offers.map((offer) => (
            <div key={offer._id} className="offer-card">
              <div className="offer-card-info">
                {offer.adId && (
                  <h4>{offer.adId.cropName}</h4>
                )}
                {user?.role === 'farmer' && offer.buyerId && (
                  <p>
                    Buyer: <strong>{offer.buyerId.name}</strong>
                    {offer.buyerId.email && <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>{offer.buyerId.email}</span>}
                    {offer.buyerId.contactNumber && <span style={{ marginLeft: 8 }}> — {offer.buyerId.contactNumber}</span>}
                  </p>
                )}
                {offer.adId?.pricePerKg && (
                  <p>Listed price: Rs. {offer.adId.pricePerKg}/kg</p>
                )}
                <p>Submitted: {new Date(offer.createdAt).toLocaleDateString('en-IN')}</p>
                {feedback[offer._id] && (
                  <p style={{ fontSize: 13, marginTop: 4, color: offer.status === 'accepted' ? 'var(--success)' : 'var(--danger)' }}>
                    {feedback[offer._id]}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <span className="offer-amount">Rs. {offer.offerPrice}/kg</span>
                <span className={`offer-status-badge ${offer.status}`}>{statusLabel[offer.status]}</span>

                {/* Farmer: accept / reject pending offers */}
                {user?.role === 'farmer' && offer.status === 'pending' && (
                  <div className="offer-actions">
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={() => onRespond(offer._id, 'accept')}
                      disabled={respondingId === offer._id}
                      style={{ fontSize: 13, padding: '8px 16px' }}
                    >
                      Accept
                    </button>
                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => onRespond(offer._id, 'reject')}
                      disabled={respondingId === offer._id}
                      style={{ fontSize: 13, padding: '8px 16px' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OffersPage;
