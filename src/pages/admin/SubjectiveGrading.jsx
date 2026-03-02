import { useState, useEffect } from 'react';
import api from '../../api/axios';

const SubjectiveGrading = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        // Hits SubmissionController.getPendingSubmissions
        const res = await api.get('/submissions/pending');
        setPendingSubmissions(res.data);
      } catch (err) {
        console.error("Failed to fetch pending grades", err);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Subjective Grading Queue</h2>
      {pendingSubmissions.length === 0 ? (
        <p className="text-gray-500 italic">No exams are currently waiting for manual grading.</p>
      ) : (
        <div className="space-y-4">
          {pendingSubmissions.map(sub => (
            <div key={sub.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{sub.studentName}</p>
                <p className="text-sm text-red-600">{sub.examTitle} (Attempt #{sub.attemptNumber})</p>
              </div>
              <button className="bg-slate-900 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition">
                Grade Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectiveGrading;