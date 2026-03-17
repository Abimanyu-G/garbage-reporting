import { MapPin, Calendar } from 'lucide-react';

function ComplaintCard({ complaint, isAdmin, onStatusUpdate }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'in-process':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'cleaned':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="app-card app-card-hover overflow-hidden">
      {complaint.image && (
        <div className="relative">
          <img
            src={complaint.image}
            alt="Complaint"
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
        </div>
      )}

      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-slate-900 flex-1 leading-snug">
            {complaint.description}
          </h3>
        </div>

        <div className="flex items-center text-slate-600 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{complaint.location}</span>
        </div>

        <div className="flex items-center text-slate-500 text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(complaint.createdAt || new Date())}</span>
        </div>

        {isAdmin && complaint.userName && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Reported by:</span> {complaint.userName}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200/70">
          {isAdmin ? (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={complaint.status}
                onChange={(e) => onStatusUpdate(complaint.id, e.target.value)}
                className={`app-pill cursor-pointer bg-white ${getStatusColor(complaint.status)} focus:outline-none focus:ring-4 focus:ring-emerald-100`}
              >
                <option value="pending">Pending</option>
                <option value="in-process">In Process</option>
                <option value="cleaned">Cleaned</option>
              </select>
            </div>
          ) : (
            <span
              className={`app-pill ${getStatusColor(complaint.status)}`}
            >
              {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('-', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintCard;
