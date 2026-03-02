import { useState, useEffect } from 'react';
import api from '../../api/axios';

const PendingEnrollments = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Maps to EnrollmentController.getAllEnrollmentRequests
      const res = await api.get('/enrollments');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      if (status === 'PAID') {
        // PATCH /api/v1/enrollments/{id}/status
        await api.patch(`/enrollments/${id}/status`, { enrollmentId: id, status: 'PAID' });
      } else {
        // DELETE /api/v1/enrollments/{id}
        await api.delete(`/enrollments/${id}`);
      }
      fetchRequests();
    } catch (err) {
      alert("Action failed: " + err.response?.data?.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold mb-6">Pending Enrollment Requests</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-gray-400 uppercase text-xs font-bold">
            <th className="py-3 px-2">Student</th>
            <th className="py-3 px-2">Course</th>
            <th className="py-3 px-2">Payment</th>
            <th className="py-3 px-2">Reference</th>
            <th className="py-3 px-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b hover:bg-gray-50 transition">
              <td className="py-4 px-2 font-medium">{req.studentName}</td>
              <td className="py-4 px-2">{req.courseTitle}</td>
              <td className="py-4 px-2 text-sm">{req.paymentMode || 'N/A'}</td>
              <td className="py-4 px-2 text-xs font-mono text-gray-500">{req.transactionReference}</td>
              <td className="py-4 px-2 text-right space-x-2">
                <button onClick={() => handleAction(req.id, 'PAID')} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Approve</button>
                <button onClick={() => handleAction(req.id, 'REJECT')} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingEnrollments;