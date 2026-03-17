import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import Loading from '../components/Loading';
import { complaintAPI } from '../services/api';
import { getUser } from '../utils/auth';

function AdminDashboard() {
  const user = getUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAllComplaints();
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setMessage({ type: 'error', text: 'Failed to load complaints' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await complaintAPI.updateStatus(id, newStatus);
      setComplaints(
        complaints.map((complaint) =>
          complaint.id === id ? { ...complaint, status: newStatus } : complaint
        )
      );
      setMessage({ type: 'success', text: 'Status updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update status',
      });
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const getStats = () => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      inProcess: complaints.filter((c) => c.status === 'in-process').length,
      cleaned: complaints.filter((c) => c.status === 'cleaned').length,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(900px_circle_at_95%_0%,rgba(14,165,233,0.10),transparent_40%)]">
      <div className="border-b border-slate-200/70">
        <div className="app-container py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/20">
                <Shield className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  Admin dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600">Manage all complaints, {user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="app-card p-6">
            <h3 className="text-slate-600 text-sm font-medium">Total</h3>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">{stats.total}</p>
            <div className="mt-4 h-1.5 w-10 rounded-full bg-emerald-500/70" />
          </div>

          <div className="app-card p-6">
            <h3 className="text-slate-600 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">{stats.pending}</p>
            <div className="mt-4 h-1.5 w-10 rounded-full bg-yellow-400/80" />
          </div>

          <div className="app-card p-6">
            <h3 className="text-slate-600 text-sm font-medium">In process</h3>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">{stats.inProcess}</p>
            <div className="mt-4 h-1.5 w-10 rounded-full bg-sky-500/70" />
          </div>

          <div className="app-card p-6">
            <h3 className="text-slate-600 text-sm font-medium">Cleaned</h3>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">{stats.cleaned}</p>
            <div className="mt-4 h-1.5 w-10 rounded-full bg-emerald-500/70" />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`app-btn ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`app-btn ${
                filter === 'pending'
                  ? 'bg-yellow-400 text-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('in-process')}
              className={`app-btn ${
                filter === 'in-process'
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              In Process ({stats.inProcess})
            </button>
            <button
              onClick={() => setFilter('cleaned')}
              className={`app-btn ${
                filter === 'cleaned'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cleaned ({stats.cleaned})
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-6">
            {filter === 'all' ? 'All Complaints' : `${filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')} Complaints`}
          </h2>

          {loading ? (
            <Loading message="Loading complaints..." />
          ) : filteredComplaints.length === 0 ? (
            <div className="app-card p-10 text-center">
              <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No Complaints Found
              </h3>
              <p className="text-sm text-slate-500">
                {filter === 'all'
                  ? 'No complaints have been submitted yet'
                  : `No ${filter} complaints at the moment`}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  isAdmin={true}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
