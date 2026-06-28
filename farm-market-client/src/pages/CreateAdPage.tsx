import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

type FormData = {
  cropName: string; quantity: string; pricePerKg: string;
  harvestTime: string; village: string; district: string;
  state: string; description: string;
};

const initialState: FormData = {
  cropName: '', quantity: '', pricePerKg: '',
  harvestTime: '', village: '', district: '',
  state: '', description: '',
};

function CreateAdPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (Object.values(formData).some((v) => !v.trim())) {
      setError('All fields are required'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/ads', {
        cropName: formData.cropName,
        quantity: Number(formData.quantity),
        pricePerKg: Number(formData.pricePerKg),
        harvestTime: formData.harvestTime,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        description: formData.description,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create advertisement');
    } finally {
      setSubmitting(false);
    }
  };

  const SectionLabel = ({ text }: { text: string }) => (
    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2, marginTop: 10 }}>
      {text}
    </p>
  );

  return (
    <div className="form-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <form className="form-card form-wide" onSubmit={onSubmit}>
        <div>
          <h2>Post a New Ad</h2>
          <p className="form-desc">Fill in the details about your crop listing below.</p>
        </div>

        <SectionLabel text="Crop Information" />

        <div className="form-group">
          <label className="form-label" htmlFor="cropName">Crop Name</label>
          <input id="cropName" className="form-input" name="cropName" placeholder="e.g. Basmati Rice, Alphonso Mango" value={formData.cropName} onChange={onChange} required />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="quantity">Quantity (kg)</label>
            <input id="quantity" className="form-input" name="quantity" type="number" min="1" placeholder="e.g. 500" value={formData.quantity} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pricePerKg">Price per Kg (Rs.)</label>
            <input id="pricePerKg" className="form-input" name="pricePerKg" type="number" min="0" step="0.01" placeholder="e.g. 45.00" value={formData.pricePerKg} onChange={onChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="harvestTime">Harvest Date</label>
          <input id="harvestTime" className="form-input" name="harvestTime" type="date" value={formData.harvestTime} onChange={onChange} required />
        </div>

        <SectionLabel text="Farm Location" />

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="village">Village / Town</label>
            <input id="village" className="form-input" name="village" placeholder="e.g. Nashik" value={formData.village} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="district">District</label>
            <input id="district" className="form-input" name="district" placeholder="e.g. Nashik District" value={formData.district} onChange={onChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="state">State</label>
          <input id="state" className="form-input" name="state" placeholder="e.g. Maharashtra" value={formData.state} onChange={onChange} required />
        </div>

        <SectionLabel text="Additional Details" />

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" className="form-input" name="description" placeholder="Describe the quality, farming method, or anything buyers should know..." value={formData.description} onChange={onChange} rows={4} required />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting
            ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Posting...</>
            : 'Post Ad'
          }
        </button>
      </form>
    </div>
  );
}

export default CreateAdPage;
