import { useState, useEffect } from 'react';
import api from '../../api/axios';

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UnlockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

const LockedStudents = () => {
  const [lockedEnrollments, setLockedEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLockedStudents();
  }, []);

  const fetchLockedStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enrollments/status/EXAM_LOCKED');
      setLockedEnrollments(res.data);
    } catch (err) {
      console.error("Failed to fetch locked students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to unlock this student? They will get 1 more attempt.')) {
      return;
    }
    try {
      await api.post(`/enrollments/${enrollmentId}/unlock`);
      alert('Student unlocked successfully!');
      fetchLockedStudents();
    } catch (err) {
      alert('Failed to unlock: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Locked Students</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Students who have exceeded 3 failed attempts</p>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : lockedEnrollments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">No locked students found.</p>
      ) : (
        <div className="space-y-4">
          {lockedEnrollments.map(enrollment => (
            <div key={enrollment.id} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{enrollment.studentName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Course: {enrollment.courseTitle}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <LockIcon /> EXAM_LOCKED (3/3 failed attempts)
                  </p>
                </div>
                <button
                  onClick={() => handleUnlock(enrollment.id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <UnlockIcon /> Unlock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LockedStudents;
