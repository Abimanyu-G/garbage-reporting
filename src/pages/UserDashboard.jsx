import { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import Loading from '../components/Loading';
import { complaintAPI } from '../services/api';
import { getUser } from '../utils/auth';

function UserDashboard() {
  const user = getUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    description: '',
    location: '',
    image: null,
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getUserComplaints();
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setMessage({ type: 'error', text: 'Failed to load complaints' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let payload;
      if (formData.image) {
        payload = new FormData();
        payload.append('description', formData.description);
        payload.append('location', formData.location);
        payload.append('image', formData.image);
      } else {
        payload = {
          description: formData.description,
          location: formData.location,
        };
      }

      await complaintAPI.create(payload);

      setMessage({ type: 'success', text: 'Complaint submitted successfully!' });
      setFormData({ description: '', location: '', image: null });
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit complaint',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(900px_circle_at_95%_0%,rgba(14,165,233,0.10),transparent_40%)]">
      <div className="border-b border-slate-200/70">
        <div className="app-container py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Welcome, {user?.name}!
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Submit new issues and track their progress.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={showForm ? 'app-btn-ghost' : 'app-btn-primary'}
            >
              <Plus className="w-5 h-5" />
              <span>{showForm ? 'Close' : 'New complaint'}</span>
            </button>
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

        {showForm && (
          <div className="app-card p-6 mb-8 animate-fadeIn">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Submit a complaint</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Add a short description and location. Photo is optional.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="app-textarea"
                  rows="4"
                  placeholder="Describe the garbage issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Enter the location..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Photo (optional)
                </label>
                <div className="app-card p-4 bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    On phones, you can take a photo directly from the camera.
                  </p>
                </div>
                {formData.image && (
                  <p className="mt-2 text-sm text-slate-600">Selected: {formData.image.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full app-btn-primary py-3"
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        )}

        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                My complaints
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Latest submissions first.
              </p>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading your complaints..." />
          ) : complaints.length === 0 ? (
            <div className="app-card p-10 text-center">
              <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No Complaints Yet
              </h3>
              <p className="text-sm text-slate-500">Submit your first complaint to get started.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  isAdmin={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
