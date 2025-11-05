import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, LogOut, Calendar, User } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    // Check if user is logged in
    if (token && user) {
      console.log('User logged in:', user);
    }
  }, [token, user]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <AuthPages setToken={setToken} setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <nav className="bg-blue-50 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Leave Management System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-900">{user.name}</span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-purple-700">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-blue-500 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {user.role === 'admin' ? (
          <AdminDashboard token={token} />
        ) : (
          <EmployeeDashboard token={token} user={user} />
        )}
      </div>
    </div>
  );
};


// Authentication Component
const AuthPages = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
      } else {
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', role: 'employee' });
        setError('✅ Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Calendar className="w-9 h-9 text-blue-700" />
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back User !!!' : 'Hey there !!! '}
          </h2>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
            error.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Agostino Scholes"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="agostinoscholes@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="************"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '', role: 'employee' });
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Employee Dashboard Component
const EmployeeDashboard = ({ token }) => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  },[]);


  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLeaves(data.leave_requests || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };


  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date || !formData.reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all the fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });


    try {
      const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
      setFormData({ start_date: '', end_date: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

    const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-green-1200';
      case 'rejected': return 'bg-red-500 text-red-1200';
      default: return 'bg-yellow-500 text-yellow-1200';
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-9 h-9" />;
      case 'rejected': return <AlertCircle className="w-9 h-9" />;
      default: return <Clock className="w-9 h-9" />;
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <div className="bg-black rounded-xxl shadow-sm p-9">
          <h2 className="text-xl font-bold text-purple-700 mb-1">Request to Leave</h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
              message.type === 'success' ? 'bg-green-500 text-gray-50' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-9 h-9" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-xl text-gray-50 mb-5">
                What's your Starting Date?
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-green-700 focus:ring- focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-xl text-gray-50 mb-5">
                What's your ending date?
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-purple-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-xl text-gray-50 mb-5">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-purple-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide reasons why you want to leave..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 hover:bg-blue-700 transition disabled:opacity-10 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>

       <div>
        <div className="bg-black shadow-sm p-6">
          <h2 className="text-xl font-bold text-purple-700 mb-6">All My Leave Requests</h2>

          {leaves.length === 0 ? (
            <div className="text-center py-12 text-red-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leave requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="border border-purple-600 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-50">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-50 mt-1">
                        Submitted on {new Date(leave.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-50">{leave.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ token }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLeaves(data.leave_requests || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

   const updateStatus = async (leaveId, status) => {
    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchLeaves();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

    const filteredLeaves = filter === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-900 mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-yellow-300 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-900 mb-1">Pending</div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>
        <div className="bg-green-500 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-900 mb-1">Approved</div>
          <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
        </div>
        <div className="bg-red-500 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-900 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">All of the Requests....</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-purple-800 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{leave.user_name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        leave.status === 'approved' ? 'bg-green-400 text-gray-900' :
                        leave.status === 'rejected' ? 'bg-red-400 text-gray-900' :
                        'bg-yellow-400 text-yellow-900'
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">
                      <strong>Period:</strong> {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-900 mt-1">
                      <strong>Submitted:</strong> {new Date(leave.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-900 mt-2">
                      <strong>Reason:</strong> {leave.reason}
                    </div>
                  </div>
                  
                  {leave.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => updateStatus(leave.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(leave.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium"
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
    </div>
  );
};

export default App;

