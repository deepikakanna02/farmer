import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Job = {
  _id: string;
  title: string;
  companyName: string;
  description: string;
  salary: string;
  createdBy?: { name: string };
  createdAt: string;
};

type Application = {
  jobId: string;
  status: string;
};

function JobBoardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState('');
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  // Rep: post job form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', companyName: '', description: '', salary: '' });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [jobsRes, appsRes] = await Promise.allSettled([
          api.get('/api/jobs'),
          api.get('/api/jobs/my-applications'),
        ]);
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data?.data || []);
        if (appsRes.status === 'fulfilled') setMyApplications(appsRes.value.data?.data || []);
      } catch (err: any) {
        setError('Failed to load job board');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasApplied = (jobId: string) =>
    myApplications.some((a: any) => (a.jobId?._id || a.jobId) === jobId);

  const onApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      await api.post(`/api/jobs/${jobId}/apply`);
      setMyApplications((prev) => [...prev, { jobId, status: 'applied' }]);
      setFeedback((prev) => ({ ...prev, [jobId]: 'Application submitted!' }));
    } catch (err: any) {
      setFeedback((prev) => ({ ...prev, [jobId]: err?.response?.data?.message || 'Failed to apply' }));
    } finally {
      setApplyingId('');
    }
  };

  const onPostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    if (!form.title || !form.companyName || !form.description || !form.salary) {
      setPostError('All fields are required'); return;
    }
    setPosting(true);
    try {
      const res = await api.post('/api/jobs', form);
      setJobs((prev) => [res.data.data, ...prev]);
      setForm({ title: '', companyName: '', description: '', salary: '' });
      setShowForm(false);
    } catch (err: any) {
      setPostError(err?.response?.data?.message || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <h2>Job Board</h2>
        {user?.role === 'representative' && (
          <button
            className="primary-btn"
            type="button"
            onClick={() => setShowForm((v) => !v)}
            style={{ width: 'auto', padding: '10px 22px' }}
          >
            {showForm ? 'Cancel' : 'Post a Job'}
          </button>
        )}
      </div>

      {/* Post Job Form (rep only) */}
      {showForm && user?.role === 'representative' && (
        <form onSubmit={onPostJob} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: 28, marginBottom: 28, display: 'grid', gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Post a New Job</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input className="form-input" placeholder="e.g. Field Agronomist" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="e.g. AgriCorp India" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Salary</label>
            <input className="form-input" placeholder="e.g. Rs. 25,000/month" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Job responsibilities, requirements, location..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          {postError && <p className="form-error">{postError}</p>}
          <button className="primary-btn" type="submit" disabled={posting} style={{ width: 'auto', padding: '11px 28px' }}>
            {posting ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Posting...</> : 'Post Job'}
          </button>
        </form>
      )}

      {loading && <p className="home-state loading"><span className="spinner" /> Loading jobs...</p>}
      {error && <p className="home-state error">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <div className="home-state">
          <div className="empty-state">
            <p className="empty-state-title">No jobs posted yet</p>
            <p className="empty-state-desc">
              {user?.role === 'representative'
                ? 'Be the first to post a job for farmers and buyers.'
                : 'Check back later for job opportunities.'}
            </p>
          </div>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="jobs-grid">
          {jobs.map((job) => {
            const applied = hasApplied(job._id);
            return (
              <div key={job._id} className="job-card">
                <h3>{job.title}</h3>
                <p className="job-company">{job.companyName}</p>
                <p className="job-salary">{job.salary}</p>
                <p className="job-desc">{job.description}</p>
                {job.createdBy && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Posted by {job.createdBy.name}</p>
                )}

                {user?.role !== 'representative' && (
                  <>
                    {applied ? (
                      <span className="applied-badge">Applied</span>
                    ) : (
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={() => onApply(job._id)}
                        disabled={applyingId === job._id}
                        style={{ padding: '10px 20px' }}
                      >
                        {applyingId === job._id
                          ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Applying...</>
                          : 'Apply Now'
                        }
                      </button>
                    )}
                    {feedback[job._id] && (
                      <p style={{ fontSize: 13, color: applied ? 'var(--success)' : 'var(--danger)', marginTop: 4 }}>
                        {feedback[job._id]}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobBoardPage;
