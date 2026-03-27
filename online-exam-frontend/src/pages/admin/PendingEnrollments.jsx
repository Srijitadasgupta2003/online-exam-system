import { useState, useEffect } from 'react';
import api from '../../api/axios';

const PendingEnrollments = ({ onApproval }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/enrollments');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      if (status === 'PAID') {
        await api.patch(`/enrollments/${id}/status`, { enrollmentId: id, status: 'PAID' });
        onApproval?.();
      } else {
        await api.delete(`/enrollments/${id}`);
      }
      fetchRequests();
    } catch (err) {
      alert("Action failed: " + err.response?.data?.message);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-6 text-white">Pending Enrollment Requests</h3>
      {requests.length === 0 ? (
        <p className="text-gray-400 italic">No pending requests.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 uppercase text-xs font-bold">
              <th className="py-3 px-2">Student</th>
              <th className="py-3 px-2">Course</th>
              <th className="py-3 px-2">Payment</th>
              <th className="py-3 px-2">Reference</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                <td className="py-4 px-2 font-medium text-white">{req.studentName}</td>
                <td className="py-4 px-2 text-gray-300">{req.courseTitle}</td>
                <td className="py-4 px-2 text-sm text-gray-400">{req.paymentMode || 'N/A'}</td>
                <td className="py-4 px-2 text-xs font-mono text-gray-400">{req.transactionReference}</td>
                <td className="py-4 px-2 text-right space-x-2">
                  <button onClick={() => handleAction(req.id, 'PAID')} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700">Approve</button>
                  <button onClick={() => handleAction(req.id, 'REJECT')} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-700">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingEnrollments;
