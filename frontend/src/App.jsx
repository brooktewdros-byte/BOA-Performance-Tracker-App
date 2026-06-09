import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API base URL – will be set by Netlify environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    depositMobilization: '',
    customerAcquisition: '',
    schoolOnboarding: '',
    digitalTransactions: '',
    loanDisbursement: '',
    nonInterestIncome: '',
    reportingDate: new Date().toISOString().split('T')[0],
    comments: ''
  });
  const [reviewQueue, setReviewQueue] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
      if (res.data.role === 'employee') fetchEntries();
      if (['branch_manager', 'district_manager', 'ho_admin'].includes(res.data.role)) fetchReviewQueue();
      fetchDashboard();
    } catch (err) {
      logout();
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/entries/my');
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviewQueue = async () => {
    try {
      let endpoint = '';
      if (user?.role === 'branch_manager') endpoint = '/entries/branch/pending';
      else if (user?.role === 'district_manager') endpoint = '/entries/district/pending';
      else if (user?.role === 'ho_admin') endpoint = '/entries/ho/pending';
      if (endpoint) {
        const res = await axios.get(endpoint);
        setReviewQueue(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setError('');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/entries', formData);
      alert('Entry submitted for review');
      setFormData({
        depositMobilization: '',
        customerAcquisition: '',
        schoolOnboarding: '',
        digitalTransactions: '',
        loanDisbursement: '',
        nonInterestIncome: '',
        reportingDate: new Date().toISOString().split('T')[0],
        comments: ''
      });
      fetchEntries();
      setPage('dashboard');
    } catch (err) {
      alert('Submission failed: ' + err.response?.data?.error);
    }
  };

  const handleReview = async (entryId, action) => {
    const comments = action === 'rejected' ? prompt('Reason for rejection:') : '';
    if (action === 'rejected' && !comments) return;
    try {
      let endpoint = '';
      if (user.role === 'branch_manager') endpoint = `/entries/${entryId}/branch-review`;
      else if (user.role === 'district_manager') endpoint = `/entries/${entryId}/district-review`;
      else if (user.role === 'ho_admin') endpoint = `/entries/${entryId}/ho-review`;
      await axios.put(endpoint, { action, comments });
      alert(`Entry ${action} successfully`);
      fetchReviewQueue();
      fetchDashboard();
    } catch (err) {
      alert('Review failed');
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Bank of Abyssinia</h2>
        <h3>Performance Tracker Login</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={login}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Login</button>
        </form>
        <p style={{ fontSize: '12px', marginTop: '20px' }}>Test credentials: employee@test.com / password123</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{ background: 'white', padding: '10px 20px', display: 'flex', gap: '20px', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => setPage('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: page === 'dashboard' ? 'bold' : 'normal' }}>Dashboard</button>
        {user.role === 'employee' && <button onClick={() => setPage('new-entry')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>New Entry</button>}
        {['branch_manager', 'district_manager', 'ho_admin'].includes(user.role) && <button onClick={() => { setPage('reviews'); fetchReviewQueue(); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Review Queue ({reviewQueue.length})</button>}
        <button onClick={logout} style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </nav>

      <div style={{ padding: '20px' }}>
        {page === 'dashboard' && (
          <div>
            <h2>Dashboard</h2>
            {dashboardData && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>Total Deposits: ETB {dashboardData.summary?.totalDeposit?.toLocaleString() || 0}</div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>Average Score: {dashboardData.summary?.avgScore?.toFixed(1) || 0}%</div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>Entries: {dashboardData.summary?.totalEntries || 0}</div>
                </div>
                {dashboardData.topPerformers && (
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                    <h3>Top Performers</h3>
                    <ul>
                      {dashboardData.topPerformers.map(p => (
                        <li key={p._id}>{p.employeeId?.fullName} - Score: {p.weightedScore}%</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {page === 'new-entry' && user.role === 'employee' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h2>Submit Daily Performance</h2>
            <form onSubmit={handleSubmitEntry}>
              <label>Reporting Date</label>
              <input type="date" value={formData.reportingDate} onChange={(e) => setFormData({ ...formData, reportingDate: e.target.value })} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>Deposit Mobilization (ETB) *40% weight</label>
              <input type="number" value={formData.depositMobilization} onChange={(e) => setFormData({ ...formData, depositMobilization: e.target.value })} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>Customer Acquisition</label>
              <input type="number" value={formData.customerAcquisition} onChange={(e) => setFormData({ ...formData, customerAcquisition: e.target.value })} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>School Onboarding</label>
              <input type="number" value={formData.schoolOnboarding} onChange={(e) => setFormData({ ...formData, schoolOnboarding: e.target.value })} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>Digital Transactions</label>
              <input type="number" value={formData.digitalTransactions} onChange={(e) => setFormData({ ...formData, digitalTransactions: e.target.value })} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>Loan Disbursement (ETB)</label>
              <input type="number" value={formData.loanDisbursement} onChange={(e) => setFormData({ ...formData, loanDisbursement: e.target.value })} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>Non-Interest Income (ETB)</label>
              <input type="number" value={formData.nonInterestIncome} onChange={(e) => setFormData({ ...formData, nonInterestIncome: e.target.value })} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <label>Comments</label>
              <textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} rows="3" style={{ width: '100%', marginBottom: '10px', padding: '8px' }}></textarea>
              <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', width: '100%' }}>Submit for Review</button>
            </form>
          </div>
        )}

        {page === 'reviews' && (
          <div>
            <h2>Review Queue ({reviewQueue.length} pending)</h2>
            {reviewQueue.length === 0 && <p>No pending entries.</p>}
            {reviewQueue.map(entry => (
              <div key={entry._id} style={{ background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
                <p><strong>{entry.employeeId?.fullName}</strong> - {new Date(entry.reportingDate).toLocaleDateString()}</p>
                <p>Deposit: ETB {entry.depositMobilization?.toLocaleString()} | Customers: {entry.customerAcquisition} | Score: {entry.weightedScore}%</p>
                <p>Comments: {entry.comments}</p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleReview(entry._id, 'approved')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => handleReview(entry._id, 'rejected')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;