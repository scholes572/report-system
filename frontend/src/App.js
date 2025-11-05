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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Leave Management System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">{user.name}</span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {isLogin && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>Demo Credentials:</strong><br />
            Admin: admin@company.com / admin123
          </div>
        )}
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
  }, []);


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
      setMessage({ type: 'error', text: 'Please fill in all fields' });
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
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Request Leave</h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide a reason for your leave..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>

       <div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Leave Requests</h2>

          {leaves.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leave requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Submitted on {new Date(leave.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{leave.reason}</p>
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

